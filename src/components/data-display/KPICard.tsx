import styles from './KPICard.module.css';

interface KPITrend {
  direction: 'up' | 'down' | 'flat';
  delta: string | number;
  label: string;
  isGood?: boolean;
}

interface KPIProgressBar {
  value: number;
  gradient: string;
}

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: KPITrend;
  colorVariant?: 'teal' | 'red' | 'orange' | 'blue' | 'gold' | 'green' | 'purple';
  progressBar?: KPIProgressBar;
  subtitle?: string;
  unit?: string;
  size?: 'default' | 'compact';
  children?: React.ReactNode;
}

export default function KPICard({
  label,
  value,
  icon,
  trend,
  colorVariant,
  progressBar,
  subtitle,
  unit,
  size = 'default',
  children,
}: KPICardProps) {
  const variantClass = colorVariant ? styles[`${colorVariant}L`] : '';

  return (
    <div className={`${styles.card} ${variantClass} ${size === 'compact' ? styles.compact : ''}`}>
      <div className={styles.label}>
        {icon && <i className={icon} />}
        {label}
      </div>
      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      <div className={styles.value}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {trend && (
        <div className={styles.sub}>
          <span className={trend.direction === 'up' ? styles.up : trend.direction === 'down' ? styles.down : ''}>
            <i className={`fa-solid ${trend.direction === 'up' ? 'fa-arrow-up' : trend.direction === 'down' ? 'fa-arrow-down' : 'fa-minus'}`} />{' '}
            {trend.delta}
          </span>
          <span className={styles.trendLabel}>{trend.label}</span>
        </div>
      )}
      {progressBar && (
        <div className={styles.progWrap}>
          <div className={styles.progBar}>
            <div
              className={styles.progFill}
              style={{
                width: `${progressBar.value}%`,
                background: progressBar.gradient,
              }}
            />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
