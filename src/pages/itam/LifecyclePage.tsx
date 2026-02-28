import { useState } from 'react';
import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/data-display/Badge';
import NPCBarChart from '../../components/charts/BarChart';
import common from '../itsm/itsm-common.module.css';
import styles from './LifecyclePage.module.css';

/* ── Types ── */
interface LcKPI { value: number; icon?: string; colorVariant?: string; subtitle?: string }
interface SegmentData { expired?: number; expiring?: number; inSupport?: number; unknown?: number }
interface AssetTypeRow { name: string; total: number; segments: SegmentData }
interface TimelinePoint { year: string; value: number; status: string }
interface RiskHeatmap { vendor: string; moreThan12Mo: number; lessThan6Mo: number; sixTo12Mo: number; expired: number; unknown: number }
interface DeviceDetail { name: string; serialId: string | null; lifecycleStatus: string; productId: string | null; type: string; model: string | null }

interface ReportData {
  label: string;
  kpis: { totalAssets: LcKPI; inSupport: LcKPI; expiring: LcKPI; expired: LcKPI; unknown: LcKPI };
  lifecycleByAssetType?: AssetTypeRow[];
  lifecycleTimeline?: TimelinePoint[];
  topVendorsAtRisk?: { vendor: string; count: number }[];
  riskHeatmap?: RiskHeatmap;
  riskSummary?: Record<string, number>;
  deviceDetails?: DeviceDetail[];
  message?: string;
}

interface LifecycleData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string; assetType: string; category: string };
  filters: { vendors: string[]; deviceTypes: string[]; lifecycleStatuses: string[] };
  reports: string[];
  eoes: ReportData; eos: ReportData; eoss: ReportData; eol: ReportData;
}

/* ── Stacked Bar List ── */
const SEG_COLORS: Record<string, string> = { expired: '#b8223f', expiring: '#c97b30', inSupport: '#1a9e8a', unknown: 'rgba(5,27,68,0.4)' };

