import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DonutChart from '../../components/charts/DonutChart';
import common from '../itsm/itsm-common.module.css';
import styles from './AssetPage.module.css';

/* ── Types ── */
interface CategoryRow { category: string; icon: string; total: number; onboarded: number; notOnboarded: number; percentage: number }
interface SubItem { type: string; baselineSizing: number; currentSizing: number; additionalUnitSize: number }
interface SizingRow { service: string; baselineSizing?: string | number; currentSizing?: string | number; additionalUnitSize?: string | number; subItems?: SubItem[] }

interface AssetData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string };
  kpis: {
    totalAssets: { value: number; colorVariant: string; subtitle: string };
    onboarded: { value: number; colorVariant: string; percentage: number };
    notOnboarded: { value: number; colorVariant: string; percentage: number };
  };
  onboardingOverview: { onboarded: number; notOnboarded: number; total: number; percentage: number };
  categoryBreakdown: CategoryRow[];
  categoryTotals: { total: number; onboarded: number; notOnboarded: number; percentage: number };
  sizingComparison: { observability: SizingRow[]; infrastructure: SizingRow[]; cloud: SizingRow[] };
}

/* ── Category Table ── */
function CategoryTable({ rows, totals }: { rows: CategoryRow[]; totals: AssetData['categoryTotals'] }) {
  return (
    <table className={styles.catTable}>
      <thead>
        <tr>
          <th>Asset Category</th>
          <th className={styles.tc}>Total</th>
          <th className={styles.tc}>Onboarded</th>
          <th className={styles.tc}>Not Onboarded</th>
          <th className={styles.tc}>Onboarding %</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.category}>
            <td><span className={styles.catIcon}><i className={r.icon} /></span> {r.category}</td>
            <td className={styles.tc}>{r.total}</td>
            <td className={styles.tc} style={{ color: '#1a9e8a' }}>{r.onboarded}</td>
            <td className={styles.tc} style={{ color: r.notOnboarded > 0 ? '#FF5A65' : '#1a9e8a' }}>{r.notOnboarded}</td>
            <td className={styles.tc}>
              <div className={styles.pctWrap}>
                <div className={styles.pctBar}><div className={styles.pctFill} style={{ width: `${r.percentage}%` }} /></div>
                <span className={styles.pctVal}>{r.percentage}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className={styles.totalRow}>
          <td><strong>TOTAL</strong></td>
          <td className={styles.tc}><strong>{totals.total}</strong></td>
          <td className={styles.tc} style={{ color: '#1a9e8a' }}><strong>{totals.onboarded}</strong></td>
          <td className={styles.tc} style={{ color: '#FF5A65' }}><strong>{totals.notOnboarded}</strong></td>
          <td className={styles.tc}><strong style={{ color: 'var(--brand-gold)' }}>{totals.percentage}%</strong></td>
        </tr>
      </tfoot>
    </table>
  );
}

/* ── Sizing Table ── */
function SizingSection({ title, rows, accent }: { title: string; rows: SizingRow[]; accent: string }) {
  return (
    <div className={styles.sizingBlock}>
      <div className={styles.sizingHeader} style={{ borderLeftColor: accent }}>{title}</div>
      <table className={styles.sizingTable}>
        <thead>
          <tr><th>Service</th><th className={styles.tc}>Baseline Sizing</th><th className={styles.tc}>Current Sizing</th><th className={styles.tc}>Additional Units</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            if (r.subItems) {
              return r.subItems.map((sub, si) => (
                <tr key={`${i}-${si}`}>
                  {si === 0 && <td rowSpan={r.subItems!.length} className={styles.parentCell}>{r.service}</td>}
                  <td className={styles.tc}>{sub.baselineSizing}</td>
                  <td className={`${styles.tc} ${styles.currentVal}`}>{sub.currentSizing}</td>
                  <td className={styles.tc}>{sub.additionalUnitSize > 0 ? `+${sub.additionalUnitSize}` : String(sub.additionalUnitSize)}</td>
                </tr>
              ));
            }
            return (
              <tr key={i}>
                <td>{r.service}</td>
                <td className={styles.tc}>{String(r.baselineSizing)}</td>
                <td className={`${styles.tc} ${styles.currentVal}`}>{String(r.currentSizing)}</td>
                <td className={styles.tc}>{Number(r.additionalUnitSize) > 0 ? `+${r.additionalUnitSize}` : String(r.additionalUnitSize)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main Component ── */
export default function AssetPage() {
  const { data, isLoading } = useDataSource<AssetData>('itam', 'assets');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Asset Management" icon="fa-solid fa-desktop" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const donutData = [
    { label: 'Onboarded', value: data.onboardingOverview.onboarded, color: '#1a9e8a' },
    { label: 'Not Onboarded', value: data.onboardingOverview.notOnboarded, color: '#e74c3c' },
  ];

  return (
    <>
      <Topbar
        title="Asset Management"
        icon="fa-solid fa-desktop"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-database' }}
      />
      <PageContainer>
        {/* KPI Row — 3 cards */}
        <div className={common.kpiRow3}>
          <KPICard label="Total Assets" value={data.kpis.totalAssets.value} colorVariant={data.kpis.totalAssets.colorVariant as 'blue'} subtitle={data.kpis.totalAssets.subtitle} icon="fa-solid fa-box" />
          <KPICard label="Onboarded" value={data.kpis.onboarded.value} colorVariant={data.kpis.onboarded.colorVariant as 'teal'} icon="fa-solid fa-circle-check" progressBar={{ value: data.kpis.onboarded.percentage, gradient: '#1a9e8a' }} subtitle={`${data.kpis.onboarded.percentage}% Onboarded`} />
          <KPICard label="Not Onboarded" value={data.kpis.notOnboarded.value} colorVariant={data.kpis.notOnboarded.colorVariant as 'red'} icon="fa-solid fa-circle-xmark" progressBar={{ value: data.kpis.notOnboarded.percentage, gradient: '#b8223f' }} subtitle={`${data.kpis.notOnboarded.percentage}% Not Onboarded`} />
        </div>

        {/* Category Table + Donut */}
        <div className={common.g2Asym}>
          <ChartCard title="Asset Onboarding Status by Category">
            <CategoryTable rows={data.categoryBreakdown} totals={data.categoryTotals} />
          </ChartCard>
          <div>
            <ChartCard title="Onboarding Overview">
              <DonutChart data={donutData} size={140} strokeWidth={22} />
            </ChartCard>
            <div style={{ marginTop: 16 }}>
              <ChartCard title="Coverage by Category">
                <div className={styles.coverageList}>
                  {data.categoryBreakdown.map(c => (
                    <div key={c.category} className={styles.coverageItem}>
                      <span className={styles.coverageName}>{c.category}</span>
                      <span className={styles.coveragePct} style={{ color: c.percentage === 100 ? '#1a9e8a' : c.percentage >= 90 ? '#c97b30' : '#FF5A65' }}>
                        {c.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>
        </div>

        {/* Sizing Comparison */}
        <SectionLabel>Current vs Additional Sizing</SectionLabel>
        <ChartCard title="Service Scope — Sizing Comparison">
          <SizingSection title="24/7 Observability Managed Services" rows={data.sizingComparison.observability} accent="#1a9e8a" />
          <SizingSection title="Infrastructure Services" rows={data.sizingComparison.infrastructure} accent="#4a80d0" />
          <SizingSection title="Cloud Services" rows={data.sizingComparison.cloud} accent="#8e44ad" />
        </ChartCard>
      </PageContainer>
    </>
  );
}
