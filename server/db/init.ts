import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

let db: Database.Database;

const DB_PATH = path.resolve(import.meta.dirname, '../../data/admin.db');

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized — call initDb() first');
  return db;
}

export async function initDb(): Promise<void> {
  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // ── Create tables ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      sourceId   TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      category   TEXT NOT NULL,
      mode       TEXT NOT NULL DEFAULT 'file',
      acceptedFormats TEXT NOT NULL DEFAULT 'csv,json,xlsx',
      refreshCadence TEXT NOT NULL DEFAULT 'monthly',
      lastRefresh TEXT,
      rowCount   INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS upload_history (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      sourceId    TEXT NOT NULL,
      datasetKey  TEXT NOT NULL,
      filename    TEXT NOT NULL,
      format      TEXT NOT NULL,
      rows        INTEGER NOT NULL DEFAULT 0,
      uploadedAt  TEXT NOT NULL,
      publishedAt TEXT,
      status      TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (sourceId) REFERENCES sources(sourceId)
    );

    CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      username     TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL
    );
  `);

  // ── Seed default sources (upsert) ──
  const upsertSource = db.prepare(`
    INSERT OR IGNORE INTO sources (sourceId, name, category, mode, acceptedFormats, refreshCadence)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const defaultSources = [
    ['itsm/incidents', 'ITSM Incidents', 'itsm', 'file', 'csv,json,xlsx', 'weekly'],
    ['itsm/service-requests', 'Service Requests', 'itsm', 'file', 'csv,json,xlsx', 'weekly'],
    ['itsm/sla', 'SLA Management', 'itsm', 'file', 'csv,json,xlsx', 'weekly'],
    ['itsm/problems', 'Problem Management', 'itsm', 'file', 'csv,json,xlsx', 'monthly'],
    ['itsm/changes', 'Change Management', 'itsm', 'file', 'csv,json,xlsx', 'weekly'],
    ['itsm/risk', 'Risk Dashboard', 'itsm', 'file', 'csv,json,xlsx', 'monthly'],
    ['itam/m365', 'M365 Licenses', 'itam', 'file', 'csv,json,xlsx', 'monthly'],
    ['itam/entra', 'Entra ID', 'itam', 'file', 'csv,json,xlsx', 'weekly'],
    ['itam/assets', 'Asset Management', 'itam', 'file', 'csv,json,xlsx', 'monthly'],
    ['itam/lifecycle', 'Asset Lifecycle', 'itam', 'file', 'csv,json,xlsx', 'monthly'],
    ['itam/service-scope', 'Service Scope', 'itam', 'file', 'csv,json,xlsx', 'quarterly'],
    ['itom/observability', 'Observability', 'itom', 'file', 'csv,json,xlsx', 'daily'],
    ['itom/bizapps', 'Business Applications', 'itom', 'file', 'csv,json,xlsx', 'daily'],
    ['itom/techapps', 'Technical Applications', 'itom', 'file', 'csv,json,xlsx', 'daily'],
    ['optimization/finops', 'FinOps', 'optimization', 'file', 'csv,json,xlsx', 'monthly'],
    ['optimization/finops-maturity', 'FinOps Maturity', 'optimization', 'file', 'csv,json,xlsx', 'quarterly'],
    ['optimization/ccoe', 'CCOE (Azure DevOps)', 'optimization', 'file', 'csv,json,xlsx', 'weekly'],
    ['command-center/summary', 'Command Center', 'executive', 'file', 'json', 'daily'],
  ];

  const insertMany = db.transaction(() => {
    for (const s of defaultSources) {
      upsertSource.run(...s);
    }
  });
  insertMany();

  // ── Seed default admin user ──
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const hash = await bcrypt.hash('admin123', 10);
    db.prepare('INSERT INTO users (username, passwordHash) VALUES (?, ?)').run('admin', hash);
    console.log('Default admin user created (admin / admin123)');
  }

  console.log(`Admin database initialized at ${DB_PATH}`);
}
