import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/data-display/Badge';
import SLAProgressBar from '../../components/charts/SLAProgressBar';
import HeatmapTable from '../../components/charts/HeatmapTable';
import NPCBarChart from '../../components/charts/BarChart';
import common from './itsm-common.module.css';
import styles from './IncidentPage.module.css';

/* ── Types ── */
interface KPIItem {
  value: number | string;
  icon?: string;
  colorVariant?: string;
  unit?: string;
  max?: number;
  stars?: number;
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

interface IncidentData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string };
  kpis: {
    openP1: KPIItem; openP2: KPIItem; resolvedToday: KPIItem; totalOpen: KPIItem;
    csat: KPIItem; fcr: KPIItem; mttr: KPIItem; avgHandling: KPIItem;
  };
  responseSLA: SLAItem[];
  resolutionSLA: SLAItem[];
  volumeTrend: { month: string; volume: number; csat: number }[];
  csatBreakdown: { label: string; value: number; color: string }[];
  heatmap: { day: string; hours: number[] }[];
  heatmapHours: string[];
  openByStatusPriority: {
    segments: { priority: string; count: number; color: string }[];
    table: { priority: string; severity: string; new: number; inProgress: number; pending: number; total: number; avgMTTR: string }[];
  };
}

/* ── Helpers ── */
const severityBadge = (s: string) =>
  s === 'critical' ? 'red' : s === 'major' ? 'orange' : s === 'minor' ? 'blue' : 'gray';

