import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './AppShell.module.css';

export default function AppShell() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
