import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDataSource } from '../data/hooks/useDataSource';
import LiveDot from '../components/ui/LiveDot';
import LangToggle from '../components/ui/LangToggle';
import styles from './CommandCenter.module.css';

/* ── Types ── */
interface Metric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  bad: boolean;
}

interface DomainAction {
  text: string;
  priority: string;
  page: string;
}

interface DomainHealth {
  id: string;
  label: string;
  status: 'critical' | 'warning' | 'healthy';
  score: number;
  headline: string;
  metrics: Metric[];
  actions: DomainAction[];
}

interface UrgentAction {
  domain: string;
  text: string;
  severity: string;
  time: string;
  page: string;
}

interface Trend {
  label: string;
  current: number;
  previous: number;
  unit: string;
  bad: boolean;
}

interface CommandCenterData {
  domainHealth: DomainHealth[];
  urgentActions: UrgentAction[];
  trends: Trend[];
  executiveSummary: string;
}

/* ── Status helpers ── */
const statusColor = (s: string) =>
  s === 'critical' ? '#FF5A65'
  : s === 'warning' || s === 'high' ? '#c97b30'
  : s === 'medium' ? '#4a80d0'
  : s === 'low' ? '#a29576'
  : '#14CA74';

const statusBg = (s: string) =>
  s === 'critical' ? 'rgba(255,90,101,0.12)'
  : s === 'warning' || s === 'high' ? 'rgba(201,123,48,0.12)'
  : s === 'medium' ? 'rgba(74,128,208,0.12)'
  : s === 'low' ? 'rgba(162,149,116,0.10)'
  : 'rgba(20,202,116,0.10)';

const statusBorder = (s: string) =>
  s === 'critical' ? 'rgba(255,90,101,0.3)'
  : s === 'warning' || s === 'high' ? 'rgba(201,123,48,0.25)'
  : s === 'medium' ? 'rgba(74,128,208,0.25)'
  : s === 'low' ? 'rgba(162,149,116,0.2)'
  : 'rgba(20,202,116,0.25)';

const statusLabel = (s: string) =>
  s === 'critical' ? 'CRITICAL'
  : s === 'warning' ? 'NEEDS ATTENTION'
  : s === 'healthy' ? 'HEALTHY'
  : s.toUpperCase();

/* ── HealthScore SVG ── */
function HealthScore({ score, status }: { score: number; status: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const clr = statusColor(status);

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className={styles.healthScore}>
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={r} fill="none" stroke={clr} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 44 44)"
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
      <text x="44" y="40" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700" fontFamily="Rajdhani, sans-serif">{score}</text>
      <text x="44" y="54" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Cairo, sans-serif">/100</text>
    </svg>
  );
}

/* ── PulseDot (local for command center styling) ── */
function PulseDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
        background: color, boxShadow: `0 0 8px ${color}`,
        animation: 'pulse 2s infinite',
      }}
    />
  );
}

