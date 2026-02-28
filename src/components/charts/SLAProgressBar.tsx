import styles from './SLAProgressBar.module.css';

interface SLAProgressBarProps {
  priority: string;
  label: string;
  target: string;
  met: number;
  total: number;
  percentage: number;
  color: 'red' | 'orange' | 'blue' | 'green';
}

const colorMap: Record<string, string> = {
  red: 'var(--color-red)',
  orange: 'var(--color-orange)',
  blue: 'var(--color-blue)',
  green: 'var(--color-green)',
};

export default function SLAProgressBar({
  priority,
  label,
  target,
  met,
  total,
  percentage,
  color,
}: SLAProgressBarProps) {
  const breached = total - met;

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.priority} style={{ color: colorMap[color] }}>
          {priority}
        </span>
        <span className={styles.label}>{label}</span>
        <span className={styles.target}>{target}</span>
      </div>
      <div className={styles.barWrap}>
        <div className={styles.bar}>
          <div
            className={styles.fill}
            style={{ width: `${percentage}%`, background: colorMap[color] }}
          />
        </div>
        <div className={styles.stats}>
          <span className={styles.met}>{met} met</span>
          <span className={styles.breached}>{breached} breached</span>
          <span className={styles.pct}>{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
