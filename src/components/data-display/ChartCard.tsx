import { type ReactNode } from 'react';
import styles from './ChartCard.module.css';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <div className={styles.title}>
        {title}
        {subtitle && <span className={styles.sub}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
