import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import DataTable from '../../components/data-display/DataTable';
import SectionLabel from '../../components/data-display/SectionLabel';
import DonutChart from '../../components/charts/DonutChart';
import common from '../itsm/itsm-common.module.css';
import styles from './CCOEPage.module.css';

/* ── Types ── */
interface KPIItem {
  value: number;
  icon?: string;
  colorVariant?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; delta: number; label: string; isGood: boolean };
}

interface CCOEData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string; dataSource: string; selectedAreas: number };
  kpis: { epics: KPIItem; features: KPIItem; userStoriesTotal: KPIItem; userStoriesDone: KPIItem };
  featuresTypeDistribution: { type: string; total: number; active: number; closed: number; new: number }[];
  progressDonuts: { epics: { new: number; active: number; closed: number }; features: { new: number; active: number; closed: number }; userStories: { new: number; active: number; closed: number } };
  sprintTimeline: { name: string; type: string; startPct?: number; widthPct?: number; status?: string }[];
  sprintMonths: string[];
  epicImplementation: { name: string; featuresCount: number; completed: number; inProgress: number; notStarted: number; pocPct: number | null }[];
  epicImplementationTotals: { featuresCount: number; completed: number; inProgress: number; notStarted: number; pocPct: number };
}

const COLORS = { active: '#8b1837', closed: '#0e3a82', new: '#051b44' };
const DONUT_COLORS = { new: '#8b1837', active: '#0e3a82', closed: '#b8966a' };

/* ── Page-local: Stacked Bar Chart ── */
function StackedBarChart({ data }: { data: CCOEData['featuresTypeDistribution'] }) {
  return (
    <ChartCard title="Features Type Distribution">
      <div className={styles.stackedLegend}>
        {(['active', 'closed', 'new'] as const).map(k => (
          <span key={k} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: COLORS[k] }} />
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </span>
        ))}
      </div>
      {data.map(d => (
        <div key={d.type} className={styles.stackedRow}>
          <span className={styles.stackedLabel}>{d.type}</span>
          <div className={styles.stackedBar}>
            {d.active > 0 && <div className={styles.stackedSeg} style={{ flex: d.active, background: COLORS.active }}>{d.active}</div>}
            {d.closed > 0 && <div className={styles.stackedSeg} style={{ flex: d.closed, background: COLORS.closed }}>{d.closed}</div>}
            {d.new > 0 && <div className={styles.stackedSeg} style={{ flex: d.new, background: COLORS.new }}>{d.new}</div>}
          </div>
          <span className={styles.stackedTotal}>{d.total}</span>
        </div>
      ))}
    </ChartCard>
  );
}

/* ── Page-local: Sprint Timeline ── */
function SprintTimeline({ sprints, months }: { sprints: CCOEData['sprintTimeline']; months: string[] }) {
  return (
    <ChartCard title="Sprint Timeline">
      <div className={styles.monthRuler}>
        {months.map(m => <div key={m} className={styles.monthCell}>{m}</div>)}
      </div>
      {sprints.map((s, i) => (
        <div key={i} className={styles.sprintRow}>
          <span className={styles.sprintLabel}>{s.name}</span>
          <div className={styles.sprintTrack}>
            {s.type === 'parent' ? (
              <div className={`${styles.sprintBar} ${styles.sprintParent}`} style={{ left: 0, width: '100%' }} />
            ) : (
              <div
                className={`${styles.sprintBar} ${s.status === 'active' ? styles.sprintActive : styles.sprintClosed}`}
                style={{ left: `${s.startPct}%`, width: `${s.widthPct}%` }}
              />
            )}
          </div>
        </div>
      ))}
    </ChartCard>
  );
}

/* ── Helpers ── */
function coloredCell(color: string) {
  return (val: unknown, row: Record<string, unknown>) => {
    const isTotal = row._isTotal as boolean;
    return <span style={{ color, fontWeight: isTotal ? 700 : 600 }}>{val == null ? '\u2014' : String(val)}</span>;
  };
}