function StackedBarList({ items }: { items: AssetTypeRow[] }) {
  return (
    <div className={styles.stackedList}>
      {items.map(item => {
        const segs = Object.entries(item.segments).filter(([, v]) => v > 0);
        return (
          <div key={item.name} className={styles.stackedRow}>
            <div className={styles.stackedLabel}>
              <span className={styles.stackedName}>{item.name}</span>
              <span className={styles.stackedTotal}>{item.total}</span>
            </div>
            <div className={styles.stackedBar}>
              {segs.map(([key, val]) => (
                <div key={key} className={styles.stackedSeg} style={{ width: `${val}%`, background: SEG_COLORS[key] || SEG_COLORS.unknown }} title={`${key}: ${val}%`} />
              ))}
            </div>
          </div>
        );
      })}
      <div className={styles.stackedLegend}>
        {Object.entries(SEG_COLORS).map(([k, c]) => (
          <span key={k} className={styles.legendItem}><span className={styles.legendDot} style={{ background: c }} /> {k.charAt(0).toUpperCase() + k.slice(1)}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Risk Heatmap Card ── */
function RiskHeatmapCard({ hm }: { hm: RiskHeatmap }) {
  const cells: [string, number, string][] = [
    ['>12 Mo', hm.moreThan12Mo, '#1a9e8a'],
    ['<6 Mo', hm.lessThan6Mo, '#c97b30'],
    ['6-12 Mo', hm.sixTo12Mo, '#c97b30'],
    ['Expired', hm.expired, '#b8223f'],
    ['Unknown', hm.unknown, 'rgba(100,130,180,0.3)'],
  ];
  return (
    <ChartCard title="Risk Heatmap">
      <div className={styles.riskGrid}>
        {cells.map(([label, val, color]) => (
          <div key={label} className={styles.riskCell}>
            <span className={styles.riskCellLabel}>{label}</span>
            <span className={styles.riskCellVal} style={{ color: val > 0 ? color : 'var(--text-muted)' }}>{val}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

/* ── Lifecycle Status Badge ── */
const lcBadge = (s: string): 'red' | 'orange' | 'green' | 'gray' =>
  s === 'Expired' ? 'red' : s === 'Expiring' ? 'orange' : s === 'In Support' ? 'green' : 'gray';

/* ── Main Component ── */
export default function LifecyclePage() {
  const [activeReport, setActiveReport] = useState('eoes');
  const { data, isLoading } = useDataSource<LifecycleData>('itam', 'lifecycle');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Asset Lifecycle" icon="fa-solid fa-bolt" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const report = data[activeReport as keyof LifecycleData] as ReportData;
  const kpis = report.kpis;

  /* Timeline → bar chart data */
  const timelineData = report.lifecycleTimeline?.map(t => ({
    year: t.year,
    value: t.value,
    fill: SEG_COLORS[t.status] || '#4a80d0',
  })) ?? [];

  const reportTabs: { key: string; label: string }[] = [
    { key: 'eoes', label: 'EOES' },
    { key: 'eos', label: 'EOS' },
    { key: 'eoss', label: 'EOSS' },
    { key: 'eol', label: 'EOL' },
  ];

  return (
    <>
      <Topbar
        title="Asset Lifecycle"
        icon="fa-solid fa-bolt"
        dateChips={[data.metadata.assetType, data.metadata.category]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-shield-halved' }}
      />
      <PageContainer>
        {/* Filter bar (visual-only) */}
        <div className={styles.filterBar}>
          <span className={styles.filterLabel}><i className="fa-solid fa-filter" /> Filters:</span>
          {[
            { label: 'Vendor', options: data.filters.vendors },
            { label: 'Device Type', options: data.filters.deviceTypes },
            { label: 'Lifecycle', options: data.filters.lifecycleStatuses },
          ].map(f => (
            <select key={f.label} className={styles.filterSelect} defaultValue="All">
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>

        {/* Report Tab Strip */}
        <div className={common.tabRow}>
          {reportTabs.map(t => (
            <button
              key={t.key}
              className={`${common.tab} ${activeReport === t.key ? common.tabActive : ''}`}
              onClick={() => setActiveReport(t.key)}
            >
              {(data[t.key as keyof LifecycleData] as ReportData).label}
            </button>
          ))}
        </div>

        {/* KPI Row */}
        <div className={common.kpiRow5}>
          <KPICard label="Total Assets" value={kpis.totalAssets.value} icon={kpis.totalAssets.icon} subtitle={kpis.totalAssets.subtitle} />
          <KPICard label="In Support" value={kpis.inSupport.value} icon={kpis.inSupport.icon} colorVariant={kpis.inSupport.colorVariant as 'teal'} subtitle={kpis.inSupport.subtitle} />
          <KPICard label="Expiring (<12 Mo)" value={kpis.expiring.value} icon={kpis.expiring.icon} colorVariant={kpis.expiring.colorVariant as 'orange'} subtitle={kpis.expiring.subtitle} />
          <KPICard label="Expired" value={kpis.expired.value} icon={kpis.expired.icon} colorVariant={kpis.expired.colorVariant as 'red'} subtitle={kpis.expired.subtitle} />
          <KPICard label="Unknown" value={kpis.unknown.value} icon={kpis.unknown.icon} subtitle={kpis.unknown.subtitle} />
        </div>

        {/* Charts row */}
        {(report.lifecycleByAssetType || report.lifecycleTimeline) && (
          <div className={common.g2}>
            {report.lifecycleByAssetType ? (
              <ChartCard title="Lifecycle by Asset Type">
                <StackedBarList items={report.lifecycleByAssetType} />
              </ChartCard>
            ) : <div />}
            {timelineData.length > 0 ? (
              <ChartCard title="Lifecycle Timeline">
                <NPCBarChart
                  data={timelineData}
                  bars={[{ dataKey: 'value', color: '#4a80d0', name: 'Assets' }]}
                  xKey="year"
                  height={220}
                />
              </ChartCard>
            ) : <div />}
          </div>
        )}

        {/* Message (EOSS) */}
        {report.message && (
          <ChartCard title="Status">
            <div className={styles.messageBox}>
              <i className="fa-solid fa-circle-info" style={{ color: '#4a80d0', fontSize: 18, marginRight: 8 }} />
              {report.message}
            </div>
          </ChartCard>
        )}

        {/* Risk Heatmap */}
        {report.riskHeatmap && <RiskHeatmapCard hm={report.riskHeatmap} />}

        {/* Device Details (EOES only) */}
        {report.deviceDetails && report.deviceDetails.length > 0 && (
          <>
            <SectionLabel>Device Details</SectionLabel>
            <ChartCard title="Device Details">
              <DataTable
                columns={[
                  { key: 'name', label: 'Name' },
                  { key: 'type', label: 'Type' },
                  { key: 'model', label: 'Model', render: (v) => <span>{v ? String(v) : '—'}</span> },
                  { key: 'lifecycleStatus', label: 'Status', align: 'center', render: (v) => <Badge variant={lcBadge(String(v))}>{String(v)}</Badge> },
                ]}
                data={report.deviceDetails}
                sortable
              />
            </ChartCard>
          </>
        )}
      </PageContainer>
    </>
  );
}
