import { Router } from 'express';
import { readdir, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { ARTIFACTS_PATH, safePath } from '../paths.js';

const router = Router();

// GET /api/artifacts — list all saved artifacts (metadata only)
router.get('/artifacts', async (_req, res) => {
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
router.get('/artifacts/:filename', async (req, res) => {
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
router.delete('/artifacts/:filename', async (req, res) => {
  const filePath = safePath(ARTIFACTS_PATH, req.params.filename);
  if (!filePath) { res.status(403).json({ error: 'Forbidden' }); return; }
  try {
    await unlink(filePath);
    res.json({ deleted: req.params.filename });
  } catch {
    res.status(404).json({ error: 'Artifact not found' });
  }
});

export default router;
