import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  root: 'src',
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
        fs.watch(artifactsDir, (eventType, filename) => {
          if (filename && filename.endsWith('.json')) {
            server.ws.send({
              type: 'custom',
              event: 'artifact-changed',
              data: { filename, eventType }
            });
          }
        });
      }
    }
  ]
});
