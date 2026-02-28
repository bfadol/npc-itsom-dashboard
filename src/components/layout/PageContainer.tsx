import { type ReactNode } from 'react';
import styles from './PageContainer.module.css';

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className={styles.container}>
      {children}
      <footer className={styles.footer}>
        NPC IT Service &amp; Operations Management &mdash; Powered by Malomatia
      </footer>
    </div>
  );
}
