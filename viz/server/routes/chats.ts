import { Router } from 'express';
import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { CHATS_PATH, safePath } from '../paths.js';

const router = Router();

// GET /api/chats — list all saved chats (metadata only)
router.get('/chats', async (_req, res) => {
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
router.get('/chats/:id', async (req, res) => {
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
router.put('/chats/:id', async (req, res) => {
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
router.delete('/chats/:id', async (req, res) => {
  const filePath = safePath(CHATS_PATH, req.params.id);
  if (!filePath) { res.status(403).json({ error: 'Forbidden' }); return; }
  try {
    await unlink(filePath);
    res.json({ deleted: req.params.id });
  } catch {
    res.status(404).json({ error: 'Chat not found' });
  }
});

export default router;
