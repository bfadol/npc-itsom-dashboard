import { useState, useEffect } from 'react';
import styles from './admin.module.css';

interface HistoryRecord {
  id: number;
  sourceId: string;
  datasetKey: string;
  filename: string;
  format: string;
  rows: number;
  uploadedAt: string;
  publishedAt: string | null;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  published: 'var(--color-green)',
  preview: 'var(--color-orange)',
  pending: 'var(--color-blue)',
  failed: 'var(--color-red)',
};

export default function UploadHistory() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    fetch('/api/admin/sources/history', { credentials: 'include' })
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {});
  }, []);

  return (
    <>
      <h1 className={styles.pageTitle}>
        <i className="fa-solid fa-clock-rotate-left" /> Upload History
      </h1>

      {history.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No uploads yet. Upload data from the Upload page.</p>
      ) : (
        <table className={styles.previewTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Source</th>
              <th>Filename</th>
              <th>Format</th>
              <th>Rows</th>
              <th>Uploaded</th>
              <th>Published</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id}>
                <td>{h.id}</td>
                <td>{h.sourceId}</td>
                <td>{h.filename}</td>
                <td>{h.format.toUpperCase()}</td>
                <td>{h.rows}</td>
                <td>{new Date(h.uploadedAt).toLocaleString()}</td>
                <td>{h.publishedAt ? new Date(h.publishedAt).toLocaleString() : '—'}</td>
                <td>
                  <span style={{
                    fontSize: 8,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    textTransform: 'uppercase',
                    background: `color-mix(in srgb, ${STATUS_COLORS[h.status] ?? 'var(--text-muted)'} 20%, transparent)`,
                    color: STATUS_COLORS[h.status] ?? 'var(--text-muted)',
                  }}>
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
