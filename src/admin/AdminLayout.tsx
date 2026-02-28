import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './admin.module.css';

const NAV = [
  { to: '/admin/upload', icon: 'fa-solid fa-cloud-arrow-up', label: 'Upload Data' },
  { to: '/admin/sources', icon: 'fa-solid fa-database', label: 'Source Config' },
  { to: '/admin/history', icon: 'fa-solid fa-clock-rotate-left', label: 'Upload History' },
  { to: '/admin/health', icon: 'fa-solid fa-heart-pulse', label: 'Data Health' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { username: string }) => setUser(d.username))
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    navigate('/admin/login');
  };

  if (!user) return null;

  return (
    <div className={styles.adminShell}>
      <nav className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <h2>Admin Portal</h2>
          <p>NPC ITSOM Dashboard</p>
        </div>

        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <i className={n.icon} />
            {n.label}
          </NavLink>
        ))}

        <button className={styles.navItem} onClick={handleLogout} style={{ marginTop: 16 }}>
          <i className="fa-solid fa-right-from-bracket" />
          Logout ({user})
        </button>

        <div className={styles.backLink}>
          <a href="/">
            <i className="fa-solid fa-arrow-left" /> Back to Dashboard
          </a>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