function pocCell(val: unknown, row: Record<string, unknown>) {
  const isTotal = row._isTotal as boolean;
  if (val == null) return <span style={{ color: 'var(--text-dim)' }}>{'\u2014'}</span>;
  return <span style={{ color: 'var(--color-blue)', fontWeight: isTotal ? 700 : 600 }}>{Number(val).toFixed(2)}%</span>;
}

const epicCols = [
  { key: 'name', label: 'Epic Name' },
  { key: 'featuresCount', label: 'Features', align: 'center' as const },
  { key: 'completed', label: 'Completed', align: 'center' as const, render: coloredCell('var(--color-green-teal)') },
  { key: 'inProgress', label: 'In Progress', align: 'center' as const, render: coloredCell('var(--color-orange)') },
  { key: 'notStarted', label: 'Not Started', align: 'center' as const, render: coloredCell('var(--color-red)') },
  { key: 'pocPct', label: 'POC (%)', align: 'center' as const, render: pocCell },
];

/* ── Main Component ── */
export default function CCOEPage() {
  const { data, isLoading } = useDataSource<CCOEData>('optimization', 'ccoe');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="CCOE Dashboard" icon="fa-solid fa-cube" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const kpiEntries: [string, KPIItem][] = [
    ['Epics', data.kpis.epics],
    ['Features', data.kpis.features],
    ['User Stories (Total)', data.kpis.userStoriesTotal],
    ['User Stories (Done)', data.kpis.userStoriesDone],
  ];

  const donutEntries: [string, { new: number; active: number; closed: number }][] = [
    ['Epics', data.progressDonuts.epics],
    ['Features Progress', data.progressDonuts.features],
    ['User Stories Progress', data.progressDonuts.userStories],
  ];

  const epicRows = [
    ...data.epicImplementation.map(e => ({ ...e, _isTotal: false })),
    { name: 'Total', _isTotal: true, ...data.epicImplementationTotals },
  ];

  return (
    <>
      <Topbar
        title="Cloud Centre of Excellence (CCOE)"
        icon="fa-solid fa-cube"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: 'Azure DevOps (CCOE)', icon: 'fa-solid fa-cloud' }}
      />
      <PageContainer>
        <div className={styles.dataSourceLabel}>
          <span><strong>{data.metadata.dataSource}</strong></span>
          <span>Selected Areas — {data.metadata.selectedAreas}</span>
        </div>

        <div className={common.kpiRow}>
          {kpiEntries.map(([label, k]) => (
            <KPICard
              key={label}
              label={label}
              value={k.value.toLocaleString()}
              icon={k.icon}
              colorVariant={k.colorVariant as 'teal' | 'red' | 'blue' | 'gold'}
              trend={k.trend ? { ...k.trend, delta: `${k.trend.delta}%` } : undefined}
            />
          ))}
        </div>

        <SectionLabel>Features Type Distribution</SectionLabel>
        <StackedBarChart data={data.featuresTypeDistribution} />

        <SectionLabel>Progress Overview</SectionLabel>
        <div className={common.g3}>
          {donutEntries.map(([title, d]) => (
            <ChartCard key={title} title={title}>
              <DonutChart
                data={[
                  { label: 'New', value: d.new, color: DONUT_COLORS.new },
                  { label: 'Active', value: d.active, color: DONUT_COLORS.active },
                  { label: 'Closed', value: d.closed, color: DONUT_COLORS.closed },
                ]}
                size={130}
              />
            </ChartCard>
          ))}
        </div>

        <SectionLabel>Sprint Timeline</SectionLabel>
        <SprintTimeline sprints={data.sprintTimeline} months={data.sprintMonths} />

        <SectionLabel>Epic Implementation Progress</SectionLabel>
        <ChartCard title="Epic Implementation Progress" subtitle="Only Epics linked to Features are displayed below">
          <DataTable
            columns={epicCols}
            data={epicRows}
          />
        </ChartCard>
      </PageContainer>
    </>
  );
}
