import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.css';

interface BackButtonProps {
  to?: string;
  label?: string;
}

export default function BackButton({ to = '/', label = 'Home' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button className={styles.btn} onClick={() => navigate(to)}>
      <i className="fa-solid fa-arrow-left" /> {label}
    </button>
  );
}
