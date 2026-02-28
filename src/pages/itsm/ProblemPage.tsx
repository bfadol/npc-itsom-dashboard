import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/data-display/Badge';
import ProgressBar from '../../components/data-display/ProgressBar';
import NPCLineChart from '../../components/charts/LineChart';
import common from './itsm-common.module.css';
import styles from './ProblemPage.module.css';

/* ── Types ── */
interface KPIItem {
  value: number | string;
  icon?: string;
  colorVariant?: string;
  unit?: string;
  subtitle?: string;
}

interface ProblemData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string; frequency: string };
  kpis: {
    totalProblems: KPIItem; knownErrors: KPIItem; knownErrorRate: KPIItem;
    workaroundTime: KPIItem; majorReviewRate: KPIItem;
  };
  statusOverview: { totalActive: number; open: number; underInvestigation: number; knownError: number; resolved: number };
  problemTrend: { month: string; value: number }[];
  knownErrorIdentification: { percentage: number; knownErrors: number; problemsTotal: number; formula: string };
  workaroundTrend: { month: string; value: number }[];
  majorReviewCompletion: { percentage: number; completed: number; required: number; frequency: string };
  rootCauseCategories: { category: string; count: number; percentage: number }[];
  ageBreakdown: { range: string; count: number; color: string }[];
  activeProblemRecords: { problemId: string; category: string; status: string; age: string; knownError: boolean; sla: string }[];
}

const statusBadge = (s: string): 'green' | 'orange' | 'blue' | 'red' | 'gray' =>
  s === 'Resolved' ? 'green' : s === 'Known Error' ? 'orange' : s === 'Investigating' ? 'blue' : s === 'Open' ? 'red' : 'gray';

const slaBadge = (s: string): 'green' | 'red' => s === 'OK' ? 'green' : 'red';

const ageColor: Record<string, string> = { blue: 'var(--color-blue)', orange: 'var(--color-orange)', red: 'var(--color-red)' };

