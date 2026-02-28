import { useState, useEffect, useCallback } from 'react';
import styles from './admin.module.css';

interface Source {
  sourceId: string;
  name: string;
  category: string;
  acceptedFormats: string[];
}

interface UploadPreview {
  uploadId: number;
  filename: string;
  format: string;
  headers: string[];
  sampleRows: Record<string, unknown>[];
  rowCount: number;
  validation: { valid: boolean; errors: string[]; warnings: string[] };
}

export default function UploadPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [rawData, setRawData] = useState<unknown>(null);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetch('/api/admin/sources', { credentials: 'include' })
      .then((r) => r.json())
      .then(setSources)
      .catch(() => {});
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    if (!sourceId) {
      setMessage('Please select a data source first');
      return;
    }
    setUploading(true);
    setMessage('');
    setPreview(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sourceId', sourceId);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPreview(data);
        // Store raw data for publishing
        if (data.rowCount === 1 && data.sampleRows.length === 1) {
          setRawData(data.sampleRows[0]);
        } else {
          setRawData(data.sampleRows);
        }
      } else {
        setMessage(data.error ?? 'Upload failed');
      }
    } catch {
      setMessage('Connection failed');
    } finally {
      setUploading(false);
    }
  }, [sourceId]);

  const handlePublish = async () => {
    if (!preview) return;
    setPublishing(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/upload/publish/${preview.uploadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: rawData }),
      });
      if (res.ok) {
        setMessage('Data published successfully! Dashboard will reflect changes on next load.');
        setPreview(null);
        setRawData(null);
      } else {
        const data = await res.json();
        setMessage(data.error ?? 'Publish failed');
      }
    } catch {
      setMessage('Connection failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <>
      <h1 className={styles.pageTitle}>
        <i className="fa-solid fa-cloud-arrow-up" /> Upload Data
      </h1>

      {/* Step 1: Select source */}
      <select
        className={styles.sourceSelect}
        value={sourceId}
        onChange={(e) => { setSourceId(e.target.value); setPreview(null); }}
      >
        <option value="">— Select Data Source —</option>
        {sources.map((s) => (
          <option key={s.sourceId} value={s.sourceId}>
            [{s.category.toUpperCase()}] {s.name}
          </option>
        ))}
      </select>

      {/* Step 2: Drop zone */}
      <div
        className={`${styles.dropzone} ${dragActive ? styles.active : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <i className="fa-solid fa-file-arrow-up" /><br />
        <p>{uploading ? 'Uploading...' : 'Drop CSV, JSON, or XLSX file here — or click to browse'}</p>
        <input id="file-input" type="file" accept=".csv,.json,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFileInput} />
      </div>

      {message && (
        <div className={message.includes('success') ? styles.validationOk : styles.validationErr} style={{ marginTop: 12 }}>
          {message}
        </div>
      )}

      {/* Step 3: Preview */}
      {preview && (
        <div className={styles.previewSection}>
          <h2 className={styles.pageTitle} style={{ fontSize: 16 }}>
            <i className="fa-solid fa-table" /> Data Preview
          </h2>

          <div className={styles.previewInfo}>
            <span className={styles.previewChip}>{preview.filename}</span>
            <span className={styles.previewChip}>{preview.format.toUpperCase()}</span>
            <span className={styles.previewChip}>{preview.rowCount} rows</span>
            <span className={styles.previewChip}>{preview.headers.length} columns</span>
          </div>

          {preview.validation.valid ? (
            <div className={styles.validationOk}>
              <i className="fa-solid fa-check-circle" /> Validation passed
            </div>
          ) : (
            preview.validation.errors.map((e, i) => (
              <div key={i} className={styles.validationErr}>
                <i className="fa-solid fa-xmark-circle" /> {e}
              </div>
            ))
          )}
          {preview.validation.warnings.map((w, i) => (
            <div key={i} className={styles.validationWarn}>
              <i className="fa-solid fa-triangle-exclamation" /> {w}
            </div>
          ))}

          {/* Preview table */}
          <table className={styles.previewTable}>
            <thead>
              <tr>
                {preview.headers.slice(0, 8).map((h) => (
                  <th key={h}>{h}</th>
                ))}
                {preview.headers.length > 8 && <th>...</th>}
              </tr>
            </thead>
            <tbody>
              {preview.sampleRows.slice(0, 5).map((row, i) => (
                <tr key={i}>
                  {preview.headers.slice(0, 8).map((h) => (
                    <td key={h}>{String(row[h] ?? '')}</td>
                  ))}
                  {preview.headers.length > 8 && <td>...</td>}
                </tr>
              ))}
            </tbody>
          </table>

          <button className={styles.publishBtn} onClick={handlePublish} disabled={publishing || !preview.validation.valid}>
            {publishing ? 'Publishing...' : 'Publish to Dashboard'}
          </button>
        </div>
      )}
    </>
  );
}
