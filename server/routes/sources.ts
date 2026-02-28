import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from './auth.js';
import { getDb } from '../db/init.js';
import { getProcessedInfo } from '../services/file-store.js';

export const sourcesRouter = Router();
sourcesRouter.use(requireAuth);

interface SourceRow {
  sourceId: string;
  name: string;
  category: string;
  mode: string;
  acceptedFormats: string;
  refreshCadence: string;
  lastRefresh: string | null;
  rowCount: number;
}

// GET /api/admin/sources — list all sources with config
sourcesRouter.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const sources = db.prepare('SELECT * FROM sources ORDER BY category, name').all() as SourceRow[];

  const enriched = sources.map((s) => {
    const info = getProcessedInfo(s.sourceId);
    return {
      ...s,
      acceptedFormats: s.acceptedFormats.split(','),
      hasProcessedData: info.exists,
      processedLastModified: info.lastModified,
      processedSize: info.size,
    };
  });

  res.json(enriched);
});

// PUT /api/admin/sources/update — update source config (sourceId in body)
sourcesRouter.put('/update', (req: Request, res: Response) => {
  const sourceId = req.body.sourceId as string;
  const { mode, acceptedFormats, refreshCadence } = req.body as {
    mode?: string;
    acceptedFormats?: string[];
    refreshCadence?: string;
  };

  const db = getDb();
  const existing = db.prepare('SELECT sourceId FROM sources WHERE sourceId = ?').get(sourceId);

  if (!existing) {
    res.status(404).json({ error: 'Source not found' });
    return;
  }

  if (mode) db.prepare('UPDATE sources SET mode = ? WHERE sourceId = ?').run(mode, sourceId);
  if (acceptedFormats) db.prepare('UPDATE sources SET acceptedFormats = ? WHERE sourceId = ?').run(acceptedFormats.join(','), sourceId);
  if (refreshCadence) db.prepare('UPDATE sources SET refreshCadence = ? WHERE sourceId = ?').run(refreshCadence, sourceId);

  res.json({ ok: true });
});

// GET /api/admin/history — upload audit trail
sourcesRouter.get('/history', (_req: Request, res: Response) => {
  const db = getDb();
  const history = db.prepare('SELECT * FROM upload_history ORDER BY uploadedAt DESC LIMIT 100').all();
  res.json(history);
});

// GET /api/admin/health — data freshness per source
sourcesRouter.get('/health', (_req: Request, res: Response) => {
  const db = getDb();
  const sources = db.prepare('SELECT * FROM sources ORDER BY category, name').all() as SourceRow[];

  const now = Date.now();
  const health = sources.map((s) => {
    const info = getProcessedInfo(s.sourceId);
    let staleMinutes = -1;
    let freshness: 'fresh' | 'stale' | 'critical' | 'no-data' = 'no-data';

    if (info.lastModified) {
      staleMinutes = Math.round((now - new Date(info.lastModified).getTime()) / 60000);
      if (staleMinutes < 60) freshness = 'fresh';
      else if (staleMinutes < 1440) freshness = 'stale';
      else freshness = 'critical';
    }

    return {
      sourceId: s.sourceId,
      name: s.name,
      category: s.category,
      refreshCadence: s.refreshCadence,
      lastRefresh: s.lastRefresh ?? info.lastModified,
      staleMinutes,
      freshness,
      rowCount: s.rowCount,
    };
  });

  res.json(health);
});
