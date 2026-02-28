import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  server: {
    proxy: {
      '/api/admin': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'seed-data-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/api/data/')) return next();

          const parts = req.url.replace('/api/data/', '').split('/');
          if (parts.length < 2) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid path' }));
            return;
          }

          const [sourceId, datasetKey] = parts;
          const seedPath = path.resolve(
            __dirname,
            'src/data/seed',
            sourceId,
            `${datasetKey}.json`,
          );

          if (!fs.existsSync(seedPath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Not found: ${sourceId}/${datasetKey}` }));
            return;
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(fs.readFileSync(seedPath, 'utf-8'));
        });
      },
    },
  ],
})
