import { useState, useEffect } from 'react';
import styles from './admin.module.css';

interface HealthItem {
  sourceId: string;
  name: string;
  category: string;
  refreshCadence: string;
  lastRefresh: string | null;
  staleMinutes: number;
  freshness: 'fresh' | 'stale' | 'critical' | 'no-data';
  rowCount: number;
}

function formatAge(minutes: number): string {
  if (minutes < 0) return 'No data';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
}

export default function DataHealth() {
  const [health, setHealth] = useState<HealthItem[]>([]);

  useEffect(() => {
    fetch('/api/admin/sources/health', { credentials: 'include' })
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {});
  }, []);

  const grouped = health.reduce<Record<string, HealthItem[]>>((acc, h) => {
    (acc[h.category] ??= []).push(h);
    return acc;
  }, {});

  return (
    <>
      <h1 className={styles.pageTitle}>
        <i className="fa-solid fa-heart-pulse" /> Data Health
      </h1>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--brand-gold)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            {cat}
          </h3>
          <div className={styles.healthGrid}>
            {items.map((h) => (
              <div key={h.sourceId} className={`${styles.healthCard} ${styles[h.freshness === 'no-data' ? 'noData' : h.freshness]}`}>
                <div className={styles.healthName}>{h.name}</div>
                <div className={styles.healthMeta}>
                  Cadence: {h.refreshCadence} &bull; Rows: {h.rowCount}
                </div>
                <div className={styles.healthMeta}>
                  Last: {h.lastRefresh ? new Date(h.lastRefresh).toLocaleString() : 'Never'}{' '}
                  ({formatAge(h.staleMinutes)})
                </div>
                <span className={`${styles.healthBadge} ${styles[h.freshness === 'no-data' ? 'noData' : h.freshness]}`}>
                  {h.freshness === 'no-data' ? 'No Data' : h.freshness}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
