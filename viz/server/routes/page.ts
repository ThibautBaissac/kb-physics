import { Router } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { KB_PATH } from '../paths.js';

const router = Router();

// GET /api/page/:path — get raw page content from KB
router.get('/page/*path', async (req, res) => {
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

export default router;
