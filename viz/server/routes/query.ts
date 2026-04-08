import { Router } from 'express';
import { readFile } from 'fs/promises';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { processAgentStream } from '../agent-stream.js';
import { KB_PATH, ARTIFACTS_PATH, AGENT_PROMPT_PATH } from '../paths.js';

const router = Router();

// POST /api/query — send a prompt to the Claude Agent SDK
router.post('/query', async (req, res) => {
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

export default router;
