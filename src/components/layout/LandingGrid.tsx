import { useNavigate } from 'react-router-dom';
import LangToggle from '../ui/LangToggle';
import styles from './LandingGrid.module.css';

interface DashCard {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface DashSection {
  title: string;
  cards: DashCard[];
}

const sections: DashSection[] = [
  {
    title: 'ITSM \u2014 IT SERVICE MANAGEMENT',
    cards: [
      { id: 'incident', label: 'Incident Management', icon: 'fa-solid fa-clipboard-list', path: '/dashboard/incident' },
      { id: 'sr', label: 'Service Requests', icon: 'fa-solid fa-pen-to-square', path: '/dashboard/sr' },
      { id: 'sla', label: 'SLA Management', icon: 'fa-solid fa-chart-bar', path: '/dashboard/sla' },
      { id: 'problem', label: 'Problem Management', icon: 'fa-solid fa-triangle-exclamation', path: '/dashboard/problem' },
      { id: 'change', label: 'Change Management', icon: 'fa-solid fa-arrows-rotate', path: '/dashboard/change' },
      { id: 'risk', label: 'Risk Dashboard', icon: 'fa-solid fa-bullseye', path: '/dashboard/risk' },
    ],
  },
  {
    title: 'ITAM \u2014 IT ASSET MANAGEMENT',
    cards: [
      { id: 'm365', label: 'M365 Licenses', icon: 'fa-solid fa-th-large', path: '/dashboard/m365' },
      { id: 'entra', label: 'Entra ID', icon: 'fa-solid fa-shield-halved', path: '/dashboard/entra' },
      { id: 'asset', label: 'Asset Management', icon: 'fa-solid fa-desktop', path: '/dashboard/asset' },
      { id: 'lifecycle', label: 'Asset Lifecycle', icon: 'fa-solid fa-bolt', path: '/dashboard/lifecycle' },
      { id: 'servicescope', label: 'Service Scope', icon: 'fa-solid fa-ruler-combined', path: '/dashboard/servicescope' },
    ],
  },
  {
    title: 'ITOM \u2014 OBSERVABILITY',
    cards: [
      { id: 'observability', label: 'Observability', icon: 'fa-solid fa-eye', path: '/dashboard/observability' },
      { id: 'bizapps', label: 'Business Applications', icon: 'fa-solid fa-building', path: '/dashboard/bizapps' },
      { id: 'techapps', label: 'Technical Applications', icon: 'fa-solid fa-gear', path: '/dashboard/techapps' },
    ],
  },
  {
    title: 'OPTIMIZATION \u2014 FINOPS & CCOE',
    cards: [
      { id: 'finops', label: 'FinOps', icon: 'fa-solid fa-coins', path: '/dashboard/finops' },
      { id: 'finops-maturity', label: 'FinOps Maturity', icon: 'fa-solid fa-chart-line', path: '/dashboard/finops-maturity' },
      { id: 'ado', label: 'CCOE', icon: 'fa-solid fa-cube', path: '/dashboard/ado' },
    ],
  },
];

export default function LandingGrid() {
  const navigate = useNavigate();

  return (
    <div className={styles.landing}>
      <div className={styles.overlay} />
      <div className={styles.glow} />

      <nav className={styles.landingNav}>
        <div className={styles.npcLogo}>
          <img src="/assets/npc-logo-landscape.svg" alt="NPC" />
        </div>
        <div className={styles.ruyaRight}>
          <LangToggle />
          <img
            className={styles.ruyaImg}
            src="/assets/ruya-logo-small.svg"
            alt="Ru'ya"
          />
        </div>
      </nav>

      <div className={styles.hero}>
        <h1 className={styles.title}>IT Service &amp; Operations Management</h1>
        <p className={styles.subtitle}>National Planning Council — Dashboard Portal</p>

        {sections.map((section) => (
          <div key={section.title} className={styles.sectionWrap}>
            <div className={styles.sectionLabel}>{section.title}</div>
            <div className={styles.grid}>
              {section.cards.map((card) => (
                <div
                  key={card.id}
                  className={styles.card}
                  onClick={() => navigate(card.path)}
                >
                  <div className={styles.cardIcon}>
                    <i className={card.icon} />
                  </div>
                  <div className={styles.cardName}>{card.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className={styles.landingFooter}>
        &copy; 2026 National Planning Council — Powered by Malomatia
      </footer>
    </div>
  );
}
