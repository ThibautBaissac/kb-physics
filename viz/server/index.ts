import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { query } from '@anthropic-ai/claude-agent-sdk';

// Minimal types for the SDK stream messages we consume.
// Importing from the SDK fails tsc due to missing peer dep types
// (@anthropic-ai/sdk, @modelcontextprotocol/sdk).
interface ContentBlockText { type: 'text'; text: string }
interface ContentBlockToolUse { type: 'tool_use'; name: string; input: Record<string, string> }
interface SDKAssistantMessage {
  type: 'assistant';
  message: { content: Array<ContentBlockText | ContentBlockToolUse> };
}
interface SDKResultMessageSuccess {
  type: 'result'; subtype: 'success'; result: string;
}
interface SDKResultMessageError {
  type: 'result'; subtype: 'error_during_execution' | 'error_max_turns' | 'error_max_budget_usd'; errors: string[];
}
type SDKResultMessage = SDKResultMessageSuccess | SDKResultMessageError;

dotenv.config({ path: resolve(import.meta.dirname, '../../.env') });

const __dirname = import.meta.dirname;
const KB_PATH = resolve(__dirname, '../../kb');
const ARTIFACTS_PATH = resolve(__dirname, '../artifacts');
const AGENT_PROMPT_PATH = resolve(__dirname, 'agent-prompt.md');
const CHATS_PATH = resolve(__dirname, '../chats');

const app = express();
app.use(cors());
app.use(express.json());

/** Resolve a user-supplied filename/id within a base directory, rejecting traversal. */
function safePath(base: string, untrusted: string, ext = '.json'): string | null {
  const resolved = resolve(base, untrusted.endsWith(ext) ? untrusted : untrusted + ext);
  if (!resolved.startsWith(base + '/') && resolved !== base) return null;
  return resolved;
}

// POST /api/query — send a prompt to the Claude Agent SDK
app.post('/api/query', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  let systemPrompt: string;
  try {
    systemPrompt = await readFile(AGENT_PROMPT_PATH, 'utf-8');
  } catch {
    res.status(500).json({ error: 'Could not read agent prompt' });
    return;
  }

  // Stream response using SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const abortController = new AbortController();

  // Handle client disconnect
  req.on('close', () => {
    abortController.abort();
  });

  try {
    const stream = query({
      prompt,
      options: {
        abortController,
        cwd: KB_PATH,
        additionalDirectories: [ARTIFACTS_PATH],
        allowedTools: ['Read', 'Glob', 'Grep', 'Write'],
        permissionMode: 'acceptEdits',
        model: 'claude-sonnet-4-5-20250929',
        maxTurns: 50,
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: systemPrompt,
        },
      },
    });

    for await (const message of stream) {
      if (message.type === 'assistant') {
        const assistantMsg = message as SDKAssistantMessage;
        const content = assistantMsg.message?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'text' && block.text) {
              res.write(`data: ${JSON.stringify({ type: 'text', content: block.text })}\n\n`);
            } else if (block.type === 'tool_use') {
              const name = block.name || '';
              const input = (block.input || {}) as Record<string, string>;
              let detail = '';
              if (name === 'Read' && input.file_path) detail = input.file_path.replace(/.*\/kb\//, 'kb/');
              else if (name === 'Glob' && input.pattern) detail = input.pattern;
              else if (name === 'Grep' && input.pattern) detail = `"${input.pattern}"`;
              else if (name === 'Write' && input.file_path) detail = input.file_path.replace(/.*\/viz\//, 'viz/');
              res.write(`data: ${JSON.stringify({ type: 'tool', tool: name, detail })}\n\n`);
            }
          }
        }
      } else if (message.type === 'result') {
        const resultMsg = message as SDKResultMessage;
        if (resultMsg.subtype === 'success' && resultMsg.result) {
          res.write(`data: ${JSON.stringify({ type: 'text', content: resultMsg.result })}\n\n`);
        }
        if (resultMsg.subtype === 'error_max_turns') {
          res.write(`data: ${JSON.stringify({ type: 'error', content: 'Agent reached max turns limit. The task may be too complex for a single query. Try a more specific question.' })}\n\n`);
        }
        if ('errors' in resultMsg && resultMsg.errors?.length) {
          console.error('[result errors]', resultMsg.errors);
          res.write(`data: ${JSON.stringify({ type: 'error', content: resultMsg.errors.join('\n') })}\n\n`);
        }
      }
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.error('[agent error]', err.message || err);
      res.write(`data: ${JSON.stringify({ type: 'error', content: err.message || 'Agent error' })}\n\n`);
    }
  } finally {
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  }
});

