import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import KPICard from '../../components/data-display/KPICard';
import ChartCard from '../../components/data-display/ChartCard';
import SectionLabel from '../../components/data-display/SectionLabel';
import DataTable from '../../components/data-display/DataTable';
import Badge from '../../components/data-display/Badge';
import GaugeChart from '../../components/charts/GaugeChart';
import HeatmapTable from '../../components/charts/HeatmapTable';
import NPCLineChart from '../../components/charts/LineChart';
import common from '../itsm/itsm-common.module.css';
import styles from './ObservabilityPage.module.css';

/* ── Types ── */
interface DeviceCategory { name: string; icon: string; total: number; available: number; unavailable: number }
interface AlarmKPI {
  value: number; icon: string;
  trend?: { direction: 'up' | 'down' | 'flat'; delta: number; label: string; isGood: boolean };
  closedEvents?: number;
  breakdown?: { critical: number; major: number; minor: number };
}
interface ObsData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string };
  deviceStatus: { totalDevices: number; categories: DeviceCategory[] };
  alarmMonitoring: { activeCritical: AlarmKPI; activeMajor: AlarmKPI; activeMinor: AlarmKPI; totalActive: AlarmKPI; totalEvents: AlarmKPI };
  severityTrends: { hours: string[]; critical: number[]; major: number[]; minor: number[] };
  alertActivityByDay: { date: string; critical: number; major: number; minor: number; total: number }[];
  heatmapByHour: { date: string; hours: number[] }[];
  eventDetails: { status: string; severity: string; creationTime: string; hostName: string; message: string }[];
  unavailableDevices: { deviceName: string; lastUpdate: string }[];
}

/* ── Helpers ── */
const sevBadge = (s: string): 'red' | 'orange' | 'gold' => s === 'CRITICAL' ? 'red' : s === 'MAJOR' ? 'orange' : 'gold';
const statusColor = (s: string) => s === 'OPEN' ? '#14CA74' : s === 'ACK' ? '#c97b30' : 'var(--text-muted)';

const HEATMAP_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

/* ── Total Devices Card ── */
function TotalDevicesCard({ total }: { total: number }) {
  return (
    <div className={styles.totalCard}>
      <div className={styles.totalIcon}><i className="fa-solid fa-desktop" /></div>
      <div className={styles.totalLabel}>Total Devices</div>
      <div className={styles.totalValue}>{total.toLocaleString()}</div>
      <div className={styles.liveDot}><span className={styles.pulse} /> Live</div>
    </div>
  );
}

