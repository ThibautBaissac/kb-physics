import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    outDir: '../dist'
  },
  plugins: [
    {
      name: 'artifact-watcher',
      configureServer(server) {
        const artifactsDir = path.resolve(__dirname, 'artifacts');
        try {
          if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });
          fs.watch(artifactsDir, (eventType, filename) => {
            if (filename && filename.endsWith('.json')) {
              server.ws.send({
                type: 'custom',
                event: 'artifact-changed',
                data: { filename, eventType }
              });
            }
          });
        } catch (err) {
          console.warn('[artifact-watcher] Could not watch artifacts dir:', err.message);
        }
      }
    }
  ]
});
