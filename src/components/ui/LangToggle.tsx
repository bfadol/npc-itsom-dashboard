import { useUIStore } from '../../stores/uiStore';
import styles from './LangToggle.module.css';

export default function LangToggle() {
  const lang = useUIStore((s) => s.lang);
  const toggleLang = useUIStore((s) => s.toggleLang);
  const isAr = lang === 'ar';

  return (
    <div className={styles.toggle}>
      <span className={!isAr ? styles.activeLang : undefined}>English</span>
      <div
        className={`${styles.switch} ${isAr ? styles.switchAr : ''}`}
        onClick={toggleLang}
        role="button"
        tabIndex={0}
        aria-label="Toggle language"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleLang(); }}
      />
      <span className={isAr ? styles.activeLang : undefined}>العربية</span>
    </div>
  );
}