/* ── Main Component ── */
export default function CommandCenter() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const { data } = useDataSource<CommandCenterData>('command-center', 'summary');

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const domainHealth = data?.domainHealth ?? [];
  const urgentActions = data?.urgentActions ?? [];
  const trends = data?.trends ?? [];
  const summary = data?.executiveSummary ?? '';

  const critCount = urgentActions.filter(a => a.severity === 'critical').length;
  const highCount = urgentActions.filter(a => a.severity === 'high').length;

  return (
    <div className={styles.page}>
      {/* ── Top Bar ── */}
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.title}>NPC — IT Operations Command Center</div>
          <div className={styles.liveBadge}>
            <LiveDot /> LIVE
          </div>
        </div>
        <div className={styles.topbarRight}>
          <div className={styles.dateChip}>
            {time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            {' · '}
            {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
          {critCount + highCount > 0 && (
            <div className={styles.alertChip}>
              {critCount} Critical · {highCount} High
            </div>
          )}
          <Link to="/dashboards" className={styles.dashboardsLink}>
            All Dashboards →
          </Link>
          <LangToggle />
        </div>
      </div>

      <div className={styles.content}>
        {/* ── Executive Headline ── */}
        <div className={styles.headline}>
          <div className={styles.headlineLabel}>
            Executive Summary — What Needs Your Attention
          </div>
          <div className={styles.headlineText}>{summary}</div>
        </div>

        {/* ── Domain Health Cards ── */}
        <div className={styles.domainGrid}>
          {domainHealth.map((d) => (
            <div
              key={d.id}
              className={`${styles.domainCard} ${selectedDomain === d.id ? styles.domainCardSelected : ''}`}
              onClick={() => setSelectedDomain(selectedDomain === d.id ? null : d.id)}
            >
              <div className={styles.domainCardHeader}>
                <div>
                  <div className={styles.domainLabel}>{d.label}</div>
                  <span
                    className={styles.statusBadge}
                    style={{
                      background: statusBg(d.status),
                      border: `1px solid ${statusBorder(d.status)}`,
                      color: statusColor(d.status),
                    }}
                  >
                    <PulseDot color={statusColor(d.status)} />
                    {statusLabel(d.status)}
                  </span>
                </div>
                <HealthScore score={d.score} status={d.status} />
              </div>

              <div className={styles.domainHeadline} style={{ color: statusColor(d.status) }}>
                {d.headline}
              </div>

              <div className={styles.metricsGrid}>
                {d.metrics.map((m) => (
                  <div key={m.label} className={styles.metricRow}>
                    <span className={styles.metricLabel}>{m.label}</span>
                    <span
                      className={styles.metricValue}
                      style={{
                        color: m.bad
                          ? (m.trend === 'up' ? '#FF5A65' : '#c97b30')
                          : '#14CA74',
                      }}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Two Column: Actions + Trends ── */}
        <div className={styles.twoCol}>
          {/* Left: Urgent Action Queue */}
          <div className={styles.actionPanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                Action Queue — What Needs Decision or Escalation
              </div>
              <div className={styles.panelCount}>{urgentActions.length} items</div>
            </div>

            <div className={styles.actionList}>
              {urgentActions.map((a, i) => (
                <div
                  key={i}
                  className={`${styles.actionItem} ${a.severity === 'critical' ? styles.actionCritical : styles.actionDefault}`}
                  onClick={() => navigate(`/dashboard/${a.page}`)}
                >
                  <div className={styles.severityBar} style={{ background: statusColor(a.severity) }} />
                  <div className={styles.actionContent}>
                    <div className={styles.actionMeta}>
                      <span
                        className={styles.severityTag}
                        style={{
                          color: statusColor(a.severity),
                          background: statusBg(a.severity),
                          border: `1px solid ${statusBorder(a.severity)}`,
                        }}
                      >
                        {a.severity.toUpperCase()}
                      </span>
                      <span className={styles.actionDomain}>{a.domain}</span>
                      <span className={styles.actionTime}>{a.time}</span>
                    </div>
                    <div className={styles.actionText}>{a.text}</div>
                  </div>
                  <div className={styles.actionArrow}>→</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Key Trends */}
          <div className={styles.trendsPanel}>
            <div className={styles.panelTitle} style={{ marginBottom: 16 }}>
              Key Trends — Are Things Getting Better or Worse?
            </div>
            <div className={styles.trendList}>
              {trends.map((t) => {
                const delta = t.current - t.previous;
                const pct = t.previous !== 0
                  ? Math.abs((delta / t.previous) * 100).toFixed(1)
                  : '0';
                const improving = t.bad === false;
                const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '—';
                const color = improving ? '#14CA74' : '#FF5A65';
                const formatted = t.unit === '$'
                  ? `$${t.current.toLocaleString()}`
                  : `${t.current}${t.unit}`;
                const barPct = t.unit === '%'
                  ? t.current
                  : t.unit === '/5'
                    ? (t.current / 5) * 100
                    : Math.min((t.current / (t.previous * 1.5)) * 100, 100);

                return (
                  <div key={t.label} className={styles.trendItem}>
                    <div className={styles.trendHeader}>
                      <span className={styles.trendLabel}>{t.label}</span>
                      <div className={styles.trendValues}>
                        <span className={styles.trendCurrent}>{formatted}</span>
                        <span className={styles.trendDelta} style={{ color }}>
                          {arrow} {pct}%
                        </span>
                      </div>
                    </div>
                    <div className={styles.trendBar}>
                      <div
                        className={styles.trendBarFill}
                        style={{
                          width: `${Math.min(barPct, 100)}%`,
                          background: improving
                            ? 'linear-gradient(90deg, #0a5c3a, #14CA74)'
                            : 'linear-gradient(90deg, #5a0f22, #FF5A65)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Domain Quick-Nav */}
            <div className={styles.quickNav}>
              <div className={styles.quickNavLabel}>Drill Into Domain →</div>
              <div className={styles.quickNavGrid}>
                {[
                  { label: 'ITSM', page: 'incident' },
                  { label: 'ITOM', page: 'observability' },
                  { label: 'ITAM', page: 'm365' },
                  { label: 'FinOps', page: 'finops' },
                ].map((d) => (
                  <Link key={d.label} to={`/dashboard/${d.page}`} className={styles.quickNavItem}>
                    {d.label} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          NPC IT Operations Command Center · Last data refresh:{' '}
          {time.toLocaleTimeString('en-GB')} · Copyright © 2026 Malomatia · RU'YA Platform
        </div>
      </div>
    </div>
  );
}
