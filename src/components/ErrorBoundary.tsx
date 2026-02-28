import { Component, type ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.icon}>
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <h2 className={styles.title}>
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </h2>
          <p className={styles.message}>
            {this.state.error?.message ?? 'An unexpected error occurred while rendering this page.'}
          </p>
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={this.handleReset}>
              <i className="fa-solid fa-rotate-right" /> Try Again
            </button>
            <a href="/" className={styles.btnSecondary}>
              <i className="fa-solid fa-house" /> Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
