import { Router } from 'express';
import fs from 'fs';
import path from 'path';

export const dataRouter = Router();

// GET /api/data/:sourceId/:datasetKey
dataRouter.get('/:sourceId/:datasetKey', (req, res) => {
  const { sourceId, datasetKey } = req.params;

  // First check processed data directory (from admin uploads)
  const processedPath = path.resolve(
    import.meta.dirname,
    '../../data/processed',
    sourceId,
    `${datasetKey}.json`,
  );

  if (fs.existsSync(processedPath)) {
    res.json(JSON.parse(fs.readFileSync(processedPath, 'utf-8')));
    return;
  }

  // Fall back to seed data
  const seedPath = path.resolve(
    import.meta.dirname,
    '../../src/data/seed',
    sourceId,
    `${datasetKey}.json`,
  );

  if (fs.existsSync(seedPath)) {
    res.json(JSON.parse(fs.readFileSync(seedPath, 'utf-8')));
    return;
  }

  res.status(404).json({ error: `Data not found: ${sourceId}/${datasetKey}` });
});
