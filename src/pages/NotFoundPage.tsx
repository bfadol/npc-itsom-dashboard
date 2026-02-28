import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.message}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className={styles.link}>
          <i className="fa-solid fa-house" /> Return to Command Center
        </Link>
      </div>
    </div>
  );
}
