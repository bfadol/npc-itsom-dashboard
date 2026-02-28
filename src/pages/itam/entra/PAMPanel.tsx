import { EntraKPIGrid, type EntraData } from '../EntraPage';
import ChartCard from '../../../components/data-display/ChartCard';
import DataTable from '../../../components/data-display/DataTable';
import Badge from '../../../components/data-display/Badge';
import SectionLabel from '../../../components/data-display/SectionLabel';

type PAMData = EntraData['pam'];

function assignmentBadge(val: unknown) {
  const v = val as string;
  if (v === 'Permanent') return <Badge variant="orange">{v}</Badge>;
  return <Badge variant="green">{v}</Badge>;
}

function lastActivatedCell(val: unknown) {
  if (!val) return <span style={{ color: 'var(--text-dim)' }}>Never</span>;
  return String(val);
}

const roleCols = [
  { key: 'role', label: 'Role' },
  { key: 'permanent', label: 'Permanent', align: 'right' as const },
  { key: 'pimEligible', label: 'PIM Eligible', align: 'right' as const },
];

const pimCols = [
  { key: 'user', label: 'User' },
  { key: 'role', label: 'Role' },
  { key: 'activated', label: 'Activated' },
  { key: 'duration', label: 'Duration' },
  { key: 'reason', label: 'Reason' },
];

const privilegedCols = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'assignment', label: 'Assignment', render: assignmentBadge },
  { key: 'licenses', label: 'Licenses' },
  { key: 'lastActivated', label: 'Last Activated', render: lastActivatedCell },
];

export default function PAMPanel({ data }: { data: PAMData }) {
  return (
    <>
      <EntraKPIGrid kpis={data.kpis} />

      <SectionLabel>Role Assignments</SectionLabel>
      <ChartCard title="Role Assignment Summary">
        <DataTable columns={roleCols} data={data.roleAssignment} />
      </ChartCard>

      <SectionLabel>PIM Activity</SectionLabel>
      <ChartCard title="Recent PIM Activations">
        <DataTable columns={pimCols} data={data.recentPIMActivations} />
      </ChartCard>

      <SectionLabel>Privileged Users</SectionLabel>
      <DataTable columns={privilegedCols} data={data.privilegedUsers} sortable />
    </>
  );
}
