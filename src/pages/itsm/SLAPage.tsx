import { useState } from 'react';
import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/data-display/Badge';
import NPCLineChart from '../../components/charts/LineChart';
import common from './itsm-common.module.css';
import styles from './SLAPage.module.css';

/* ── Types ── */
interface KPIItem {
  value: number | string;
  icon?: string;
  colorVariant?: string;
  unit?: string;
  subtitle?: string;
  trend?: { direction: 'up' | 'down' | 'flat'; delta: string | number; label: string; isGood: boolean };
}

interface ComplianceItem {
  priority: string;
  target: string;
  percentage: number;
  color: string;
}

interface TrendPoint { month: string; value: number }

interface BreachRow {
  category?: string; totalTickets?: number; withinSLA?: number; breached?: number; compliancePercent?: number; isTotal?: boolean;
  incidentId?: string; priority?: string; responseTime?: string; target?: string; status?: string;
  srId?: string; requestor?: string; fulfillmentTime?: string;
}

interface SLAPriorityRow {
  priority: string; target: string; percentage: number; tickets: number; breaches: number; avgResponse: string; color: string;
}

interface SLACategoryRow {
  category: string; percentage: number; srCount: number; breaches: number; target: string; color: string;
}

interface SLAData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string };
  overview: {
    kpis: Record<string, KPIItem>;
    complianceByPriority: ComplianceItem[];
    slaTrend: TrendPoint[];
    breachSummary: BreachRow[];
  };
  incidents: {
    kpis: Record<string, KPIItem>;
    slaByPriority: SLAPriorityRow[];
    slaTrend: TrendPoint[];
    breachDetails: BreachRow[];
  };
  serviceRequests: {
    kpis: Record<string, KPIItem>;
    slaByCategory: SLACategoryRow[];
    slaTrend: TrendPoint[];
    breachDetails: BreachRow[];
  };
}

type TabKey = 'overview' | 'incidents' | 'sr';

/* ── Sub-panels ── */
function OverviewPanel({ d }: { d: SLAData['overview'] }) {
  const kpiKeys = Object.keys(d.kpis);
  return (
    <>
      <div className={common.kpiRow}>
        {kpiKeys.map(key => {
          const k = d.kpis[key];
          return <KPICard key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={k.value} unit={k.unit} icon={k.icon} colorVariant={k.colorVariant as 'teal' | 'red' | 'blue' | 'gold'} trend={k.trend} subtitle={k.subtitle} />;
        })}
      </div>

      <div className={common.g2}>
        <ChartCard title="Compliance by Priority">
          <div className={styles.complianceList}>
            {d.complianceByPriority.map(c => (
              <div key={c.priority} className={styles.complianceItem}>
                <span className={styles.complianceLabel}>{c.priority}</span>
                <span className={styles.complianceTarget}>{c.target}</span>
                <div className={styles.complianceBar}>
                  <div className={styles.complianceBarFill} style={{ width: `${c.percentage}%`, background: c.color }} />
                </div>
                <span className={styles.compliancePct}>{c.percentage}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="SLA Compliance Trend" subtitle="6 Month">
          <NPCLineChart
            data={d.slaTrend}
            lines={[{ dataKey: 'value', color: '#14CA74', name: 'Compliance %' }]}
            xKey="month" height={200}
          />
        </ChartCard>
      </div>

      <SectionLabel>Breach Summary</SectionLabel>
      <ChartCard title="SLA Breach Summary">
        <DataTable
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'totalTickets', label: 'Total Tickets', align: 'center' },
            { key: 'withinSLA', label: 'Within SLA', align: 'center' },
            { key: 'breached', label: 'Breached', align: 'center', render: (v) => <span style={{ color: Number(v) > 0 ? '#FF5A65' : '#14CA74', fontWeight: 700 }}>{String(v)}</span> },
            { key: 'compliancePercent', label: 'Compliance %', align: 'center', render: (v) => <span style={{ fontWeight: 700 }}>{String(v)}%</span> },
          ]}
          data={d.breachSummary}
        />
      </ChartCard>
    </>
  );
}

