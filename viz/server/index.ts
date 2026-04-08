import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { parseAndWriteKBGraph } from './kb-parser.js';

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

type IngestEventType = 'text' | 'tool' | 'error' | 'kb_updated' | 'done';
interface IngestEvent { type: IngestEventType; content?: string; tool?: string; detail?: string }

/** Extract a human-readable detail string from a tool_use block. */
function toolEvent(block: ContentBlockToolUse): IngestEvent {
  const name = block.name || '';
  const input = (block.input || {}) as Record<string, string>;
  let detail = '';
  if (name === 'Read' && input.file_path) detail = input.file_path.replace(/.*\/kb\//, 'kb/');
  else if (name === 'Glob' && input.pattern) detail = input.pattern;
  else if (name === 'Grep' && input.pattern) detail = `"${input.pattern}"`;
  else if ((name === 'Write' || name === 'Edit') && input.file_path) detail = input.file_path.replace(/.*\/kb\//, 'kb/');
  else if (name === 'WebFetch' && input.url) detail = input.url.slice(0, 80);
  else if (name === 'Bash' && input.command) detail = input.command.slice(0, 60);
  return { type: 'tool', tool: name, detail };
}

/** Process the SDK agent stream, emitting normalized events via the callback. */
async function processAgentStream(
  stream: AsyncIterable<any>,
  emit: (event: IngestEvent) => void,
) {
  for await (const message of stream) {
    if (message.type === 'assistant') {
      const assistantMsg = message as SDKAssistantMessage;
      const content = assistantMsg.message?.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'text' && block.text) {
            emit({ type: 'text', content: block.text });
          } else if (block.type === 'tool_use') {
            emit(toolEvent(block));
          }
        }
      }
    } else if (message.type === 'result') {
      const resultMsg = message as SDKResultMessage;
      if (resultMsg.subtype === 'success' && resultMsg.result) {
        emit({ type: 'text', content: resultMsg.result });
      }
      if (resultMsg.subtype === 'error_max_turns') {
        emit({ type: 'error', content: 'Agent reached max turns limit.' });
      }
      if ('errors' in resultMsg && resultMsg.errors?.length) {
        console.error('[agent result errors]', resultMsg.errors);
        emit({ type: 'error', content: resultMsg.errors.join('\n') });
      }
    }
  }
}

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
        settingSources: ['project'],
        allowedTools: ['Read', 'Glob', 'Grep', 'Write', 'Skill'],
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

    await processAgentStream(stream, (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });
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

// --- Ingest: background task with reconnectable SSE ---

const INGEST_PROMPT_PATH = resolve(__dirname, 'ingest-prompt.md');
const ROOT_PATH = resolve(__dirname, '../..');

const BASH_ALLOWLIST = [
  /^curl\s+-[sS]*L/,        // curl downloads (arXiv PDFs)
  /^mkdir\s+-p\s/,           // create directories
  /^ls\b/,                   // list files
  /^cat\b/,                  // read files
  /^wc\b/,                   // word count
  /^head\b/,                 // read file head
  /^test\b/,                 // file existence checks
  /^\[\s/,                   // [ -f ... ] checks
];

async function bashAuditHook(input: any) {
  if (input.hook_event_name !== 'PreToolUse') return {};
  const toolInput = input.tool_input as { command?: string };
  const cmd = (toolInput.command || '').trim();

  if (BASH_ALLOWLIST.some(p => p.test(cmd))) return {};

  console.warn(`[ingest] Bash blocked: ${cmd.slice(0, 120)}`);
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse' as const,
      permissionDecision: 'deny' as const,
      permissionDecisionReason: `Bash command not in allowlist for ingest: ${cmd.slice(0, 100)}`,
    },
  };
}

let ingestState: {
  running: boolean;
  url: string;
  startedAt: number;
  events: IngestEvent[];
  listeners: Set<(event: IngestEvent) => void>;
} | null = null;

function emitIngestEvent(event: IngestEvent) {
  if (!ingestState) return;
  ingestState.events.push(event);
  for (const listener of ingestState.listeners) {
    try { listener(event); } catch { /* client gone */ }
  }
}

/** Runs the agent in the background. Not tied to any HTTP request. */
async function runIngest(url: string, ingestPrompt: string) {
  try {
    const stream = query({
      prompt: `/kb:fetch ${url}`,
      options: {
        cwd: ROOT_PATH,
        additionalDirectories: [KB_PATH],
        settingSources: ['project'],
        allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebFetch', 'Bash', 'Skill'],
        permissionMode: 'acceptEdits',
        model: 'claude-sonnet-4-5-20250929',
        maxTurns: 80,
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: ingestPrompt,
        },
        hooks: {
          PreToolUse: [{ matcher: 'Bash', hooks: [bashAuditHook] }],
        },
      },
    });

    await processAgentStream(stream, emitIngestEvent);

    // Re-parse KB graph after successful ingestion
    try {
      parseAndWriteKBGraph();
      emitIngestEvent({ type: 'kb_updated' });
    } catch (parseErr: any) {
      console.error('[ingest] KB parse failed:', parseErr.message);
      emitIngestEvent({ type: 'error', content: 'Ingestion succeeded but graph refresh failed. Run npm run parse manually.' });
    }
  } catch (err: any) {
    console.error('[ingest error]', err.message || err);
    emitIngestEvent({ type: 'error', content: err.message || 'Ingest error' });
  } finally {
    emitIngestEvent({ type: 'done' });
    if (ingestState) ingestState.running = false;
  }
}

// POST /api/ingest — start a background ingest
app.post('/api/ingest', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'url is required' });
    return;
  }

  if (ingestState?.running) {
    res.status(409).json({ error: 'An ingestion is already in progress' });
    return;
  }

  let ingestPrompt: string;
  try {
    ingestPrompt = await readFile(INGEST_PROMPT_PATH, 'utf-8');
  } catch {
    res.status(500).json({ error: 'Could not read ingest prompt' });
    return;
  }

  // Reset state and start background task
  ingestState = { running: true, url, startedAt: Date.now(), events: [], listeners: new Set() };
  runIngest(url, ingestPrompt); // fire-and-forget

  res.json({ status: 'started', url });
});

// GET /api/ingest/status — check current ingest state (for page load)
app.get('/api/ingest/status', (_req, res) => {
  if (!ingestState) {
    res.json({ running: false });
    return;
  }
  res.json({
    running: ingestState.running,
    url: ingestState.url,
    startedAt: ingestState.startedAt,
    eventCount: ingestState.events.length,
  });
});

// GET /api/ingest/events — SSE stream; replays buffered events then streams live
app.get('/api/ingest/events', (req, res) => {
  if (!ingestState) {
    res.status(404).json({ error: 'No ingest in progress or recently completed' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Replay all buffered events so the client catches up
  for (const event of ingestState.events) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  // If already done, close immediately
  if (!ingestState.running) {
    res.end();
    return;
  }

  // Subscribe to live events
  const listener = (event: IngestEvent) => {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      if (event.type === 'done') res.end();
    } catch { /* client gone */ }
  };

  ingestState.listeners.add(listener);
  req.on('close', () => {
    ingestState?.listeners.delete(listener);
  });
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
    const pagePath = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
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
