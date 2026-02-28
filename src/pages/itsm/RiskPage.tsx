import { useState } from 'react';
import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/data-display/Badge';
import DonutChart from '../../components/charts/DonutChart';
import common from './itsm-common.module.css';
import styles from './RiskPage.module.css';

/* ── Types ── */
interface MultiBarItem { label: string; inherent: number; residual: number; target: number }

interface RiskData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string };
  filters: { categories: string[]; owners: string[]; statuses: string[]; responseTypes: string[] };
  riskMatrix: { type: string; cells: { probability: number; impact: number; count: number }[] };
  riskPriorityByCategory: { category: string; inherent: number; residual: number; target: number }[];
  risksByPriority: Record<string, number>;
  risksByStatus: Record<string, { count: number; percentage: number } | number>;
  risksByResponseType: Record<string, number>;
  riskByOwner: { owner: string; inherent: number; residual: number; target: number }[];
  riskRegister: { riskId: string; description: string; category: string; owner: string; probability: string; impact: string; status: string }[];
}

/* ── Risk Matrix ── */
const probLabels: Record<number, string> = { 5: 'Almost Certain', 4: 'Likely', 3: 'Possible', 2: 'Unlikely' };
const impLabels: Record<number, string> = { 1: 'Insignificant', 2: 'Minor', 3: 'Significant', 4: 'Major' };

function getCellColor(prob: number, imp: number): string {
  const score = prob * imp;
  if (score >= 16) return styles.rmRed;
  if (score >= 12) return styles.rmOrange;
  if (score >= 6) return styles.rmYellow;
  return styles.rmGreen;
}

