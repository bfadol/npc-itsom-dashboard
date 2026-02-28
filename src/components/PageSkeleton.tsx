import styles from './PageSkeleton.module.css';

interface PageSkeletonProps {
  kpiCount?: number;
  sectionCount?: number;
}

export default function PageSkeleton({ kpiCount = 4, sectionCount = 2 }: PageSkeletonProps) {
  return (
    <div style={{ padding: 'var(--pad-page)' }}>
      {/* KPI row */}
      <div className={styles.kpiRow} style={{ gridTemplateColumns: `repeat(${Math.min(kpiCount, 5)}, 1fr)` }}>
        {Array.from({ length: kpiCount }, (_, i) => (
          <div key={i} className={styles.kpiCard} />
        ))}
      </div>

      {/* Chart sections */}
      {Array.from({ length: sectionCount }, (_, i) => (
        <div key={i} className={styles.sectionRow}>
          <div className={styles.sectionCard} />
          <div className={styles.sectionCard} />
        </div>
      ))}

      {/* Full-width section */}
      <div className={styles.fullCard} />
    </div>
  );
}