export default function ProblemPage() {
  const { data, isLoading } = useDataSource<ProblemData>('itsm', 'problems');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Problem Management" icon="fa-solid fa-triangle-exclamation" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const { kpis, statusOverview, problemTrend, knownErrorIdentification, workaroundTrend, rootCauseCategories, ageBreakdown, activeProblemRecords } = data;
  const maxRc = Math.max(...rootCauseCategories.map(c => c.count));

  return (
    <>
      <Topbar
        title="Problem Management"
        icon="fa-solid fa-triangle-exclamation"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-database' }}
      />
      <PageContainer>
        {/* KPI Row — 5 columns */}
        <div className={common.kpiRow5}>
          <KPICard label="Total Problems" value={kpis.totalProblems.value} icon={kpis.totalProblems.icon} colorVariant="blue" subtitle={kpis.totalProblems.subtitle} />
          <KPICard label="Known Errors" value={kpis.knownErrors.value} icon={kpis.knownErrors.icon} colorVariant="gold" subtitle={kpis.knownErrors.subtitle} />
          <KPICard label="Known Error Rate" value={kpis.knownErrorRate.value} unit={kpis.knownErrorRate.unit} icon={kpis.knownErrorRate.icon} colorVariant="blue" subtitle={kpis.knownErrorRate.subtitle} />
          <KPICard label="Avg. Time to Workaround" value={kpis.workaroundTime.value} unit={kpis.workaroundTime.unit} icon={kpis.workaroundTime.icon} colorVariant="orange" subtitle={kpis.workaroundTime.subtitle} />
          <KPICard label="Major Review Rate" value={kpis.majorReviewRate.value} unit={kpis.majorReviewRate.unit} icon={kpis.majorReviewRate.icon} colorVariant="red" subtitle={kpis.majorReviewRate.subtitle} />
        </div>

        {/* Status Overview + Problem Trend */}
        <SectionLabel>Status &amp; Trends</SectionLabel>
        <div className={common.g2}>
          <ChartCard title="Status Overview">
            <div className={styles.statusGrid}>
              {[
                { label: 'Active', value: statusOverview.totalActive, color: '#4a80d0' },
                { label: 'Open', value: statusOverview.open, color: '#FF5A65' },
                { label: 'Investigating', value: statusOverview.underInvestigation, color: '#2471a3' },
                { label: 'Known Error', value: statusOverview.knownError, color: '#c97b30' },
                { label: 'Resolved', value: statusOverview.resolved, color: '#14CA74' },
              ].map(s => (
                <div key={s.label} className={styles.statusItem} style={{ borderColor: `${s.color}30` }}>
                  <span className={styles.statusItemLabel}>{s.label}</span>
                  <span className={styles.statusItemValue} style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
          <ChartCard title="Problem Trend" subtitle="6 Month">
            <NPCLineChart
              data={problemTrend}
              lines={[{ dataKey: 'value', color: '#4a80d0', name: 'Active Problems' }]}
              xKey="month" height={200}
            />
          </ChartCard>
        </div>

        {/* KE Identification Rate + Workaround Trend */}
        <div className={common.g2}>
          <ChartCard title="Known Error Identification Rate">
            <div className={styles.bigPct}>
              <span className={styles.bigPctNumber}>{knownErrorIdentification.percentage}</span>
              <span className={styles.bigPctUnit}>%</span>
              <div className={styles.bigPctSub}>
                <span>Known Errors: <span className={styles.bigPctSubVal}>{knownErrorIdentification.knownErrors}</span></span>
                <span>Total Problems: <span className={styles.bigPctSubVal}>{knownErrorIdentification.problemsTotal}</span></span>
              </div>
              <div className={styles.bigPctFormula}>{knownErrorIdentification.formula}</div>
            </div>
          </ChartCard>
          <ChartCard title="Avg. Time to Workaround" subtitle="6 Month Trend">
            <NPCLineChart
              data={workaroundTrend}
              lines={[{ dataKey: 'value', color: '#c97b30', name: 'Hours' }]}
              xKey="month" height={200}
            />
          </ChartCard>
        </div>

        {/* Root Cause + Age Breakdown */}
        <div className={common.g2}>
          <ChartCard title="Root Cause Categories">
            <div className={styles.rcList}>
              {rootCauseCategories.map(rc => (
                <ProgressBar
                  key={rc.category}
                  label={`${rc.category} (${rc.count})`}
                  value={maxRc > 0 ? Math.round((rc.count / maxRc) * 100) : 0}
                  color="var(--color-blue)"
                  valueText={`${rc.percentage}%`}
                />
              ))}
            </div>
          </ChartCard>
          <ChartCard title="Age Breakdown">
            <div className={styles.ageRow}>
              {ageBreakdown.map(a => (
                <div key={a.range} className={styles.ageBox} style={{ borderColor: `${ageColor[a.color] ?? '#4a80d0'}30`, background: `${ageColor[a.color] ?? '#4a80d0'}08` }}>
                  <span className={styles.ageBoxLabel}>{a.range}</span>
                  <span className={styles.ageBoxValue} style={{ color: ageColor[a.color] ?? '#4a80d0' }}>{a.count}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Active Problem Records Table */}
        <SectionLabel>Active Problem Records</SectionLabel>
        <ChartCard title="Problem Register">
          <DataTable
            columns={[
              { key: 'problemId', label: 'Problem ID' },
              { key: 'category', label: 'Category' },
              { key: 'status', label: 'Status', render: (v) => <Badge variant={statusBadge(String(v))}>{String(v)}</Badge> },
              { key: 'age', label: 'Age', align: 'center' },
              { key: 'knownError', label: 'Known Error', align: 'center', render: (v) => v ? <Badge variant="orange">Yes</Badge> : <Badge variant="gray">No</Badge> },
              { key: 'sla', label: 'SLA', align: 'center', render: (v) => <Badge variant={slaBadge(String(v))}>{String(v)}</Badge> },
            ]}
            data={activeProblemRecords}
            sortable
          />
        </ChartCard>
      </PageContainer>
    </>
  );
}
