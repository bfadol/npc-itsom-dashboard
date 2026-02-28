import styles from './Badge.module.css';

type BadgeVariant = 'red' | 'orange' | 'green' | 'blue' | 'gray' | 'gold' | 'purple';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  icon?: string;
}

export default function Badge({ variant, children, icon }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {icon && <i className={icon} />}
      {children}
    </span>
  );
}
