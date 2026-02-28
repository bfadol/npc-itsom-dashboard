import fs from 'fs';
import path from 'path';

const DATA_ROOT = path.resolve(import.meta.dirname, '../../data');
const UPLOADS_DIR = path.join(DATA_ROOT, 'uploads');
const PROCESSED_DIR = path.join(DATA_ROOT, 'processed');

/** Ensure runtime directories exist */
export function ensureDirectories(): void {
  for (const dir of [UPLOADS_DIR, PROCESSED_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

/** Save raw uploaded file and return path */
export function saveUpload(filename: string, buffer: Buffer): string {
  ensureDirectories();
  const dest = path.join(UPLOADS_DIR, `${Date.now()}-${filename}`);
  fs.writeFileSync(dest, buffer);
  return dest;
}

/** Write processed JSON to data/processed/{sourceId}.json */
export function writeProcessed(sourceId: string, data: unknown): string {
  ensureDirectories();
  // sourceId is like "itsm/incidents" → create dir "itsm" + file "incidents.json"
  const parts = sourceId.split('/');
  const dir = path.join(PROCESSED_DIR, ...parts.slice(0, -1));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(PROCESSED_DIR, `${sourceId}.json`);
  fs.writeFileSync(dest, JSON.stringify(data, null, 2), 'utf-8');
  return dest;
}

/** Read processed JSON (returns null if not found) */
export function readProcessed(sourceId: string): unknown | null {
  const filePath = path.join(PROCESSED_DIR, `${sourceId}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/** Check if processed data exists and return last modified date */
export function getProcessedInfo(sourceId: string): { exists: boolean; lastModified: string | null; size: number } {
  const filePath = path.join(PROCESSED_DIR, `${sourceId}.json`);
  if (!fs.existsSync(filePath)) return { exists: false, lastModified: null, size: 0 };
  const stat = fs.statSync(filePath);
  return { exists: true, lastModified: stat.mtime.toISOString(), size: stat.size };
}
