import { EntraKPIGrid, type EntraData } from '../EntraPage';
import ChartCard from '../../../components/data-display/ChartCard';
import DataTable from '../../../components/data-display/DataTable';
import Badge from '../../../components/data-display/Badge';
import ProgressBar from '../../../components/data-display/ProgressBar';
import SectionLabel from '../../../components/data-display/SectionLabel';
import common from '../../itsm/itsm-common.module.css';

type DevicesData = EntraData['devices'];

function complianceBadge(val: unknown) {
  const v = val as string;
  return <Badge variant={v === 'Compliant' ? 'green' : 'red'}>{v}</Badge>;
}

function managedIcon(val: unknown) {
  const v = val as boolean;
  return v
    ? <i className="fa-solid fa-check" style={{ color: 'var(--color-green)' }} />
    : <i className="fa-solid fa-xmark" style={{ color: 'var(--color-red)', opacity: 0.6 }} />;
}

const registryCols = [
  { key: 'name', label: 'Device Name' },
  { key: 'os', label: 'OS' },
  { key: 'compliance', label: 'Compliance', render: complianceBadge },
  { key: 'trustType', label: 'Trust Type' },
  { key: 'managed', label: 'Managed', align: 'center' as const, render: managedIcon },
  { key: 'lastCheckIn', label: 'Last Check-In' },
];

export default function DevicesPanel({ data }: { data: DevicesData }) {
  return (
    <>
      <EntraKPIGrid kpis={data.kpis} />

      <SectionLabel>Device Overview</SectionLabel>
      <div className={common.g2}>
        <ChartCard title="Device Distribution by OS">
          {data.deviceDistributionByOS.map(d => (
            <ProgressBar
              key={d.os}
              label={`${d.os} (${d.percentage}%)`}
              value={d.percentage}
              color={d.color}
            />
          ))}
        </ChartCard>
        <ChartCard title="Device Registry">
          <DataTable columns={registryCols} data={data.deviceRegistry} sortable />
        </ChartCard>
      </div>
    </>
  );
}
