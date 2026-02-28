import { useState, useEffect } from 'react';
import styles from './admin.module.css';

interface Source {
  sourceId: string;
  name: string;
  category: string;
  mode: string;
  acceptedFormats: string[];
  refreshCadence: string;
  lastRefresh: string | null;
  rowCount: number;
  hasProcessedData: boolean;
}

export default function SourceConfig() {
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    fetch('/api/admin/sources', { credentials: 'include' })
      .then((r) => r.json())
      .then(setSources)
      .catch(() => {});
  }, []);

  const grouped = sources.reduce<Record<string, Source[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <h1 className={styles.pageTitle}>
        <i className="fa-solid fa-database" /> Source Configuration
      </h1>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--brand-gold)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            {cat}
          </h3>
          <div className={styles.sourceGrid}>
            {items.map((s) => (
              <div key={s.sourceId} className={styles.sourceCard}>
                <h3>{s.name}</h3>
                <div className={styles.sourceMeta}>
                  <span><i className="fa-solid fa-id-badge" /> {s.sourceId}</span>
                  <span><i className="fa-solid fa-toggle-on" /> Mode: {s.mode}</span>
                  <span><i className="fa-solid fa-file" /> Formats: {s.acceptedFormats.join(', ')}</span>
                  <span><i className="fa-solid fa-clock" /> Cadence: {s.refreshCadence}</span>
                  <span><i className="fa-solid fa-calendar" /> Last Refresh: {s.lastRefresh ?? 'Never'}</span>
                  <span><i className="fa-solid fa-table-list" /> Rows: {s.rowCount}</span>
                  <span>
                    <i className={`fa-solid ${s.hasProcessedData ? 'fa-circle-check' : 'fa-circle-xmark'}`}
                       style={{ color: s.hasProcessedData ? 'var(--color-green)' : 'var(--color-red)' }} />
                    {s.hasProcessedData ? 'Data Available' : 'No Processed Data'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
