import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import LangToggle from '../ui/LangToggle';
import styles from './Topbar.module.css';

interface TopbarProps {
  title: string;
  icon?: string;
  dateChips?: string[];
  sourceChip?: { label: string; icon?: string };
}

export default function Topbar({ title, icon, dateChips = [], sourceChip }: TopbarProps) {
  const navigate = useNavigate();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={toggleSidebar} aria-label="Toggle menu">
          <i className="fa-solid fa-bars" />
        </button>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <i className="fa-solid fa-arrow-left" /> Home
        </button>
        <span className={styles.title}>
          {icon && (
            <span className={styles.titleIcon}>
              <i className={icon} />
            </span>
          )}
          {title}
        </span>
      </div>
      <div className={styles.right}>
        {sourceChip && (
          <span className={styles.dateChip}>
            {sourceChip.icon && <i className={sourceChip.icon} />} {sourceChip.label}
          </span>
        )}
        {dateChips.map((chip, i) => (
          <span key={i} className={styles.dateChip}>{chip}</span>
        ))}
        <LangToggle />
        <img
          className={styles.logo}
          src="/assets/ruya-logo-small.svg"
          alt="Ru'ya"
        />
      </div>
    </header>
  );
}
