import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { resolve } from 'path';

import queryRouter from './routes/query.js';
import ingestRouter from './routes/ingest.js';
import artifactsRouter from './routes/artifacts.js';
import chatsRouter from './routes/chats.js';
import pageRouter from './routes/page.js';

dotenv.config({ path: resolve(import.meta.dirname, '../../.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', queryRouter);
app.use('/api', ingestRouter);
app.use('/api', artifactsRouter);
app.use('/api', chatsRouter);
app.use('/api', pageRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`KB Physics API server running on http://localhost:${PORT}`);
  console.log(`Auth: ${process.env.CLAUDE_CODE_OAUTH_TOKEN ? 'CLAUDE_CODE_OAUTH_TOKEN set' : 'No OAuth token found — set it in .env'}`);
});
