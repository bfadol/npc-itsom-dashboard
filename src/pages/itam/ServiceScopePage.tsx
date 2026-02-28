import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DataTable from '../../components/data-display/DataTable';
import common from '../itsm/itsm-common.module.css';
import styles from './ServiceScopePage.module.css';

/* ── Types ── */
interface KPIItem {
  value: number;
  unit?: string;
  icon?: string;
  colorVariant?: string;
  subtitle?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; delta: string; label: string; isGood: boolean };
}

interface ScopeRow {
  category: string;
  baselineUnits: number;
  consumedUnits: number;
  additionalUnits: number;
  utilization: number;
}

interface ServiceScopeData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string };
  kpis: { baselineAssets: KPIItem; totalInScope: KPIItem; additionalUnits: KPIItem; utilizationRate: KPIItem };
  scopeBreakdown: ScopeRow[];
  totals: ScopeRow;
}

/* ── Helpers ── */
function additionalCell(v: unknown) {
  const n = Number(v);
  const color = n > 0 ? '#c97b30' : n < 0 ? '#14CA74' : 'var(--text-muted)';
  const prefix = n > 0 ? '+' : '';
  return <span style={{ color, fontWeight: 700 }}>{prefix}{n}</span>;
}

function utilizationCell(v: unknown) {
  const n = Number(v);
  const color = n > 100 ? '#c97b30' : n === 100 ? '#14CA74' : '#4a80d0';
  const arrow = n > 100 ? '\u25B2' : n < 100 ? '\u25BC' : '=';
  return <span style={{ color, fontWeight: 700 }}>{arrow} {n}%</span>;
}

/* ── Main Component ── */
export default function ServiceScopePage() {
  const { data, isLoading } = useDataSource<ServiceScopeData>('itam', 'servicescope');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Service Scope" icon="fa-solid fa-ruler-combined" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const kpiEntries: [string, KPIItem][] = [
    ['Baseline Assets', data.kpis.baselineAssets],
    ['Total In Scope', data.kpis.totalInScope],
    ['Additional Units', data.kpis.additionalUnits],
    ['Utilization Rate', data.kpis.utilizationRate],
  ];

  const tableData = [
    ...data.scopeBreakdown,
    { ...data.totals, category: 'TOTAL' },
  ];

  return (
    <>
      <Topbar
        title="Service Scope"
        icon="fa-solid fa-ruler-combined"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-gauge-high' }}
      />
      <PageContainer>
        <div className={common.kpiRow}>
          {kpiEntries.map(([label, k]) => (
            <KPICard
              key={label}
              label={label}
              value={k.value}
              unit={k.unit}
              icon={k.icon}
              colorVariant={k.colorVariant as 'teal' | 'red' | 'blue' | 'gold' | 'orange'}
              subtitle={k.subtitle}
              trend={k.trend}
            />
          ))}
        </div>

        <SectionLabel>Scope Breakdown</SectionLabel>
        <ChartCard title="Service Scope Breakdown">
          <DataTable
            columns={[
              { key: 'category', label: 'Service Category', render: (v) => {
                const isTotal = String(v) === 'TOTAL';
                return <span className={isTotal ? styles.totalRow : ''} style={{ fontWeight: isTotal ? 700 : 500 }}>{String(v)}</span>;
              }},
              { key: 'baselineUnits', label: 'Baseline Units', align: 'center' },
              { key: 'consumedUnits', label: 'Consumed Units', align: 'center', render: (v) => <span style={{ color: '#4a80d0', fontWeight: 700 }}>{String(v)}</span> },
              { key: 'additionalUnits', label: 'Additional Units', align: 'center', render: additionalCell },
              { key: 'utilization', label: 'Utilization', align: 'center', render: utilizationCell },
            ]}
            data={tableData}
          />
        </ChartCard>
      </PageContainer>
    </>
  );
}
