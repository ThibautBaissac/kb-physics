import dotenv from 'dotenv';
import { resolve } from 'path';
import app from './app.js';

dotenv.config({ path: resolve(import.meta.dirname, '../../.env') });

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`KB Physics API server running on http://localhost:${PORT}`);
  console.log(`Auth: ${process.env.CLAUDE_CODE_OAUTH_TOKEN ? 'CLAUDE_CODE_OAUTH_TOKEN set' : 'No OAuth token found — set it in .env'}`);
});
