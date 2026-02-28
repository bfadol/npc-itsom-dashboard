import { useState } from 'react';
import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import ProgressBar from '../../components/data-display/ProgressBar';
import DataTable from '../../components/data-display/DataTable';
import NPCBarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import common from '../itsm/itsm-common.module.css';
import styles from './FinOpsPage.module.css';

/* ── Types ── */
interface KPIItem {
  value: number;
  unit: string;
  icon: string;
  colorVariant: string;
  subtitle: string;
  prefix?: string;
  direction?: string;
}

interface Subscription {
  name: string;
  budget: number;
  consumption: number;
  budgetConsumedPct: number;
}

interface ResourceGroup {
  name: string;
  cost: number;
  delta: number;
  deltaDirection: 'up' | 'down';
}

interface CostItem {
  name: string;
  cost: number;
}

interface Recommendation {
  recommendation: string;
  costGroup: string;
  subscription: string;
  resourceGroup: string;
  resource: string;
  owner: string;
}

interface FinOpsData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string };
  executiveOverview: {
    kpis: Record<string, KPIItem>;
    subscriptions: number;
    resourceGroups: number;
    resources: number;
  };
  monthlyConsumptionTrend: { month: string; value: number }[];
  budgetVsConsumption: {
    subscriptions: Subscription[];
    totals: { budget: number; consumption: number; budgetConsumedPct: number };
    budgetUtilization: {
      consumed: { value: number; percentage: number };
      remaining: { value: number; percentage: number };
    };
  };
  costDrivers: {
    top5Subscriptions: CostItem[];
    top5SubscriptionsCoverage: number;
    top5Services: CostItem[];
    top5ServicesCoverage: number;
    top5Resources: CostItem[];
    top5ResourcesCoverage: number;
    top5ResourceGroups: ResourceGroup[];
    top5ResourceGroupsCoverage: number;
  };
  recommendations: {
    total: number;
    open: number;
    completed: number;
    postponed: number;
    dismissed: number;
    openRecommendations: Recommendation[];
    completedRecommendations: Recommendation[];
  };
}

const fmt = (v: number) => `$${v.toLocaleString()}`;

