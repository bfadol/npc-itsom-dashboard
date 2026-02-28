import styles from './DonutChart.module.css';
import { themeColors } from '../../theme/theme';

interface DonutSegment {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
}

export default function DonutChart({
  data,
  size = 140,
  strokeWidth = 22,
  showLegend = true,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;

  return (
    <div className={styles.wrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((seg, i) => {
          const ratio = total > 0 ? seg.value / total : 0;
          const dash = ratio * circumference;
          const offset = -(cumulative / total) * circumference;
          cumulative += seg.value;

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color ?? themeColors.chart[i % themeColors.chart.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
      </svg>
      {showLegend && (
        <div className={styles.legend}>
          {data.map((seg, i) => (
            <div key={i} className={styles.legendItem}>
              <span
                className={styles.legDot}
                style={{ background: seg.color ?? themeColors.chart[i % themeColors.chart.length] }}
              />
              <span>{seg.label}</span>
              <span className={styles.legVal}>{seg.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
