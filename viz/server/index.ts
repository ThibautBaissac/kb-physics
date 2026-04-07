import express from 'express';
import cors from 'cors';
import { readdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { query } from '@anthropic-ai/claude-agent-sdk';

const __dirname = import.meta.dirname;
const KB_PATH = resolve(__dirname, '../../kb');
const ARTIFACTS_PATH = resolve(__dirname, '../artifacts');
const AGENT_PROMPT_PATH = resolve(__dirname, 'agent-prompt.md');

// Load .env from project root
const envPath = resolve(__dirname, '../../.env');
if (existsSync(envPath)) {
  const envKeys: string[] = [];
  for (const rawLine of readFileSync(envPath, 'utf-8').split('\n')) {
    let trimmed = rawLine.replace(/\r$/, '').trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    // Handle "export KEY=VALUE" syntax
    if (trimmed.startsWith('export ')) trimmed = trimmed.slice(7).trim();
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && val) {
      process.env[key] = val;
      envKeys.push(key);
    }
  }
  console.log(`Loaded .env (${envKeys.length} vars: ${envKeys.join(', ')})`);
} else {
  console.log(`No .env found at ${envPath}`);
}

const app = express();
app.use(cors());
app.use(express.json());

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
      prompt: `${systemPrompt}\n\n---\n\nUser question: ${prompt}`,
      options: {
        abortController,
        cwd: KB_PATH,
        additionalDirectories: [ARTIFACTS_PATH],
        allowedTools: ['Read', 'Glob', 'Grep', 'Write'],
        permissionMode: 'acceptEdits',
        model: 'claude-sonnet-4-5-20250929',
        maxTurns: 15,
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: systemPrompt,
        },
      },
    });

    for await (const message of stream) {
      if (message.type === 'assistant' && message.message?.content) {
        for (const block of message.message.content) {
          if ('text' in block && block.text) {
            res.write(`data: ${JSON.stringify({ type: 'text', content: block.text })}\n\n`);
          }
        }
      } else if (message.type === 'result' && 'result' in message && message.result) {
        res.write(`data: ${JSON.stringify({ type: 'text', content: message.result })}\n\n`);
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
  try {
    const filePath = join(ARTIFACTS_PATH, req.params.filename);
    const content = await readFile(filePath, 'utf-8');
    res.json(JSON.parse(content));
  } catch {
    res.status(404).json({ error: 'Artifact not found' });
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
