import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import SLAProgressBar from '../../components/charts/SLAProgressBar';
import ProgressBar from '../../components/data-display/ProgressBar';
import common from './itsm-common.module.css';
import styles from './ServiceRequestPage.module.css';

/* ── Types ── */
interface KPIItem {
  value: number | string;
  icon?: string;
  colorVariant?: string;
  unit?: string;
  max?: number;
  progressBar?: { value: number; gradient: string };
  trend?: { direction: 'up' | 'down' | 'flat'; delta: string | number; label: string; isGood: boolean };
  subtitle?: string;
}

interface SLAItem {
  priority: string;
  label: string;
  target: string;
  met: number;
  total: number;
  percentage: number;
  color: 'red' | 'orange' | 'blue' | 'green';
}

interface SRData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string; frequency: string };
  kpis: {
    openRequests: KPIItem; fulfilledToday: KPIItem; slaBreached: KPIItem;
    avgFulfillment: KPIItem; fulfilledViaAutomation: KPIItem;
    csat: KPIItem; fcr: KPIItem; avgRequestFulfillmentTime: KPIItem; avgHandlingTime: KPIItem;
  };
  responseSLA: SLAItem[];
  resolutionSLA: SLAItem[];
  requestsByCategory: { category: string; count: number; percentage: number; color: string }[];
  agingRequests: { range: string; count: number; color: string }[];
}

const catColorMap: Record<string, string> = {
  blue: 'var(--color-blue)', orange: 'var(--color-orange)', green: 'var(--color-green)',
  red: 'var(--color-red)', gray: 'rgba(180,184,188,0.5)',
};

function CsatCard({ kpi }: { kpi: KPIItem }) {
  return (
    <div className={common.csatCard}>
      <div className={common.csatLabel}><i className="fa-solid fa-star" /> CSAT Score</div>
      <div className={common.csatSubtitle}>{kpi.subtitle}</div>
      <div className={common.csatValue}>
        <span className={common.csatNumber}>{kpi.value}</span>
        <span className={common.csatMax}>/{kpi.max ?? '5.0'}</span>
      </div>
      <div className={common.stars}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < Math.round(Number(kpi.value)) ? common.starFull : common.starDim}>★</span>
        ))}
      </div>
      {kpi.progressBar && (
        <div className={common.csatProgWrap}>
          <div className={common.csatProgBar}>
            <div className={common.csatProgFill} style={{ width: `${kpi.progressBar.value}%`, background: kpi.progressBar.gradient }} />
          </div>
        </div>
      )}
      {kpi.trend && (
        <div className={common.csatTrend}>
          <span className={kpi.trend.isGood ? common.csatTrendUp : common.csatTrendDown}>
            <i className={`fa-solid ${kpi.trend.direction === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'}`} /> {kpi.trend.delta}
          </span>
          <span className={common.csatTrendLabel}>{kpi.trend.label}</span>
        </div>
      )}
    </div>
  );
}

export default function ServiceRequestPage() {
  const { data, isLoading } = useDataSource<SRData>('itsm', 'service-requests');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Service Request Management" icon="fa-solid fa-pen-to-square" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const { kpis, responseSLA, resolutionSLA, requestsByCategory, agingRequests } = data;
  const maxCat = Math.max(...requestsByCategory.map(c => c.count));

  return (
    <>
      <Topbar
        title="Service Request Management"
        icon="fa-solid fa-pen-to-square"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-database' }}
      />
      <PageContainer>
        {/* KPI Row 1 — 5 columns */}
        <div className={common.kpiRow5}>
          <KPICard label="Open Requests" value={kpis.openRequests.value} icon={kpis.openRequests.icon} colorVariant="blue" trend={kpis.openRequests.trend} />
          <KPICard label="Fulfilled Today" value={kpis.fulfilledToday.value} icon={kpis.fulfilledToday.icon} colorVariant="teal" trend={kpis.fulfilledToday.trend} />
          <KPICard label="SLA Breached" value={kpis.slaBreached.value} icon={kpis.slaBreached.icon} colorVariant="red" trend={kpis.slaBreached.trend} />
          <KPICard label="Avg. Fulfillment" value={kpis.avgFulfillment.value} unit={kpis.avgFulfillment.unit} icon={kpis.avgFulfillment.icon} colorVariant="gold" trend={kpis.avgFulfillment.trend} />
          <KPICard label="Fulfilled via Automation" value={kpis.fulfilledViaAutomation.value} icon={kpis.fulfilledViaAutomation.icon} colorVariant="teal" trend={kpis.fulfilledViaAutomation.trend} />
        </div>

        {/* KPI Row 2 — CSAT + 3 with progress */}
        <div className={common.kpiRow}>
          <CsatCard kpi={kpis.csat} />
          <KPICard label="First Contact Resolution" value={kpis.fcr.value} unit={kpis.fcr.unit} colorVariant="teal" progressBar={kpis.fcr.progressBar} trend={kpis.fcr.trend} subtitle={kpis.fcr.subtitle} />
          <KPICard label="Avg. Fulfillment Time" value={kpis.avgRequestFulfillmentTime.value} unit={kpis.avgRequestFulfillmentTime.unit} colorVariant="blue" progressBar={kpis.avgRequestFulfillmentTime.progressBar} trend={kpis.avgRequestFulfillmentTime.trend} subtitle={kpis.avgRequestFulfillmentTime.subtitle} />
          <KPICard label="Avg. Handling Time" value={kpis.avgHandlingTime.value} unit={kpis.avgHandlingTime.unit} colorVariant="orange" progressBar={kpis.avgHandlingTime.progressBar} trend={kpis.avgHandlingTime.trend} subtitle={kpis.avgHandlingTime.subtitle} />
        </div>

        {/* SLA Section */}
        <SectionLabel>SLA Performance</SectionLabel>
        <div className={common.g2}>
          <ChartCard title="Response SLA by Priority">
            {responseSLA.map(s => <SLAProgressBar key={s.priority} {...s} />)}
          </ChartCard>
          <ChartCard title="Resolution SLA by Priority">
            {resolutionSLA.map(s => <SLAProgressBar key={s.priority} {...s} />)}
          </ChartCard>
        </div>

        {/* Requests by Category + Aging */}
        <SectionLabel>Request Analysis</SectionLabel>
        <ChartCard title="Requests by Category">
          <div className={styles.categoryList}>
            {requestsByCategory.map(cat => (
              <ProgressBar
                key={cat.category}
                label={`${cat.category} (${cat.count})`}
                value={maxCat > 0 ? Math.round((cat.count / maxCat) * 100) : 0}
                color={catColorMap[cat.color] ?? 'var(--color-blue)'}
                valueText={`${cat.percentage}%`}
              />
            ))}
          </div>
          <div className={styles.agingRow}>
            {agingRequests.map(a => (
              <div key={a.range} className={styles.agingBox} style={{ background: `${catColorMap[a.color] ?? '#c97b30'}10`, borderColor: `${catColorMap[a.color] ?? '#c97b30'}30` }}>
                <span className={styles.agingLabel}>Aging {a.range}</span>
                <span className={styles.agingValue} style={{ color: catColorMap[a.color] ?? '#c97b30' }}>{a.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </PageContainer>
    </>
  );
}
