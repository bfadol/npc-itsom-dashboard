import styles from './FilterBar.module.css';

interface FilterBarProps {
  children: React.ReactNode;
}

export default function FilterBar({ children }: FilterBarProps) {
  return <div className={styles.bar}>{children}</div>;
}
