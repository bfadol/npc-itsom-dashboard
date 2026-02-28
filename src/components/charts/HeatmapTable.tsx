import styles from './HeatmapTable.module.css';

interface HeatmapRow {
  date: string;
  hours: Record<string, number>;
}

interface HeatmapTableProps {
  data: HeatmapRow[];
  hours?: string[];
}

const defaultHours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

const levelClass = ['h0', 'h1', 'h2', 'h3', 'h4', 'h5'] as const;

export default function HeatmapTable({ data, hours = defaultHours }: HeatmapTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={styles.tbl}>
        <thead>
          <tr>
            <th className={styles.dateCol}>Date</th>
            {hours.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className={styles.dateCell}>{row.date}</td>
              {hours.map((h) => {
                const level = row.hours[h] ?? 0;
                const cls = levelClass[Math.min(level, 5)];
                return (
                  <td key={h} className={styles[cls]}>
                    {level > 0 ? level : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