export default function FinOpsPage() {
  const { data, isLoading } = useDataSource<FinOpsData>('optimization', 'finops');
  const [recTab, setRecTab] = useState<'open' | 'completed'>('open');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="FinOps" icon="fa-solid fa-coins" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const { kpis, subscriptions, resourceGroups, resources } = data.executiveOverview;
  const { budgetVsConsumption: bvc, costDrivers: cd, recommendations: rec } = data;

  const kpiEntries = Object.entries(kpis) as [string, KPIItem][];
  const kpiLabels: Record<string, string> = {
    consumption: 'Monthly Consumption',
    momChange: 'MoM Change',
    forecast: 'Forecast',
    annualSavings: 'Annual Savings',
  };

  /* Cost driver coverage helper */
  const maxCost = (items: CostItem[]) => Math.max(...items.map(i => i.cost));

  const recColumns = [
    { key: 'recommendation', label: 'Recommendation' },
    { key: 'costGroup', label: 'Cost Group' },
    { key: 'subscription', label: 'Subscription' },
    { key: 'resourceGroup', label: 'Resource Group' },
    { key: 'resource', label: 'Resource' },
    { key: 'owner', label: 'Owner' },
  ];

  return (
    <>
      <Topbar
        title="FinOps"
        icon="fa-solid fa-coins"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-brands fa-microsoft' }}
      />
      <PageContainer>
        {/* ── Executive Overview KPIs ── */}
        <div className={common.kpiRow}>
          {kpiEntries.map(([key, k]) => (
            <KPICard
              key={key}
              label={kpiLabels[key] ?? key}
              value={k.unit === '$' ? `${k.prefix ?? ''}${fmt(k.value)}` : `${k.prefix ?? ''}${k.value}${k.unit}`}
              icon={k.icon}
              colorVariant={k.colorVariant as 'teal' | 'red' | 'orange' | 'blue' | 'gold'}
              subtitle={k.subtitle}
              trend={k.direction ? { direction: k.direction as 'up' | 'down', delta: `${k.value}%`, label: k.subtitle, isGood: k.direction === 'down' } : undefined}
            />
          ))}
        </div>

        {/* ── Monthly Trend + Mini Stats ── */}
        <div className={common.g2}>
          <ChartCard title="Monthly Consumption Trend">
            <NPCBarChart
              data={data.monthlyConsumptionTrend}
              xKey="month"
              bars={[{ dataKey: 'value', color: '#2471a3', name: 'Consumption ($)' }]}
              height={220}
            />
          </ChartCard>
          <ChartCard title="Environment Summary">
            <div className={styles.miniStats}>
              <div className={styles.miniStat}>
                <span className={styles.miniStatLabel}>Subscriptions</span>
                <span className={styles.miniStatValue}>{subscriptions}</span>
              </div>
              <div className={styles.miniStat}>
                <span className={styles.miniStatLabel}>Resource Groups</span>
                <span className={styles.miniStatValue}>{resourceGroups}</span>
              </div>
              <div className={styles.miniStat}>
                <span className={styles.miniStatLabel}>Resources</span>
                <span className={styles.miniStatValue}>{resources}</span>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* ── Budget vs Consumption ── */}
        <div className={common.g2}>
          <ChartCard title="Budget vs Consumption" subtitle="by Subscription">
            <DataTable
              columns={[
                { key: 'name', label: 'Subscription' },
                { key: 'budget', label: 'Budget ($)', align: 'right', render: (v) => fmt(Number(v)) },
                { key: 'consumption', label: 'Consumed ($)', align: 'right', render: (v) => fmt(Number(v)) },
                {
                  key: 'budgetConsumedPct',
                  label: '% Used',
                  align: 'right',
                  render: (v) => (
                    <span className={Number(v) > 100 ? styles.overBudget : undefined}>
                      {Number(v).toFixed(1)}%
                    </span>
                  ),
                },
              ]}
              data={[
                ...bvc.subscriptions,
                { name: 'TOTAL', budget: bvc.totals.budget, consumption: bvc.totals.consumption, budgetConsumedPct: bvc.totals.budgetConsumedPct, _isTotal: true } as Subscription & { _isTotal: boolean },
              ]}
            />
          </ChartCard>
          <ChartCard title="Budget Utilization">
            <DonutChart
              data={[
                { label: `Consumed (${bvc.budgetUtilization.consumed.percentage.toFixed(1)}%)`, value: bvc.budgetUtilization.consumed.value, color: '#b8223f' },
                { label: `Remaining (${bvc.budgetUtilization.remaining.percentage.toFixed(1)}%)`, value: bvc.budgetUtilization.remaining.value, color: '#1a3a6c' },
              ]}
              size={180}
            />
          </ChartCard>
        </div>

        {/* ── Cost Drivers: Top 5 Subs / Services / Resources ── */}
        <div className={common.g3}>
          {([
            { title: 'Top 5 Subscriptions', items: cd.top5Subscriptions, coverage: cd.top5SubscriptionsCoverage, color: '#2471a3' },
            { title: 'Top 5 Services', items: cd.top5Services, coverage: cd.top5ServicesCoverage, color: '#8b1837' },
            { title: 'Top 5 Resources', items: cd.top5Resources, coverage: cd.top5ResourcesCoverage, color: '#1a9e8a' },
          ] as const).map((sec) => (
            <ChartCard key={sec.title} title={sec.title}>
              {sec.items.map((item) => (
                <ProgressBar
                  key={item.name}
                  label={item.name}
                  value={Math.round((item.cost / maxCost(sec.items as CostItem[])) * 100)}
                  color={sec.color}
                  valueText={fmt(item.cost)}
                />
              ))}
              <div className={styles.coverageLabel}>Coverage: {sec.coverage}%</div>
            </ChartCard>
          ))}
        </div>

        {/* ── Top 5 Resource Groups with Delta ── */}
        <ChartCard title="Top 5 Resource Groups" subtitle={`Coverage: ${cd.top5ResourceGroupsCoverage}%`}>
          {cd.top5ResourceGroups.map((rg) => (
            <div key={rg.name} className={styles.driverRow}>
              <span className={styles.driverName}>{rg.name}</span>
              <span className={styles.driverCost}>{fmt(rg.cost)}</span>
              <span className={`${styles.driverDelta} ${rg.deltaDirection === 'up' ? styles.deltaUp : styles.deltaDown}`}>
                <i className={`fa-solid fa-arrow-${rg.deltaDirection}`} /> ${Math.abs(rg.delta)}
              </span>
            </div>
          ))}
        </ChartCard>

        {/* ── Recommendations ── */}
        <div className={styles.recStats}>
          {[
            { label: 'Total', value: rec.total },
            { label: 'Open', value: rec.open },
            { label: 'Completed', value: rec.completed },
            { label: 'Postponed', value: rec.postponed },
            { label: 'Dismissed', value: rec.dismissed },
          ].map((s) => (
            <div key={s.label} className={styles.recStat}>
              <span className={styles.recStatLabel}>{s.label}</span>
              <span className={styles.recStatValue}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className={common.tabRow}>
          <button className={`${common.tab} ${recTab === 'open' ? common.tabActive : ''}`} onClick={() => setRecTab('open')}>
            <i className="fa-solid fa-folder-open" style={{ marginRight: 6 }} />Open ({rec.open})
          </button>
          <button className={`${common.tab} ${recTab === 'completed' ? common.tabActive : ''}`} onClick={() => setRecTab('completed')}>
            <i className="fa-solid fa-check-circle" style={{ marginRight: 6 }} />Completed ({rec.completed})
          </button>
        </div>

        <ChartCard title={recTab === 'open' ? 'Open Recommendations' : 'Completed Recommendations'}>
          <DataTable
            columns={recColumns}
            data={recTab === 'open' ? rec.openRecommendations : rec.completedRecommendations}
          />
        </ChartCard>
      </PageContainer>
    </>
  );
}