// GET /api/artifacts — list all saved artifacts (metadata only)
app.get('/api/artifacts', async (_req, res) => {
  try {
    const files = await readdir(ARTIFACTS_PATH);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const artifacts = [];

    for (const f of jsonFiles) {
      try {
        const raw = await readFile(join(ARTIFACTS_PATH, f), 'utf-8');
        const content = JSON.parse(raw);
        artifacts.push({
          filename: f,
          id: content.id,
          type: content.type,
          title: content.title,
          created: content.created,
          query: content.query,
        });
      } catch {
        // Skip malformed files
      }
    }

    res.json(artifacts);
  } catch {
    res.json([]);
  }
});

// GET /api/artifacts/:filename — get full artifact
app.get('/api/artifacts/:filename', async (req, res) => {
  const filePath = safePath(ARTIFACTS_PATH, req.params.filename);
  if (!filePath) { res.status(403).json({ error: 'Forbidden' }); return; }
  try {
    const content = await readFile(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch {
    res.status(404).json({ error: 'Artifact not found' });
  }
});

// DELETE /api/artifacts/:filename — delete an artifact
app.delete('/api/artifacts/:filename', async (req, res) => {
  const filePath = safePath(ARTIFACTS_PATH, req.params.filename);
  if (!filePath) { res.status(403).json({ error: 'Forbidden' }); return; }
  try {
    await unlink(filePath);
    res.json({ deleted: req.params.filename });
  } catch {
    res.status(404).json({ error: 'Artifact not found' });
  }
});

// GET /api/chats — list all saved chats (metadata only)
app.get('/api/chats', async (_req, res) => {
  try {
    const files = await readdir(CHATS_PATH);
    const chats = [];
    for (const f of files.filter(f => f.endsWith('.json'))) {
      try {
        const raw = await readFile(join(CHATS_PATH, f), 'utf-8');
        const chat = JSON.parse(raw);
        chats.push({
          id: chat.id,
          title: chat.title,
          created: chat.created,
          messageCount: chat.messages?.length || 0,
        });
      } catch { /* skip */ }
    }
    chats.sort((a, b) => (b.created || '').localeCompare(a.created || ''));
    res.json(chats);
  } catch {
    res.json([]);
  }
});

// GET /api/chats/:id — get full chat
app.get('/api/chats/:id', async (req, res) => {
  const filePath = safePath(CHATS_PATH, req.params.id);
  if (!filePath) { res.status(403).json({ error: 'Forbidden' }); return; }
  try {
    const content = await readFile(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch {
    res.status(404).json({ error: 'Chat not found' });
  }
});

// PUT /api/chats/:id — save/update a chat
app.put('/api/chats/:id', async (req, res) => {
  const filePath = safePath(CHATS_PATH, req.params.id);
  if (!filePath) { res.status(403).json({ error: 'Forbidden' }); return; }
  try {
    await writeFile(filePath, JSON.stringify(req.body, null, 2));
    res.json({ saved: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chats/:id — delete a chat
app.delete('/api/chats/:id', async (req, res) => {
  const filePath = safePath(CHATS_PATH, req.params.id);
  if (!filePath) { res.status(403).json({ error: 'Forbidden' }); return; }
  try {
    await unlink(filePath);
    res.json({ deleted: req.params.id });
  } catch {
    res.status(404).json({ error: 'Chat not found' });
  }
});

// GET /api/page/:path — get raw page content from KB
app.get('/api/page/*path', async (req, res) => {
  try {
    const pagePath = req.params.path;
    const filePath = join(KB_PATH, pagePath);

    // Prevent directory traversal
    if (!filePath.startsWith(KB_PATH)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (!existsSync(filePath)) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    const content = await readFile(filePath, 'utf-8');
    res.json({ path: pagePath, content });
  } catch {
    res.status(500).json({ error: 'Failed to read page' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`KB Physics API server running on http://localhost:${PORT}`);
  console.log(`KB path: ${KB_PATH}`);
  console.log(`Artifacts: ${ARTIFACTS_PATH}`);
  console.log(`Auth: ${process.env.CLAUDE_CODE_OAUTH_TOKEN ? 'CLAUDE_CODE_OAUTH_TOKEN set' : 'No OAuth token found — set it in .env'}`);
});