function IncidentsPanel({ d }: { d: SLAData['incidents'] }) {
  const kpiKeys = Object.keys(d.kpis);
  return (
    <>
      <div className={common.kpiRow}>
        {kpiKeys.map(key => {
          const k = d.kpis[key];
          return <KPICard key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={k.value} unit={k.unit} icon={k.icon} colorVariant={k.colorVariant as 'teal' | 'red' | 'blue' | 'gold'} trend={k.trend} subtitle={k.subtitle} />;
        })}
      </div>

      <ChartCard title="SLA by Priority">
        <div className={styles.slaDetailList}>
          {d.slaByPriority.map(p => (
            <div key={p.priority} className={styles.slaDetailRow}>
              <span className={styles.slaDetailPriority} style={{ color: p.color }}>{p.priority}</span>
              <span className={styles.slaDetailTarget}>{p.target}</span>
              <div className={styles.slaDetailBarWrap}>
                <div className={styles.slaDetailBar}>
                  <div className={styles.slaDetailBarFill} style={{ width: `${p.percentage}%`, background: p.color }} />
                </div>
              </div>
              <div className={styles.slaDetailStats}>
                <span>{p.tickets} tickets</span>
                <span style={{ color: p.breaches > 0 ? '#FF5A65' : '#14CA74' }}>{p.breaches} breaches</span>
              </div>
              <span className={styles.slaDetailPct}>{p.percentage}%</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <div className={common.g2}>
        <ChartCard title="Incident SLA Trend" subtitle="6 Month">
          <NPCLineChart
            data={d.slaTrend}
            lines={[{ dataKey: 'value', color: '#2471a3', name: 'Compliance %' }]}
            xKey="month" height={200}
          />
        </ChartCard>
        <ChartCard title="Breach Details">
          <DataTable
            columns={[
              { key: 'incidentId', label: 'Incident ID' },
              { key: 'priority', label: 'Priority', render: (v) => <Badge variant={String(v) === 'P1' ? 'red' : String(v) === 'P2' ? 'orange' : 'blue'}>{String(v)}</Badge> },
              { key: 'category', label: 'Category' },
              { key: 'responseTime', label: 'Response', align: 'center' },
              { key: 'target', label: 'Target', align: 'center' },
              { key: 'status', label: 'Status', align: 'center', render: (v) => <Badge variant="red">{String(v)}</Badge> },
            ]}
            data={d.breachDetails}
          />
        </ChartCard>
      </div>
    </>
  );
}

function SRPanel({ d }: { d: SLAData['serviceRequests'] }) {
  const kpiKeys = Object.keys(d.kpis);
  return (
    <>
      <div className={common.kpiRow}>
        {kpiKeys.map(key => {
          const k = d.kpis[key];
          return <KPICard key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={k.value} unit={k.unit} icon={k.icon} colorVariant={k.colorVariant as 'teal' | 'red' | 'blue' | 'gold'} trend={k.trend} subtitle={k.subtitle} />;
        })}
      </div>

      <ChartCard title="SLA by Category">
        <div className={styles.slaDetailList}>
          {d.slaByCategory.map(c => (
            <div key={c.category} className={styles.slaDetailRow}>
              <span className={styles.slaDetailPriority} style={{ color: c.color }}>{c.category}</span>
              <span className={styles.slaDetailTarget}>{c.target}</span>
              <div className={styles.slaDetailBarWrap}>
                <div className={styles.slaDetailBar}>
                  <div className={styles.slaDetailBarFill} style={{ width: `${c.percentage}%`, background: c.color }} />
                </div>
              </div>
              <div className={styles.slaDetailStats}>
                <span>{c.srCount} SRs</span>
                <span style={{ color: c.breaches > 0 ? '#FF5A65' : '#14CA74' }}>{c.breaches} breaches</span>
              </div>
              <span className={styles.slaDetailPct}>{c.percentage}%</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <div className={common.g2}>
        <ChartCard title="SR SLA Trend" subtitle="6 Month">
          <NPCLineChart
            data={d.slaTrend}
            lines={[{ dataKey: 'value', color: '#1a9e8a', name: 'Compliance %' }]}
            xKey="month" height={200}
          />
        </ChartCard>
        <ChartCard title="Breach Details">
          <DataTable
            columns={[
              { key: 'srId', label: 'SR ID' },
              { key: 'category', label: 'Category' },
              { key: 'requestor', label: 'Requestor' },
              { key: 'fulfillmentTime', label: 'Fulfillment', align: 'center' },
              { key: 'target', label: 'Target', align: 'center' },
              { key: 'status', label: 'Status', align: 'center', render: (v) => <Badge variant="red">{String(v)}</Badge> },
            ]}
            data={d.breachDetails}
          />
        </ChartCard>
      </div>
    </>
  );
}

/* ── Main Component ── */
export default function SLAPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { data, isLoading } = useDataSource<SLAData>('itsm', 'sla');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="SLA Management" icon="fa-solid fa-chart-bar" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'fa-solid fa-gauge-high' },
    { key: 'incidents', label: 'Incidents', icon: 'fa-solid fa-bell' },
    { key: 'sr', label: 'Service Requests', icon: 'fa-solid fa-pen-to-square' },
  ];

  return (
    <>
      <Topbar
        title="SLA Management"
        icon="fa-solid fa-chart-bar"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-database' }}
      />
      <PageContainer>
        {/* Tab Strip */}
        <div className={common.tabRow}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`${common.tab} ${activeTab === t.key ? common.tabActive : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <i className={t.icon} style={{ marginRight: 6 }} />
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewPanel d={data.overview} />}
        {activeTab === 'incidents' && <IncidentsPanel d={data.incidents} />}
        {activeTab === 'sr' && <SRPanel d={data.serviceRequests} />}
      </PageContainer>
    </>
  );
}
