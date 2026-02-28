import { useState, type ReactNode } from 'react';
import styles from './DataTable.module.css';

interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortable?: boolean;
  variant?: 'default' | 'severity' | 'event';
}

export default function DataTable<T extends object>({
  columns,
  data,
  sortable = false,
  variant = 'default',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getVal = (row: T, key: string): unknown => (row as Record<string, unknown>)[key];

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = getVal(a, sortKey);
        const bv = getVal(b, sortKey);
        if (av == null || bv == null) return 0;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  const tableClass =
    variant === 'severity'
      ? styles.sevTbl
      : variant === 'event'
        ? styles.eventTbl
        : styles.tbl;

  return (
    <div className={styles.wrap}>
      <table className={tableClass}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.align === 'center' ? styles.tc : col.align === 'right' ? styles.tr : ''}
                onClick={() => handleSort(col.key)}
                style={sortable ? { cursor: 'pointer' } : undefined}
              >
                {col.label}
                {sortKey === col.key && (sortDir === 'asc' ? ' \u25B2' : ' \u25BC')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${col.className ?? ''} ${col.align === 'center' ? styles.tc : col.align === 'right' ? styles.tr : ''}`}
                >
                  {col.render ? col.render(getVal(row, col.key), row) : String(getVal(row, col.key) ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