function CsatCard({ kpi }: { kpi: KPIItem }) {
  const stars = (kpi.stars as number) ?? 4;
  return (
    <div className={common.csatCard}>
      <div className={common.csatLabel}>
        <i className="fa-solid fa-star" />
        CSAT Score
      </div>
      <div className={common.csatSubtitle}>{kpi.subtitle}</div>
      <div className={common.csatValue}>
        <span className={common.csatNumber}>{kpi.value}</span>
        <span className={common.csatMax}>/{kpi.max ?? '5.0'}</span>
      </div>
      <div className={common.stars}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < stars ? common.starFull : common.starDim}>★</span>
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
            <i className={`fa-solid ${kpi.trend.direction === 'up' ? 'fa-arrow-up' : kpi.trend.direction === 'down' ? 'fa-arrow-down' : 'fa-minus'}`} />{' '}
            {kpi.trend.delta}
          </span>
          <span className={common.csatTrendLabel}>{kpi.trend.label}</span>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function IncidentPage() {
  const { data, isLoading } = useDataSource<IncidentData>('itsm', 'incidents');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Incident Management" icon="fa-solid fa-clipboard-list" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const { kpis, responseSLA, resolutionSLA, volumeTrend, csatBreakdown, heatmap, heatmapHours, openByStatusPriority } = data;
  const totalSeg = openByStatusPriority.segments.reduce((s, seg) => s + seg.count, 0);

  /* Transform heatmap: number[] -> Record<string, number> */
  const heatmapData = heatmap.map(row => ({
    date: row.day,
    hours: Object.fromEntries(heatmapHours.map((h, i) => [h, row.hours[i]])),
  }));

  const priorityTable = openByStatusPriority.table;

  return (
    <>
      <Topbar
        title="Incident Management"
        icon="fa-solid fa-clipboard-list"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-database' }}
      />
      <PageContainer>
        {/* KPI Row 1 */}
        <div className={common.kpiRow}>
          {(['openP1', 'openP2', 'resolvedToday', 'totalOpen'] as const).map(key => {
            const k = kpis[key];
            return (
              <KPICard
                key={key}
                label={key === 'openP1' ? 'Open P1 Incidents' : key === 'openP2' ? 'Open P2 Incidents' : key === 'resolvedToday' ? 'Resolved Today' : 'Total Open'}
                value={k.value}
                icon={k.icon}
                colorVariant={k.colorVariant as 'red' | 'orange' | 'teal' | 'gold'}
                trend={k.trend}
              />
            );
          })}
        </div>

        {/* KPI Row 2 — CSAT + 3 KPIs with progress */}
        <div className={common.kpiRow}>
          <CsatCard kpi={kpis.csat} />
          {(['fcr', 'mttr', 'avgHandling'] as const).map(key => {
            const k = kpis[key];
            return (
              <KPICard
                key={key}
                label={key === 'fcr' ? 'First Contact Resolution' : key === 'mttr' ? 'Mean Time to Resolve' : 'Avg. Handling Time'}
                value={k.value}
                unit={k.unit}
                colorVariant={k.colorVariant as 'teal' | 'blue' | 'orange'}
                progressBar={k.progressBar}
                trend={k.trend}
                subtitle={k.subtitle}
              />
            );
          })}
        </div>

        {/* SLA Section */}
        <SectionLabel>SLA Performance</SectionLabel>
        <div className={common.g2}>
          <ChartCard title="Response SLA by Priority">
            {responseSLA.map(s => (
              <SLAProgressBar key={s.priority} {...s} />
            ))}
          </ChartCard>
          <ChartCard title="Resolution SLA by Priority">
            {resolutionSLA.map(s => (
              <SLAProgressBar key={s.priority} {...s} />
            ))}
          </ChartCard>
        </div>

        {/* Volume Trend + Heatmap */}
        <SectionLabel>Trends &amp; Patterns</SectionLabel>
        <div className={common.g2}>
          <ChartCard title="Incident Volume & CSAT Trend" subtitle="6 Month">
            <NPCBarChart
              data={volumeTrend}
              bars={[{ dataKey: 'volume', color: '#2471a3', name: 'Volume' }]}
              xKey="month"
              height={220}
            />
            <div className={common.statRow}>
              {csatBreakdown.map(cb => (
                <div key={cb.label} className={common.statBox} style={{ background: `${cb.color}15`, borderColor: `${cb.color}30` }}>
                  <span className={common.statBoxLabel}>{cb.label}</span>
                  <span className={common.statBoxValue} style={{ color: cb.color }}>{cb.value}%</span>
                </div>
              ))}
            </div>
          </ChartCard>
          <ChartCard title="Incident Heatmap" subtitle="Severity by Hour">
            <HeatmapTable data={heatmapData} hours={heatmapHours} />
          </ChartCard>
        </div>

        {/* Open by Status & Priority */}
        <SectionLabel>Open Incidents by Status &amp; Priority</SectionLabel>
        <div className={common.section}>
          <ChartCard title="Priority Distribution">
            {/* Stacked segment bar */}
            <div className={styles.statusBar}>
              {openByStatusPriority.segments.map(seg => (
                <div
                  key={seg.priority}
                  className={styles.statusSeg}
                  style={{ flex: seg.count, background: seg.color }}
                >
                  {seg.priority} ({seg.count})
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className={styles.statusLegend}>
              {openByStatusPriority.segments.map(seg => (
                <div key={seg.priority} className={styles.statusLegendItem}>
                  <span className={styles.statusLegendDot} style={{ background: seg.color }} />
                  {seg.priority}
                  <span className={styles.statusLegendVal}>{seg.count}</span>
                  <span>({totalSeg > 0 ? Math.round((seg.count / totalSeg) * 100) : 0}%)</span>
                </div>
              ))}
            </div>
            {/* Table */}
            <DataTable
              columns={[
                { key: 'priority', label: 'Priority', render: (_v, row) => <Badge variant={severityBadge(row.severity as string)}>{row.priority as string}</Badge> },
                { key: 'new', label: 'New', align: 'center' },
                { key: 'inProgress', label: 'In Progress', align: 'center' },
                { key: 'pending', label: 'Pending', align: 'center' },
                { key: 'total', label: 'Total', align: 'center' },
                { key: 'avgMTTR', label: 'Avg MTTR', align: 'center' },
              ]}
              data={priorityTable}
              sortable
            />
          </ChartCard>
        </div>
      </PageContainer>
    </>
  );
}
