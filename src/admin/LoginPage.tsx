import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './admin.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        navigate('/admin/upload');
      } else {
        const data = await res.json();
        setError(data.error ?? 'Login failed');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <h1>Admin Portal</h1>
        <p>NPC ITSOM Dashboard — Data Management</p>

        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className={styles.loginBtn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {error && <div className={styles.loginError}>{error}</div>}
      </form>
    </div>
  );
}
