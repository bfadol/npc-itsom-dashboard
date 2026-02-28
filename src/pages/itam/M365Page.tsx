import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import ProgressBar from '../../components/data-display/ProgressBar';
import common from '../itsm/itsm-common.module.css';

/* ── Types ── */
interface KPIItem {
  value: number;
  icon?: string;
  colorVariant?: string;
  subtitle?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; delta: string; label: string; isGood: boolean };
}

interface M365Data {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string };
  kpis: { totalLicenses: KPIItem; assigned: KPIItem; available: KPIItem; expiring30d: KPIItem };
  licenseDistributionBySKU: { sku: string; count: number; percentage: number; color: string }[];
  usageByDepartment: { department: string; count: number; percentage: number; color: string }[];
}

/* ── Main Component ── */
export default function M365Page() {
  const { data, isLoading } = useDataSource<M365Data>('itam', 'm365');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="M365 Licenses" icon="fa-solid fa-th-large" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const kpiEntries: [string, KPIItem][] = [
    ['Total Licenses', data.kpis.totalLicenses],
    ['Assigned', data.kpis.assigned],
    ['Available', data.kpis.available],
    ['Expiring (30d)', data.kpis.expiring30d],
  ];

  return (
    <>
      <Topbar
        title="M365 Licenses"
        icon="fa-solid fa-th-large"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-brands fa-microsoft' }}
      />
      <PageContainer>
        <div className={common.kpiRow}>
          {kpiEntries.map(([label, k]) => (
            <KPICard
              key={label}
              label={label}
              value={k.value}
              icon={k.icon}
              colorVariant={k.colorVariant as 'teal' | 'red' | 'blue' | 'gold'}
              subtitle={k.subtitle}
              trend={k.trend}
            />
          ))}
        </div>

        <SectionLabel>License Distribution</SectionLabel>
        <div className={common.g2}>
          <ChartCard title="License Distribution by SKU">
            {data.licenseDistributionBySKU.map(s => (
              <ProgressBar
                key={s.sku}
                label={`${s.sku} (${s.count.toLocaleString()})`}
                value={s.percentage}
                color={s.color}
              />
            ))}
          </ChartCard>
          <ChartCard title="Usage by Department">
            {data.usageByDepartment.map(d => (
              <ProgressBar
                key={d.department}
                label={`${d.department} (${d.count.toLocaleString()})`}
                value={d.percentage}
                color={d.color}
              />
            ))}
          </ChartCard>
        </div>
      </PageContainer>
    </>
  );
}
