import { EntraKPIGrid, type EntraData } from '../EntraPage';
import ChartCard from '../../../components/data-display/ChartCard';
import DataTable from '../../../components/data-display/DataTable';
import ProgressBar from '../../../components/data-display/ProgressBar';
import SectionLabel from '../../../components/data-display/SectionLabel';
import common from '../../itsm/itsm-common.module.css';
import entraStyles from '../EntraPage.module.css';

type AppsData = EntraData['apps'];

const EXPIRY_COLORS = ['#b8223f', '#c97b30', '#4a80d0', '#1a9e8a'];

function boolIcon(val: unknown) {
  const v = val as boolean;
  return v
    ? <i className={`fa-solid fa-check ${entraStyles.iconYes}`} />
    : <i className={`fa-solid fa-xmark ${entraStyles.iconNo}`} />;
}

function expiryCell(val: unknown) {
  const d = val as number;
  if (d === 0) return <span className={entraStyles.expiryNone}>Expired</span>;
  if (d <= 14) return <span className={entraStyles.expirySoon}>{d}d</span>;
  if (d <= 30) return <span className={entraStyles.expiryMed}>{d}d</span>;
  return <span className={entraStyles.expiryOk}>{d}d</span>;
}

function ownerCell(val: unknown) {
  return val ? String(val) : <span className={entraStyles.iconWarn}>No Owner</span>;
}

const registryCols = [
  { key: 'name', label: 'Application' },
  { key: 'owner', label: 'Owner', render: ownerCell },
  { key: 'expiringDays', label: 'Expiry', align: 'center' as const, render: expiryCell },
  { key: 'highPrivilege', label: 'High Priv', align: 'center' as const, render: boolIcon },
  { key: 'adminConsent', label: 'Admin Consent', align: 'center' as const, render: boolIcon },
  { key: 'orphan', label: 'Orphan', align: 'center' as const, render: (v: unknown) => (v as boolean) ? <i className={`fa-solid fa-triangle-exclamation ${entraStyles.iconWarn}`} /> : <span style={{ color: 'var(--text-dim)' }}>—</span> },
];

export default function AppsPanel({ data }: { data: AppsData }) {
  return (
    <>
      <EntraKPIGrid kpis={data.kpis} />

      <SectionLabel>Application Overview</SectionLabel>
      <div className={common.g2}>
        <ChartCard title="Credential Expiry Distribution">
          {data.credentialExpiryDistribution.map((c, i) => (
            <ProgressBar
              key={c.period}
              label={`${c.period} (${c.count})`}
              value={Math.round((c.count / 189) * 100)}
              color={EXPIRY_COLORS[i]}
            />
          ))}
        </ChartCard>
        <ChartCard title="App Registry">
          <DataTable columns={registryCols} data={data.appRegistry} sortable />
        </ChartCard>
      </div>
    </>
  );
}
