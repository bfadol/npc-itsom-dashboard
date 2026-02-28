import styles from './DateChip.module.css';

interface DateChipProps {
  children: React.ReactNode;
  icon?: string;
}

export default function DateChip({ children, icon }: DateChipProps) {
  return (
    <span className={styles.chip}>
      {icon && <i className={icon} />}
      {children}
    </span>
  );
}
