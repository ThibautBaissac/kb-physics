import { Router } from 'express';
import { readFile } from 'fs/promises';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { processAgentStream } from '../agent-stream.js';
import type { IngestEvent } from '../types.js';
import { ROOT_PATH, KB_PATH, INGEST_PROMPT_PATH } from '../paths.js';
import { parseAndWriteKBGraph } from '../kb-parser.js';

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
  abortController: AbortController;
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
  const cancelled = () => ingestState?.abortController.signal.aborted;

  try {
    const stream = query({
      prompt: `/kb:fetch ${url}`,
      options: {
        abortController: ingestState!.abortController,
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
  } catch (err: any) {
    if (err.name === 'AbortError' || cancelled()) {
      console.log('[ingest] Cancelled by user');
      emitIngestEvent({ type: 'error', content: 'Ingestion cancelled. The raw source file (if created) is kept — you can re-run /kb:ingest on it later.' });
    } else {
      console.error('[ingest error]', err.message || err);
      emitIngestEvent({ type: 'error', content: err.message || 'Ingest error' });
    }
  } finally {
    // Re-parse graph to reflect any changes (including partial ones from cancellation)
    try {
      parseAndWriteKBGraph();
      emitIngestEvent({ type: 'kb_updated' });
    } catch (parseErr: any) {
      console.error('[ingest] KB parse failed:', parseErr.message);
    }
    emitIngestEvent({ type: 'done' });
    if (ingestState) ingestState.running = false;
  }
}

const router = Router();

// POST /api/ingest — start a background ingest
router.post('/ingest', async (req, res) => {
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
  ingestState = { running: true, url, startedAt: Date.now(), abortController: new AbortController(), events: [], listeners: new Set() };
  runIngest(url, ingestPrompt); // fire-and-forget

  res.json({ status: 'started', url });
});

// POST /api/ingest/cancel — abort a running ingest
router.post('/ingest/cancel', (_req, res) => {
  if (!ingestState?.running) {
    res.status(404).json({ error: 'No ingestion in progress' });
    return;
  }
  ingestState.abortController.abort();
  res.json({ status: 'cancelled' });
});

// GET /api/ingest/status — check current ingest state (for page load)
router.get('/ingest/status', (_req, res) => {
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
router.get('/ingest/events', (req, res) => {
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

export default router;