function RiskMatrix({ cells }: { cells: { probability: number; impact: number; count: number }[] }) {
  const cellMap = new Map(cells.map(c => [`${c.probability}-${c.impact}`, c.count]));

  return (
    <div className={styles.riskMatrix}>
      <div className={styles.riskMatrixGrid}>
        <div className={styles.rmCorner} />
        {[1, 2, 3, 4].map(imp => (
          <div key={imp} className={styles.rmHeader}>{imp} - {impLabels[imp]}</div>
        ))}
        {[5, 4, 3, 2].map(prob => (
          <div key={`row-${prob}`} style={{ display: 'contents' }}>
            <div className={styles.rmRowLabel}>{prob} - {probLabels[prob]}</div>
            {[1, 2, 3, 4].map(imp => {
              const count = cellMap.get(`${prob}-${imp}`) ?? 0;
              return (
                <div key={`${prob}-${imp}`} className={`${styles.rmCell} ${getCellColor(prob, imp)}`}>
                  {count > 0 ? count : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.rmAxisLabel}>IMPACT →</div>
    </div>
  );
}

/* ── Multi-Bar ── */
function RiskMultiBar({ data, title }: { data: MultiBarItem[]; title: string }) {
  const maxVal = Math.max(...data.map(d => d.inherent), 1);

  return (
    <ChartCard title={title}>
      <div className={styles.multiBarLegend}>
        <div className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#4a80d0' }} /> Inherent</div>
        <div className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#8e44ad' }} /> Residual</div>
        <div className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#b8223f' }} /> Target</div>
      </div>
      <div className={styles.multiBarList}>
        {data.map(item => (
          <div key={item.label} className={styles.multiBarItem}>
            <div className={styles.multiBarHeader}>
              <span className={styles.multiBarLabel}>{item.label}</span>
              <span className={styles.multiBarVal}>{item.inherent}</span>
            </div>
            <div className={styles.riskBarTrack}>
              <div className={styles.riskBarFill} style={{ width: `${(item.inherent / maxVal) * 100}%`, background: '#4a80d0' }} />
            </div>
            <div className={styles.multiBarSub}>
              <span className={styles.subLabel}>Residual</span>
              <div className={styles.subBarWrap}>
                <div className={styles.riskBarTrack}>
                  <div className={styles.riskBarFill} style={{ width: `${(item.residual / maxVal) * 100}%`, background: '#8e44ad' }} />
                </div>
              </div>
              <span className={styles.subVal}>{item.residual}</span>
              <span className={styles.subLabel}>Target</span>
              <div className={styles.subBarWrap}>
                <div className={styles.riskBarTrack}>
                  <div className={styles.riskBarFill} style={{ width: `${(item.target / maxVal) * 100}%`, background: '#b8223f' }} />
                </div>
              </div>
              <span className={styles.subVal}>{item.target}</span>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

/* ── Helpers ── */
const statusBadge = (s: string): 'red' | 'orange' | 'blue' | 'green' | 'gray' =>
  s === 'Critical' ? 'red' : s === 'High' ? 'orange' : s === 'Medium' ? 'blue' : s === 'Low' ? 'green' : 'gray';

/* ── Main Component ── */
export default function RiskPage() {
  const [activeTab, setActiveTab] = useState<'inherent' | 'residual' | 'target'>('inherent');
  const { data, isLoading } = useDataSource<RiskData>('itsm', 'risk');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Risk Dashboard" icon="fa-solid fa-bullseye" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const priorityDonut = Object.entries(data.risksByPriority).map(([key, val]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
    color: key === 'critical' ? '#FF5A65' : key === 'high' ? '#c97b30' : key === 'medium' ? '#4a80d0' : '#14CA74',
  }));

  const statusDonut = Object.entries(data.risksByStatus).map(([key, val]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: typeof val === 'object' ? val.count : val,
    color: key === 'open' ? '#FF5A65' : '#14CA74',
  }));

  const responseDonut = Object.entries(data.risksByResponseType).map(([key, val]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
    color: key === 'mitigate' ? '#2471a3' : key === 'accept' ? '#c97b30' : key === 'avoid' ? '#1a9e8a' : '#8e44ad',
  }));

  const categoryBars: MultiBarItem[] = data.riskPriorityByCategory.map(c => ({ label: c.category, inherent: c.inherent, residual: c.residual, target: c.target }));
  const ownerBars: MultiBarItem[] = data.riskByOwner.map(o => ({ label: o.owner, inherent: o.inherent, residual: o.residual, target: o.target }));

  return (
    <>
      <Topbar
        title="Risk Dashboard"
        icon="fa-solid fa-bullseye"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-shield-halved' }}
      />
      <PageContainer>
        {/* Filter Bar (visual-only in Phase 1) */}
        <div className={styles.filterBar}>
          <span className={styles.filterLabel}><i className="fa-solid fa-filter" /> Filters:</span>
          {[
            { label: 'Category', options: data.filters.categories },
            { label: 'Owner', options: data.filters.owners },
            { label: 'Status', options: data.filters.statuses },
            { label: 'Response', options: data.filters.responseTypes },
          ].map(f => (
            <select key={f.label} className={styles.filterSelect} defaultValue="All">
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
        </div>

        {/* Tab Strip */}
        <div className={common.tabRow}>
          {(['inherent', 'residual', 'target'] as const).map(t => (
            <button
              key={t}
              className={`${common.tab} ${activeTab === t ? common.tabActive : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)} Risk
            </button>
          ))}
        </div>

        {/* Main: Left (matrix + category bars) | Right (3 donuts) */}
        <div className={styles.mainGrid}>
          <div>
            <ChartCard title="Risk Matrix" subtitle={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View`}>
              <RiskMatrix cells={data.riskMatrix.cells} />
            </ChartCard>
            <div style={{ marginTop: 16 }}>
              <RiskMultiBar data={categoryBars} title="Risk Priority by Category" />
            </div>
          </div>
          <div className={styles.rightCol}>
            <ChartCard title="Risks by Priority">
              <DonutChart data={priorityDonut} size={120} strokeWidth={18} />
            </ChartCard>
            <ChartCard title="Risks by Status">
              <DonutChart data={statusDonut} size={120} strokeWidth={18} />
            </ChartCard>
            <ChartCard title="Risks by Response Type">
              <DonutChart data={responseDonut} size={120} strokeWidth={18} />
            </ChartCard>
          </div>
        </div>

        {/* Bottom: Owner bars + Risk Register */}
        <SectionLabel>Risk Detail</SectionLabel>
        <div className={common.g2}>
          <RiskMultiBar data={ownerBars} title="Total Risk by Owner" />
          <ChartCard title="Risk Register">
            <DataTable
              columns={[
                { key: 'riskId', label: 'Risk ID' },
                { key: 'description', label: 'Description' },
                { key: 'category', label: 'Category' },
                { key: 'owner', label: 'Owner' },
                { key: 'probability', label: 'Prob.', align: 'center' },
                { key: 'impact', label: 'Impact', align: 'center' },
                { key: 'status', label: 'Status', align: 'center', render: (v) => <Badge variant={statusBadge(String(v))}>{String(v)}</Badge> },
              ]}
              data={data.riskRegister}
              sortable
            />
          </ChartCard>
        </div>
      </PageContainer>
    </>
  );
}
