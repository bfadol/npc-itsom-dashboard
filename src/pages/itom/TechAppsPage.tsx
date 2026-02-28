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

interface ServiceRow {
  name: string;
  type: string;
  status: string;
  availability: number;
  cpu: string;
  memory: string;
  host: string;
}

interface TechAppsData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string; category: string };
  kpis: { healthy: KPIItem; down: KPIItem; degraded: KPIItem; maintenance: KPIItem; total: KPIItem };
  services: ServiceRow[];
}

/* ── Helpers ── */
const statusBadge = (s: string): 'green' | 'red' | 'orange' | 'blue' =>
  s === 'Healthy' ? 'green' : s === 'Down' ? 'red' : s === 'Degraded' ? 'orange' : 'blue';

function availColor(v: number): string {
  if (v >= 99.5) return '#1a9e8a';
  if (v >= 97) return '#c97b30';
  return '#FF5A65';
}

function metricColor(val: string): string {
  if (val === 'N/A' || val === '--') return val === 'N/A' ? '#FF5A65' : 'var(--text-muted)';
  const n = parseFloat(val);
  if (isNaN(n)) return 'var(--text-primary)';
  if (n >= 80) return '#c97b30';
  return 'var(--text-primary)';
}

/* ── Main Component ── */
export default function TechAppsPage() {
  const { data, isLoading } = useDataSource<TechAppsData>('itom', 'techapps');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Technical Applications" icon="fa-solid fa-gear" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const kpiEntries: [string, KPIItem][] = [
    ['Healthy', data.kpis.healthy],
    ['Down', data.kpis.down],
    ['Degraded', data.kpis.degraded],
    ['Maintenance', data.kpis.maintenance],
    ['Total', data.kpis.total],
  ];

  return (
    <>
      <Topbar
        title="Technical Applications"
        icon="fa-solid fa-gear"
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

        <SectionLabel>Service Status</SectionLabel>
        <ChartCard title="Technical Services">
          <DataTable
            columns={[
              { key: 'name', label: 'Service' },
              { key: 'type', label: 'Type' },
              { key: 'status', label: 'Status', align: 'center', render: (v) => <Badge variant={statusBadge(String(v))}>{String(v)}</Badge> },
              { key: 'availability', label: 'Availability', align: 'center', render: (v) => <span style={{ color: availColor(Number(v)), fontWeight: 700 }}>{String(v)}%</span> },
              { key: 'cpu', label: 'CPU %', align: 'center', render: (v) => <span style={{ color: metricColor(String(v)), fontWeight: 600 }}>{String(v)}</span> },
              { key: 'memory', label: 'Memory %', align: 'center', render: (v) => <span style={{ color: metricColor(String(v)), fontWeight: 600 }}>{String(v)}</span> },
              { key: 'host', label: 'Host' },
            ]}
            data={data.services}
            sortable
          />
        </ChartCard>
      </PageContainer>
    </>
  );
}
