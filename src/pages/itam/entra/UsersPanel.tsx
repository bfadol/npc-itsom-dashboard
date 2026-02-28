import { EntraKPIGrid, type EntraData } from '../EntraPage';
import ChartCard from '../../../components/data-display/ChartCard';
import DataTable from '../../../components/data-display/DataTable';
import Badge from '../../../components/data-display/Badge';
import SectionLabel from '../../../components/data-display/SectionLabel';
import common from '../../itsm/itsm-common.module.css';

type UsersData = EntraData['users'];

function typeBadge(_: unknown, row: Record<string, unknown>) {
  const t = row.type as string;
  return <Badge variant={t === 'member' ? 'blue' : 'orange'}>{t === 'member' ? 'Member' : 'Guest'}</Badge>;
}

function statusBadge(_: unknown, row: Record<string, unknown>) {
  const s = row.status as string;
  return <Badge variant={s === 'active' ? 'green' : 'red'}>{s === 'active' ? 'Active' : 'Inactive'}</Badge>;
}

const staleCols = [
  { key: 'period', label: 'Period' },
  { key: 'members', label: 'Members', align: 'right' as const },
  { key: 'guests', label: 'Guests', align: 'right' as const },
];

const guestCols = [
  { key: 'domain', label: 'Domain' },
  { key: 'total', label: 'Total', align: 'right' as const },
  { key: 'active', label: 'Active', align: 'right' as const },
];

const directoryCols = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'type', label: 'Type', render: typeBadge },
  { key: 'status', label: 'Status', render: statusBadge },
  { key: 'licenses', label: 'Licenses' },
];

export default function UsersPanel({ data }: { data: UsersData }) {
  return (
    <>
      <EntraKPIGrid kpis={data.kpis} />

      <SectionLabel>Account Analysis</SectionLabel>
      <div className={common.g2}>
        <ChartCard title="Stale Account Breakdown">
          <DataTable columns={staleCols} data={data.staleAccountBreakdown} />
        </ChartCard>
        <ChartCard title="Guest Users by Domain">
          <DataTable columns={guestCols} data={data.guestUsersByDomain} />
        </ChartCard>
      </div>

      <SectionLabel>User Directory</SectionLabel>
      <DataTable columns={directoryCols} data={data.userDirectory} sortable />
    </>
  );
}
