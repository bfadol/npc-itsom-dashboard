import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/data-display/Badge';
import common from '../itsm/itsm-common.module.css';

/* ── Types ── */
interface KPIItem {
  value: number;
  icon?: string;
  colorVariant?: string;
  subtitle?: string;
}

interface AppRow {
  name: string;
  category: string;
  status: string;
  availability: number;
  responseTime: string;
  lastChecked: string;
}

interface BizAppsData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string; category: string };
  kpis: { operational: KPIItem; down: KPIItem; degraded: KPIItem; maintenance: KPIItem; totalServices: KPIItem };
  applications: AppRow[];
}

/* ── Helpers ── */
const statusBadge = (s: string): 'green' | 'red' | 'orange' | 'blue' =>
  s === 'Operational' ? 'green' : s === 'Down' ? 'red' : s === 'Degraded' ? 'orange' : 'blue';

function availColor(v: number): string {
  if (v >= 99.5) return '#1a9e8a';
  if (v >= 97) return '#c97b30';
  return '#FF5A65';
}

function responseColor(rt: string): string {
  if (rt === 'Timeout' || rt === 'N/A') return '#FF5A65';
  const ms = parseFloat(rt);
  if (isNaN(ms)) return 'var(--text-muted)';
  if (rt.includes('s') && !rt.includes('ms')) return '#c97b30';
  return 'var(--text-primary)';
}

/* ── Main Component ── */
export default function BizAppsPage() {
  const { data, isLoading } = useDataSource<BizAppsData>('itom', 'bizapps');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Business Applications" icon="fa-solid fa-building" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const kpiEntries: [string, KPIItem][] = [
    ['Operational', data.kpis.operational],
    ['Down', data.kpis.down],
    ['Degraded', data.kpis.degraded],
    ['Maintenance', data.kpis.maintenance],
    ['Total Services', data.kpis.totalServices],
  ];

  return (
    <>
      <Topbar
        title="Business Applications"
        icon="fa-solid fa-building"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.category, icon: 'fa-solid fa-satellite-dish' }}
      />
      <PageContainer>
        <div className={common.kpiRow5}>
          {kpiEntries.map(([label, k]) => (
            <KPICard
              key={label}
              label={label}
              value={k.value}
              icon={k.icon}
              colorVariant={k.colorVariant as 'teal' | 'red' | 'orange' | 'blue' | 'gold'}
              subtitle={k.subtitle}
            />
          ))}
        </div>

        <SectionLabel>Application Status</SectionLabel>
        <ChartCard title="Business Applications">
          <DataTable
            columns={[
              { key: 'name', label: 'Application' },
              { key: 'category', label: 'Category' },
              { key: 'status', label: 'Status', align: 'center', render: (v) => <Badge variant={statusBadge(String(v))}>{String(v)}</Badge> },
              { key: 'availability', label: 'Availability', align: 'center', render: (v) => <span style={{ color: availColor(Number(v)), fontWeight: 700 }}>{String(v)}%</span> },
              { key: 'responseTime', label: 'Response Time', align: 'center', render: (v) => <span style={{ color: responseColor(String(v)), fontWeight: 600 }}>{String(v)}</span> },
              { key: 'lastChecked', label: 'Last Checked', align: 'center' },
            ]}
            data={data.applications}
            sortable
          />
        </ChartCard>
      </PageContainer>
    </>
  );
}
