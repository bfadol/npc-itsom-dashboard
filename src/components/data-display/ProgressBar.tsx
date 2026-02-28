import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  label: string;
  value: number;
  gradient?: string;
  color?: string;
  showValue?: boolean;
  valueText?: string;
}

export default function ProgressBar({
  label,
  value,
  gradient,
  color,
  showValue = true,
  valueText,
}: ProgressBarProps) {
  const fillStyle = gradient
    ? { width: `${value}%`, background: gradient }
    : { width: `${value}%`, background: color ?? 'var(--chart-1)' };

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <div className={styles.bar}>
        <div className={styles.fill} style={fillStyle} />
      </div>
      {showValue && (
        <span className={styles.val}>{valueText ?? `${value}%`}</span>
      )}
    </div>
  );
}
