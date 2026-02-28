import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/data-display/Badge';
import ProgressBar from '../../components/data-display/ProgressBar';
import DonutChart from '../../components/charts/DonutChart';
import NPCLineChart from '../../components/charts/LineChart';
import common from './itsm-common.module.css';
import styles from './ChangePage.module.css';

/* ── Types ── */
interface KPIItem {
  value: number | string;
  icon?: string;
  colorVariant?: string;
  unit?: string;
  progressBar?: { value: number; gradient: string };
  trend?: { direction: 'up' | 'down' | 'flat'; delta: string | number; label: string; isGood: boolean };
  subtitle?: string;
}

interface ChangeData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string; frequency: string };
  kpis: {
    changeSuccessRate: KPIItem; failedChangeRate: KPIItem; emergencyChangeRate: KPIItem;
    changeInducedIncidentRate: KPIItem; pirCompletionRate: KPIItem; highRiskChangePercentage: KPIItem;
    unauthorizedChangeRate: KPIItem; deferredChangePercentage: KPIItem;
  };
  changeTypeDistribution: { total: number; types: { type: string; count: number; percentage: number; color: string }[] };
  successFailTrend: { success: { month: string; value: number }[]; failed: { month: string; value: number }[] };
  riskLevelDistribution: { level: string; count: number; percentage: number; color: string }[];
  pendingApproval: number;
  deferredReadiness: number;
  kpiSummaryTable: { num: number; name: string; value: string; unit: string; frequency: string; status: string }[];
  recentChangeRequests: { crId: string; type: string; risk: string; status: string; result: string }[];
}

const statusBadge = (s: string): 'green' | 'orange' | 'red' | 'blue' | 'gray' =>
  s === 'Good' || s === 'Success' ? 'green'
  : s === 'Monitor' || s === 'Pending' || s === 'Approved' ? 'orange'
  : s === 'Failed' ? 'red'
  : s === 'Deferred' ? 'blue'
  : 'gray';

const riskBadge = (r: string): 'green' | 'orange' | 'red' =>
  r === 'Low' ? 'green' : r === 'Medium' ? 'orange' : 'red';

