import { EntraKPIGrid, type EntraData } from '../EntraPage';
import ChartCard from '../../../components/data-display/ChartCard';
import DataTable from '../../../components/data-display/DataTable';
import Badge from '../../../components/data-display/Badge';
import ProgressBar from '../../../components/data-display/ProgressBar';
import SectionLabel from '../../../components/data-display/SectionLabel';
import common from '../../itsm/itsm-common.module.css';

type GroupsData = EntraData['groups'];

function ownerBadge(_: unknown, row: Record<string, unknown>) {
  const has = row.hasOwner as boolean;
  return has
    ? <i className="fa-solid fa-check" style={{ color: 'var(--color-green)' }} />
    : <i className="fa-solid fa-xmark" style={{ color: 'var(--color-red)', opacity: 0.6 }} />;
}

function orphanBadge(_: unknown, row: Record<string, unknown>) {
  const is = row.orphan as boolean;
  return is ? <Badge variant="red">Orphan</Badge> : <span style={{ color: 'var(--text-dim)' }}>—</span>;
}

const directoryCols = [
  { key: 'name', label: 'Group Name' },
  { key: 'type', label: 'Type' },
  { key: 'membership', label: 'Membership' },
  { key: 'members', label: 'Members', align: 'right' as const },
  { key: 'hasOwner', label: 'Owner', align: 'center' as const, render: ownerBadge },
  { key: 'orphan', label: 'Status', render: orphanBadge },
];

export default function GroupsPanel({ data }: { data: GroupsData }) {
  return (
    <>
      <EntraKPIGrid kpis={data.kpis} />

      <SectionLabel>Group Overview</SectionLabel>
      <div className={common.g2}>
        <ChartCard title="Group Type Distribution">
          {data.groupTypeDistribution.map(g => (
            <ProgressBar
              key={g.type}
              label={g.type}
              value={g.percentage}
              color={g.color}
            />
          ))}
        </ChartCard>
        <ChartCard title="Group Directory">
          <DataTable columns={directoryCols} data={data.groupDirectory} sortable />
        </ChartCard>
      </div>
    </>
  );
}
