import { useState } from 'react';
import { useDataSource } from '../../data/hooks/useDataSource';
import Topbar from '../../components/layout/Topbar';
import PageContainer from '../../components/layout/PageContainer';
import common from '../itsm/itsm-common.module.css';
import styles from './EntraPage.module.css';
import UsersPanel from './entra/UsersPanel';
import GroupsPanel from './entra/GroupsPanel';
import AppsPanel from './entra/AppsPanel';
import DevicesPanel from './entra/DevicesPanel';
import PAMPanel from './entra/PAMPanel';

/* ── Types ── */
export interface EntraKPI {
  label: string;
  value: number;
  badge?: string;
  badgeVariant?: 'info' | 'good' | 'warn' | 'crit';
  subtitle?: string;
  records?: number;
  colorOverride?: string;
  sublabel?: string;
  highlighted?: boolean;
  target?: string;
}

export interface EntraData {
  metadata: { source: string; dateRange: { from: string; to: string }; lastRefresh: string };
  tabs: string[];
  users: {
    kpis: EntraKPI[];
    staleAccountBreakdown: { period: string; members: number; guests: number }[];
    guestUsersByDomain: { domain: string; total: number; active: number }[];
    userDirectory: { firstName: string; lastName: string; email: string; department: string; designation: string; type: string; status: string; licenses: string }[];
    totalEntries: number;
  };
  groups: {
    kpis: EntraKPI[];
    groupTypeDistribution: { type: string; percentage: number; color: string }[];
    groupDirectory: { name: string; type: string; membership: string; members: number; hasOwner: boolean; orphan: boolean }[];
    totalEntries: number;
  };
  apps: {
    kpis: EntraKPI[];
    credentialExpiryDistribution: { period: string; count: number }[];
    appRegistry: { name: string; owner: string | null; expiringDays: number; highPrivilege: boolean; adminConsent: boolean; orphan: boolean }[];
    totalEntries: number;
  };
  devices: {
    kpis: EntraKPI[];
    deviceDistributionByOS: { os: string; percentage: number; color: string }[];
    deviceRegistry: { name: string; os: string; compliance: string; trustType: string; managed: boolean; lastCheckIn: string }[];
    totalEntries: number;
  };
  pam: {
    kpis: EntraKPI[];
    roleAssignment: { role: string; permanent: number; pimEligible: number }[];
    recentPIMActivations: { user: string; role: string; activated: string; duration: string; reason: string }[];
    privilegedUsers: { name: string; email: string; role: string; assignment: string; licenses: string; lastActivated: string | null }[];
  };
}

const TAB_CONFIG = [
  { key: 'users', label: 'User Details', icon: 'fa-solid fa-users' },
  { key: 'groups', label: 'Group Details', icon: 'fa-solid fa-layer-group' },
  { key: 'apps', label: 'App Registrations', icon: 'fa-solid fa-cube' },
  { key: 'devices', label: 'Devices', icon: 'fa-solid fa-laptop' },
  { key: 'pam', label: 'Privileged Access', icon: 'fa-solid fa-key' },
];

export default function EntraPage() {
  const { data, isLoading } = useDataSource<EntraData>('itam', 'entra');
  const [activeTab, setActiveTab] = useState('users');

  if (isLoading || !data) {
    return (
      <>
        <Topbar title="Entra ID" icon="fa-solid fa-shield-halved" />
        <PageContainer><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></PageContainer>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Entra ID"
        icon="fa-solid fa-shield-halved"
        dateChips={[`${data.metadata.dateRange.from} — ${data.metadata.dateRange.to}`]}
        sourceChip={{ label: data.metadata.source, icon: 'fa-brands fa-microsoft' }}
      />
      <PageContainer>
        <div className={common.tabRow}>
          {TAB_CONFIG.map(t => (
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

        {activeTab === 'users' && <UsersPanel data={data.users} />}
        {activeTab === 'groups' && <GroupsPanel data={data.groups} />}
        {activeTab === 'apps' && <AppsPanel data={data.apps} />}
        {activeTab === 'devices' && <DevicesPanel data={data.devices} />}
        {activeTab === 'pam' && <PAMPanel data={data.pam} />}
      </PageContainer>
    </>
  );
}

/* ── Shared Entra KPI Grid (used by all panels) ── */
const BADGE_VARIANT_MAP: Record<string, string> = {
  info: 'blue', good: 'green', warn: 'orange', crit: 'red',
};

export function EntraKPIGrid({ kpis }: { kpis: EntraKPI[] }) {
  return (
    <div className={common.kpiRow6}>
      {kpis.map((k, i) => (
        <div
          key={i}
          className={`${styles.entraCard} ${k.highlighted ? styles.highlighted : ''}`}
          style={k.colorOverride ? { borderTopColor: k.colorOverride } : undefined}
        >
          <div className={styles.entraHeader}>
            <span className={styles.entraLabel}>
              {k.label}
              {k.sublabel && <span className={styles.entraSublabel}>{k.sublabel}</span>}
            </span>
            {k.badge && (
              <span className={`${styles.entraBadge} ${styles[`b${BADGE_VARIANT_MAP[k.badgeVariant ?? 'info']}`]}`}>
                {k.badge}
              </span>
            )}
          </div>
          <div className={styles.entraValue}>{k.value.toLocaleString()}</div>
          {k.subtitle && <div className={styles.entraSubtitle}>{k.subtitle}</div>}
          {k.target && <div className={styles.entraTarget}>Target: {k.target}</div>}
          {k.records != null && (
            <div className={styles.entraRecords}>{k.records} records</div>
          )}
        </div>
      ))}
    </div>
  );
}
