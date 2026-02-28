import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import { dataRouter } from './routes/data.js';
import { authRouter } from './routes/auth.js';
import { uploadRouter } from './routes/upload.js';
import { sourcesRouter } from './routes/sources.js';
import { initDb } from './db/init.js';
import { ensureDirectories } from './services/file-store.js';

const app = express();
const PORT = process.env.PORT ?? 3001;
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy (Azure App Service runs behind a reverse proxy)
if (isProd) {
  app.set('trust proxy', 1);
}

// Validate session secret in production
if (isProd && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET environment variable is required in production');
  process.exit(1);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));

// Session middleware for admin auth
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'npc-itsom-dev-secret-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    },
  }),
);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Data API routes (public — dashboard consumption)
app.use('/api/data', dataRouter);

// Admin API routes
app.use('/api/admin', authRouter);
app.use('/api/admin/upload', uploadRouter);
app.use('/api/admin/sources', sourcesRouter);

// In production, serve built frontend
if (isProd) {
  const distPath = path.resolve(import.meta.dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err.message, err.stack);
  res.status(500).json({ error: isProd ? 'Internal server error' : err.message });
});

// Initialize DB + directories, then start server
async function start() {
  await initDb();
  ensureDirectories();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

start();