export default function ChangePage() {
  const { data, isLoading } = useDataSource<ChangeData>('itsm', 'changes');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Change Management" icon="fa-solid fa-arrows-rotate" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const { kpis, changeTypeDistribution, successFailTrend, riskLevelDistribution } = data;

  const trendData = successFailTrend.success.map((s, i) => ({
    month: s.month,
    success: s.value,
    failed: successFailTrend.failed[i]?.value ?? 0,
  }));

  const donutSegments = changeTypeDistribution.types.map(t => ({
    label: `${t.type} (${t.percentage}%)`,
    value: t.count,
    color: t.color,
  }));

  const kpiRow1 = ['changeSuccessRate', 'failedChangeRate', 'emergencyChangeRate', 'changeInducedIncidentRate'] as const;
  const kpiRow2 = ['pirCompletionRate', 'highRiskChangePercentage', 'unauthorizedChangeRate', 'deferredChangePercentage'] as const;
  const kpiLabels: Record<string, string> = {
    changeSuccessRate: 'Change Success Rate', failedChangeRate: 'Failed Change Rate',
    emergencyChangeRate: 'Emergency Change Rate', changeInducedIncidentRate: 'Change-Induced Incident Rate',
    pirCompletionRate: 'PIR Completion Rate', highRiskChangePercentage: 'High-Risk Change %',
    unauthorizedChangeRate: 'Unauthorized Change Rate', deferredChangePercentage: 'Deferred Change %',
  };

  return (
    <>
      <Topbar
        title="Change Management"
        icon="fa-solid fa-arrows-rotate"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-database' }}
      />
      <PageContainer>
        {/* KPI Row 1 */}
        <div className={common.kpiRow}>
          {kpiRow1.map(key => {
            const k = kpis[key];
            return (
              <KPICard key={key} label={kpiLabels[key]} value={k.value} unit={k.unit} icon={k.icon}
                colorVariant={k.colorVariant as 'teal' | 'red' | 'orange'} progressBar={k.progressBar} trend={k.trend} subtitle={k.subtitle} />
            );
          })}
        </div>

        {/* KPI Row 2 */}
        <div className={common.kpiRow}>
          {kpiRow2.map(key => {
            const k = kpis[key];
            return (
              <KPICard key={key} label={kpiLabels[key]} value={k.value} unit={k.unit} icon={k.icon}
                colorVariant={k.colorVariant as 'gold' | 'orange' | 'red' | 'blue'} progressBar={k.progressBar} trend={k.trend} subtitle={k.subtitle} />
            );
          })}
        </div>

        {/* Donut + Trend */}
        <SectionLabel>Change Analysis</SectionLabel>
        <div className={common.g2}>
          <ChartCard title="Change Type Distribution" subtitle={`Total: ${changeTypeDistribution.total}`}>
            <DonutChart data={donutSegments} />
          </ChartCard>
          <ChartCard title="Success vs Failed Trend" subtitle="6 Month">
            <NPCLineChart
              data={trendData}
              lines={[
                { dataKey: 'success', color: '#14CA74', name: 'Success Rate %' },
                { dataKey: 'failed', color: '#FF5A65', name: 'Failed Rate %' },
              ]}
              xKey="month" height={220}
            />
          </ChartCard>
        </div>

        {/* Risk Distribution + Pending */}
        <div className={common.g2}>
          <ChartCard title="Risk Level Distribution">
            <div className={styles.riskLevelList}>
              {riskLevelDistribution.map(r => (
                <ProgressBar key={r.level} label={`${r.level} (${r.count})`} value={r.percentage} color={r.color} valueText={`${r.percentage}%`} />
              ))}
            </div>
          </ChartCard>
          <ChartCard title="Pending & Deferred">
            <div className={styles.pendingRow}>
              <div className={styles.pendingBox}>
                <span className={styles.pendingLabel}>Pending Approval</span>
                <span className={styles.pendingValue}>{data.pendingApproval}</span>
              </div>
              <div className={styles.pendingBox}>
                <span className={styles.pendingLabel}>Deferred / Readiness</span>
                <span className={styles.pendingValue}>{data.deferredReadiness}</span>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* KPI Summary Table */}
        <SectionLabel>KPI Summary</SectionLabel>
        <ChartCard title="Change Management KPI Scorecard">
          <DataTable
            columns={[
              { key: 'num', label: '#', align: 'center' },
              { key: 'name', label: 'KPI Name' },
              { key: 'value', label: 'Value', align: 'center' },
              { key: 'unit', label: 'Unit', align: 'center' },
              { key: 'frequency', label: 'Frequency', align: 'center' },
              { key: 'status', label: 'Status', align: 'center', render: (v) => <Badge variant={statusBadge(String(v))}>{String(v)}</Badge> },
            ]}
            data={data.kpiSummaryTable}
            sortable
          />
        </ChartCard>

        {/* Recent Change Requests */}
        <SectionLabel>Recent Changes</SectionLabel>
        <ChartCard title="Recent Change Requests">
          <DataTable
            columns={[
              { key: 'crId', label: 'CR ID' },
              { key: 'type', label: 'Type', render: (v) => <Badge variant={String(v) === 'Emergency' ? 'orange' : String(v) === 'Normal' ? 'blue' : 'green'}>{String(v)}</Badge> },
              { key: 'risk', label: 'Risk', align: 'center', render: (v) => <Badge variant={riskBadge(String(v))}>{String(v)}</Badge> },
              { key: 'status', label: 'Status', align: 'center', render: (v) => <Badge variant={statusBadge(String(v))}>{String(v)}</Badge> },
              { key: 'result', label: 'Result', align: 'center', render: (v) => <Badge variant={statusBadge(String(v))}>{String(v)}</Badge> },
            ]}
            data={data.recentChangeRequests}
            sortable
          />
        </ChartCard>
      </PageContainer>
    </>
  );
}
