import express from 'express';
import cors from 'cors';

import queryRouter from './routes/query.js';
import ingestRouter from './routes/ingest.js';
import artifactsRouter from './routes/artifacts.js';
import chatsRouter from './routes/chats.js';
import pageRouter from './routes/page.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', queryRouter);
app.use('/api', ingestRouter);
app.use('/api', artifactsRouter);
app.use('/api', chatsRouter);
app.use('/api', pageRouter);

export default app;
