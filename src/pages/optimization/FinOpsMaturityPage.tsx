import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import ProgressBar from '../../components/data-display/ProgressBar';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/data-display/Badge';
import NPCRadarChart from '../../components/charts/RadarChart';
import common from '../itsm/itsm-common.module.css';
import styles from './FinOpsMaturityPage.module.css';

/* ── Types ── */
interface Domain {
  name: string;
  score: number;
  max: number;
  percentage: number;
  stage: string;
  icon: string;
  colorVariant: string;
}

interface Stage {
  name: string;
  icon: string;
  status: 'current' | 'target' | 'future';
  label: string;
}

interface Capability {
  name: string;
  score: number;
  percentage: number;
}

interface CapDomain {
  score: number;
  max: number;
  icon: string;
  colorVariant: string;
  capabilities: Capability[];
}

interface Initiative {
  name: string;
  domain: string;
  priority: string;
  current: number;
  target: number;
  status: string;
  timeline: string;
}

interface FinOpsMaturityData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string; assessmentPeriod: string };
  overallMaturityScore: {
    domains: Domain[];
    radarData: Record<string, number>;
  };
  maturityStageJourney: {
    currentStage: string;
    stages: Stage[];
  };
  capabilityAssessment: Record<string, CapDomain>;
  improvementRoadmap: {
    target: string;
    initiatives: Initiative[];
  };
}

/* ── Color map for domain variants ── */
const VARIANT_COLORS: Record<string, string> = {
  teal: 'var(--color-green-teal)',
  orange: 'var(--color-orange)',
  blue: 'var(--color-blue)',
  gold: 'var(--brand-gold)',
  red: 'var(--color-red)',
};

const PRIORITY_MAP: Record<string, 'red' | 'orange' | 'blue'> = {
  Critical: 'red',
  High: 'orange',
  Medium: 'blue',
};

const STATUS_MAP: Record<string, 'blue' | 'green' | 'orange' | 'gray'> = {
  'In Progress': 'blue',
  'On Track': 'green',
  Planned: 'orange',
  Completed: 'green',
};

/* ── Stage Tracker ── */
function StageTracker({ stages }: { stages: Stage[] }) {
  return (
    <div className={styles.stageTracker}>
      {stages.map((s, i) => (
        <div key={s.name} style={{ display: 'contents' }}>
          {i > 0 && <div className={styles.stageConnector} />}
          <div className={styles.stageNode}>
            <div className={`${styles.stageIcon} ${styles[s.status]}`}>
              <i className={s.icon} />
            </div>
            <span className={styles.stageName}>{s.name}</span>
            <span className={styles.stageLabel}>{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FinOpsMaturityPage() {
  const { data, isLoading } = useDataSource<FinOpsMaturityData>('optimization', 'finops-maturity');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="FinOps Maturity" icon="fa-solid fa-chart-line" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  const { domains, radarData } = data.overallMaturityScore;
  const radarChartData = Object.entries(radarData).map(([key, val]) => ({
    axis: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
  }));

  const capDomains = Object.entries(data.capabilityAssessment) as [string, CapDomain][];

  return (
    <>
      <Topbar
        title="FinOps Maturity"
        icon="fa-solid fa-chart-line"
        dateChips={[data.metadata.assessmentPeriod]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-bullseye' }}
      />
      <PageContainer>
        {/* ── KPI Row: 5 domain scores ── */}
        <div className={common.kpiRow5}>
          {domains.map((d) => (
            <KPICard
              key={d.name}
              label={d.name}
              value={d.score.toFixed(1)}
              unit={`/${d.max}`}
              icon={d.icon}
              colorVariant={d.colorVariant as 'teal' | 'red' | 'orange' | 'blue' | 'gold'}
              subtitle={d.stage}
              progressBar={{ value: d.percentage, gradient: `linear-gradient(90deg, ${VARIANT_COLORS[d.colorVariant] ?? 'var(--color-blue)'}, rgba(255,255,255,0.1))` }}
            />
          ))}
        </div>

        {/* ── Maturity Stage Journey ── */}
        <div className={common.g2}>
          <ChartCard title="Maturity Radar" subtitle={`Overall: ${radarData.overall}/5`}>
            <NPCRadarChart data={radarChartData} max={5} size={280} />
          </ChartCard>

          <ChartCard title="Maturity Stage Journey" subtitle={`Target: ${data.improvementRoadmap.target}`}>
            <StageTracker stages={data.maturityStageJourney.stages} />
            <div className={styles.domainList}>
              {domains.slice(0, 4).map((d) => (
                <ProgressBar
                  key={d.name}
                  label={d.name}
                  value={d.percentage}
                  color={VARIANT_COLORS[d.colorVariant]}
                />
              ))}
            </div>
          </ChartCard>
        </div>

        {/* ── Capability Assessment (2×2 grid) ── */}
        <div className={common.g2}>
          {capDomains.map(([key, dom]) => (
            <ChartCard key={key} title="">
              <div className={styles.capHeader}>
                <span className={styles.capTitle}>
                  <i className={dom.icon} style={{ color: VARIANT_COLORS[dom.colorVariant] }} />
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <span className={styles.capScore}>
                  {dom.score.toFixed(1)} <span>/{dom.max}</span>
                </span>
              </div>
              <div className={styles.capBars}>
                {dom.capabilities.map((c) => (
                  <ProgressBar
                    key={c.name}
                    label={c.name}
                    value={c.percentage}
                    color={VARIANT_COLORS[dom.colorVariant]}
                    valueText={`${c.score.toFixed(1)} / ${dom.max}`}
                  />
                ))}
              </div>
            </ChartCard>
          ))}
        </div>

        {/* ── Improvement Roadmap ── */}
        <ChartCard title="Improvement Roadmap" subtitle={`Target: ${data.improvementRoadmap.target}`}>
          <DataTable
            columns={[
              { key: 'name', label: 'Initiative' },
              { key: 'domain', label: 'Domain', align: 'center' },
              { key: 'priority', label: 'Priority', align: 'center', render: (v) => <Badge variant={PRIORITY_MAP[String(v)] ?? 'blue'}>{String(v)}</Badge> },
              { key: 'current', label: 'Current', align: 'center', render: (v) => Number(v).toFixed(1) },
              { key: 'target', label: 'Target', align: 'center', render: (v) => Number(v).toFixed(1) },
              { key: 'status', label: 'Status', align: 'center', render: (v) => <Badge variant={STATUS_MAP[String(v)] ?? 'gray'}>{String(v)}</Badge> },
              { key: 'timeline', label: 'Timeline', align: 'center' },
            ]}
            data={data.improvementRoadmap.initiatives}
          />
        </ChartCard>
      </PageContainer>
    </>
  );
}
