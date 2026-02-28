import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from './auth.js';
import { parseFile } from '../services/parser.js';
import { saveUpload, writeProcessed } from '../services/file-store.js';
import { validate } from '../services/schema-registry.js';
import { getDb } from '../db/init.js';

export const uploadRouter = Router();
uploadRouter.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/admin/upload — upload, parse, validate, and preview
uploadRouter.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const sourceId = req.body.sourceId as string;

    if (!file || !sourceId) {
      res.status(400).json({ error: 'File and sourceId are required' });
      return;
    }

    const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
    if (!['csv', 'json', 'xlsx', 'xls'].includes(ext)) {
      res.status(400).json({ error: `Unsupported format: ${ext}` });
      return;
    }

    // Save raw upload
    const savedPath = saveUpload(file.originalname, file.buffer);

    // Parse
    const parsed = await parseFile(savedPath, ext);

    // Validate if it's a JSON dashboard upload (single-object)
    let validation = { valid: true, errors: [] as string[], warnings: [] as string[] };
    if (ext === 'json' && parsed.rowCount === 1) {
      validation = validate(sourceId, parsed.rows[0] as Record<string, unknown>);
    }

    // Record in upload_history
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO upload_history (sourceId, datasetKey, filename, format, rows, uploadedAt, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      sourceId,
      sourceId.split('/').pop() ?? sourceId,
      file.originalname,
      ext,
      parsed.rowCount,
      new Date().toISOString(),
      'preview',
    );

    res.json({
      uploadId: result.lastInsertRowid,
      filename: file.originalname,
      format: ext,
      headers: parsed.headers,
      sampleRows: parsed.rows.slice(0, 10),
      rowCount: parsed.rowCount,
      validation,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    res.status(500).json({ error: message });
  }
});

// POST /api/admin/publish/:uploadId — write parsed data to processed/
uploadRouter.post('/publish/:uploadId', async (req: Request, res: Response) => {
  try {
    const uploadId = Number(req.params.uploadId);
    const db = getDb();

    const record = db.prepare('SELECT * FROM upload_history WHERE id = ?').get(uploadId) as
      | { id: number; sourceId: string; filename: string; format: string; status: string }
      | undefined;

    if (!record) {
      res.status(404).json({ error: 'Upload not found' });
      return;
    }

    // Re-read the raw uploaded file from the data in the request body (or original upload)
    // For simplicity, the frontend sends the parsed data back for publishing
    const data = req.body.data;
    if (!data) {
      res.status(400).json({ error: 'Data payload required for publishing' });
      return;
    }

    const dest = writeProcessed(record.sourceId, data);

    // Update history
    db.prepare('UPDATE upload_history SET status = ?, publishedAt = ? WHERE id = ?')
      .run('published', new Date().toISOString(), uploadId);

    // Update source row count and lastRefresh
    db.prepare('UPDATE sources SET lastRefresh = ?, rowCount = ? WHERE sourceId = ?')
      .run(new Date().toISOString(), Array.isArray(data) ? data.length : 1, record.sourceId);

    res.json({ ok: true, dest, uploadId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Publish failed';
    res.status(500).json({ error: message });
  }
});
