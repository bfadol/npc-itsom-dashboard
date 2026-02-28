import styles from './GaugeChart.module.css';

interface GaugeChartProps {
  value: number;
  max: number;
  available: number;
  unavailable: number;
  label: string;
  icon?: string;
  width?: number;
  height?: number;
}

export default function GaugeChart({
  value,
  max,
  available,
  unavailable,
  label,
  icon,
  width = 90,
  height = 55,
}: GaugeChartProps) {
  const cx = width / 2;
  const cy = height;
  const r = Math.min(cx - 4, cy - 4);
  const totalArc = Math.PI * r;
  const valueRatio = max > 0 ? value / max : 0;
  const valueDash = valueRatio * totalArc;
  const unavailRatio = max > 0 ? unavailable / max : 0;
  const unavailDash = unavailRatio * totalArc;

  return (
    <div className={styles.deviceCard}>
      <div className={styles.title}>
        {icon && <i className={icon} />}
        {label}
      </div>
      <svg
        className={styles.gauge}
        width={width}
        height={height + 5}
        viewBox={`0 0 ${width} ${height + 5}`}
      >
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(5,27,68,0.40)"
          strokeWidth={7}
          strokeLinecap="round"
        />
        {/* Value (green) arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--color-green-teal)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${valueDash} ${totalArc}`}
        />
        {/* Unavailable (red) arc */}
        {unavailable > 0 && (
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="var(--color-red-bright)"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={`${unavailDash} ${totalArc}`}
            strokeDashoffset={-valueDash}
          />
        )}
      </svg>
      <div className={styles.num}>{value}</div>
      <div className={styles.avail}>
        <span className={styles.availGreen}>{available}</span>
        <span className={styles.availLabel}>Available</span>
        <span className={styles.availRed}>{unavailable}</span>
        <span className={styles.availLabel}>Unavailable</span>
      </div>
    </div>
  );
}
