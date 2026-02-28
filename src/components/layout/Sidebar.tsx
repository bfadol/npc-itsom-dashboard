import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import styles from './Sidebar.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'ITSM \u2014 IT Service Management',
    items: [
      { id: 'incident', label: 'Incident Management', icon: 'fa-solid fa-clipboard-list', path: '/dashboard/incident' },
      { id: 'sr', label: 'Service Requests', icon: 'fa-solid fa-pen-to-square', path: '/dashboard/sr' },
      { id: 'sla', label: 'SLA Management', icon: 'fa-solid fa-chart-bar', path: '/dashboard/sla' },
      { id: 'problem', label: 'Problem Management', icon: 'fa-solid fa-triangle-exclamation', path: '/dashboard/problem' },
      { id: 'change', label: 'Change Management', icon: 'fa-solid fa-arrows-rotate', path: '/dashboard/change' },
      { id: 'risk', label: 'Risk Dashboard', icon: 'fa-solid fa-bullseye', path: '/dashboard/risk' },
    ],
  },
  {
    title: 'ITAM \u2014 IT Asset Management',
    items: [
      { id: 'm365', label: 'M365 Licenses', icon: 'fa-solid fa-th-large', path: '/dashboard/m365' },
      { id: 'entra', label: 'Entra ID', icon: 'fa-solid fa-shield-halved', path: '/dashboard/entra' },
      { id: 'asset', label: 'Asset Management', icon: 'fa-solid fa-desktop', path: '/dashboard/asset' },
      { id: 'lifecycle', label: 'Asset Lifecycle', icon: 'fa-solid fa-bolt', path: '/dashboard/lifecycle' },
      { id: 'servicescope', label: 'Service Scope', icon: 'fa-solid fa-ruler-combined', path: '/dashboard/servicescope' },
    ],
  },
  {
    title: 'ITOM \u2014 Observability',
    items: [
      { id: 'observability', label: 'Observability', icon: 'fa-solid fa-eye', path: '/dashboard/observability' },
      { id: 'bizapps', label: 'Business Applications', icon: 'fa-solid fa-building', path: '/dashboard/bizapps' },
      { id: 'techapps', label: 'Technical Applications', icon: 'fa-solid fa-gear', path: '/dashboard/techapps' },
    ],
  },
  {
    title: 'Optimization \u2014 FinOps & CCOE',
    items: [
      { id: 'finops', label: 'FinOps', icon: 'fa-solid fa-coins', path: '/dashboard/finops' },
      { id: 'finops-maturity', label: 'FinOps Maturity', icon: 'fa-solid fa-chart-line', path: '/dashboard/finops-maturity' },
      { id: 'ado', label: 'CCOE', icon: 'fa-solid fa-cube', path: '/dashboard/ado' },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const currentPage = location.pathname.split('/').pop();

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <img
            src="/assets/npc-logo-landscape.svg"
            alt="NPC Logo"
          />
          <div className={styles.logoSep} />
        </div>

        <nav className={styles.nav}>
          {navSections.map((section) => (
            <div key={section.title}>
              <div className={styles.navSection}>{section.title}</div>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.navItem} ${currentPage === item.id ? styles.active : ''}`}
                  onClick={() => handleNav(item.path)}
                >
                  <span className={styles.ni}>
                    <i className={item.icon} />
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <img
            src="/assets/ruya-logo-small.svg"
            alt="Ru'ya"
          />
        </div>
      </aside>
    </>
  );
}