/* ── Main Component ── */
export default function ObservabilityPage() {
  const { data, isLoading } = useDataSource<ObsData>('itom', 'observability');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Infrastructure Monitoring Summary" icon="fa-solid fa-eye" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  /* Severity trends: merge parallel arrays into Recharts data */
  const trendData = data.severityTrends.hours.map((h, i) => ({
    hour: h,
    critical: data.severityTrends.critical[i],
    major: data.severityTrends.major[i],
    minor: data.severityTrends.minor[i],
  }));

  /* Heatmap transform: number[] → Record<string, number> */
  const heatmapData = data.heatmapByHour.map(row => ({
    date: row.date,
    hours: Object.fromEntries(row.hours.map((v, i) => [String(i).padStart(2, '0'), v])),
  }));

  const alarm = data.alarmMonitoring;
  const alarmEntries: [string, AlarmKPI, string][] = [
    ['Active Critical', alarm.activeCritical, 'crit'],
    ['Active Major', alarm.activeMajor, 'major'],
    ['Active Minor', alarm.activeMinor, 'minor'],
    ['Total Active', alarm.totalActive, 'total'],
    ['Total Events', alarm.totalEvents, 'events'],
  ];

  const alarmColors: Record<string, string> = { crit: 'red', major: 'orange', minor: 'gold', total: 'blue', events: 'teal' };

  return (
    <>
      <Topbar
        title="Infrastructure Monitoring Summary"
        icon="fa-solid fa-eye"
        dateChips={[`${data.metadata.dateRange.from}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-solid fa-satellite-dish' }}
      />
      <PageContainer>
        {/* Device Status Row */}
        <div className={common.kpiRow5}>
          <TotalDevicesCard total={data.deviceStatus.totalDevices} />
          {data.deviceStatus.categories.map(cat => (
            <GaugeChart
              key={cat.name}
              value={cat.total}
              max={cat.total}
              available={cat.available}
              unavailable={cat.unavailable}
              label={cat.name}
              icon={cat.icon}
            />
          ))}
        </div>

        {/* Alarm Monitoring Summary */}
        <SectionLabel>Alarm Monitoring Summary</SectionLabel>
        <div className={common.kpiRow5}>
          {alarmEntries.map(([label, kpi, key]) => (
            <KPICard
              key={label}
              label={label}
              value={kpi.value.toLocaleString()}
              icon={kpi.icon}
              colorVariant={alarmColors[key] as 'red' | 'orange' | 'gold' | 'blue' | 'teal'}
              trend={kpi.trend}
            >
              {kpi.closedEvents !== undefined && (
                <div className={styles.closedLine}>Closed: {kpi.closedEvents.toLocaleString()}</div>
              )}
              {kpi.breakdown && (
                <div className={styles.breakdownLine}>
                  <span style={{ color: '#FF5A65' }}>{kpi.breakdown.critical} Crit</span>
                  {' | '}
                  <span style={{ color: '#c97b30' }}>{kpi.breakdown.major.toLocaleString()} Maj</span>
                  {' | '}
                  <span style={{ color: '#b8966a' }}>{kpi.breakdown.minor} Min</span>
                </div>
              )}
            </KPICard>
          ))}
        </div>

        {/* Charts: Severity Trends + Alert Activity by Day */}
        <div className={common.g2}>
          <ChartCard title="Event Severity Trends" subtitle="24-Hour">
            <NPCLineChart
              data={trendData}
              lines={[
                { dataKey: 'critical', color: '#FF5A65', name: 'Critical' },
                { dataKey: 'major', color: '#c97b30', name: 'Major' },
                { dataKey: 'minor', color: '#b8966a', name: 'Minor' },
              ]}
              xKey="hour"
              height={220}
            />
          </ChartCard>
          <ChartCard title="Alert Activity by Day">
            <DataTable
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'critical', label: 'Critical', align: 'center', render: (v) => <span style={{ color: '#FF5A65', fontWeight: 700 }}>{String(v)}</span> },
                { key: 'major', label: 'Major', align: 'center', render: (v) => <span style={{ color: '#c97b30', fontWeight: 700 }}>{String(v)}</span> },
                { key: 'minor', label: 'Minor', align: 'center', render: (v) => <span style={{ color: '#b8966a', fontWeight: 700 }}>{String(v)}</span> },
                { key: 'total', label: 'Total', align: 'center', render: (v) => <span style={{ fontWeight: 700 }}>{String(v)}</span> },
              ]}
              data={data.alertActivityByDay}
            />
          </ChartCard>
        </div>

        {/* Heatmap */}
        <ChartCard title="Alert Activity Heatmap — By Hour">
          <HeatmapTable data={heatmapData} hours={HEATMAP_HOURS} />
        </ChartCard>

        {/* Event Details */}
        <SectionLabel>Event Details</SectionLabel>
        <ChartCard title="Event Details">
          <DataTable
            columns={[
              { key: 'status', label: 'Status', render: (v) => <span style={{ color: statusColor(String(v)), fontWeight: 700 }}>{String(v)}</span> },
              { key: 'severity', label: 'Severity', align: 'center', render: (v) => <Badge variant={sevBadge(String(v))}>{String(v)}</Badge> },
              { key: 'creationTime', label: 'Creation Time' },
              { key: 'hostName', label: 'Host Name' },
              { key: 'message', label: 'Message' },
            ]}
            data={data.eventDetails}
            variant="event"
            sortable
          />
        </ChartCard>

        {/* Unavailable Devices */}
        <ChartCard title="Unavailable Devices" subtitle={`${data.unavailableDevices.length} devices`}>
          <DataTable
            columns={[
              { key: 'deviceName', label: 'Device Name' },
              { key: 'lastUpdate', label: 'Last Update' },
              { key: 'status', label: 'Status', align: 'center', render: () => <span style={{ color: '#FF5A65', fontWeight: 700 }}><i className="fa-solid fa-arrow-down" /> Down</span> },
            ]}
            data={data.unavailableDevices}
          />
        </ChartCard>
      </PageContainer>
    </>
  );
}
