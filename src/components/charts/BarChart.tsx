import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type BarProps,
} from 'recharts';
import { themeColors } from '../../theme/theme';

interface BarDef {
  dataKey: string;
  color?: string;
  name?: string;
  stackId?: string;
}

interface NPCBarChartProps {
  data: object[];
  bars: BarDef[];
  xKey: string;
  height?: number;
  stacked?: boolean;
}

export default function NPCBarChart({
  data,
  bars,
  xKey,
  height = 260,
  stacked = false,
}: NPCBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(237,237,237,0.08)" />
        <XAxis
          dataKey={xKey}
          tick={{ fill: 'rgba(180,184,188,1)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(237,237,237,0.08)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(180,184,188,1)', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(237,237,237,0.08)' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(3,15,31,0.95)',
            border: '1px solid rgba(237,237,237,0.13)',
            borderRadius: 6,
            fontSize: 11,
            color: '#fff',
          }}
        />
        {bars.map((b, i) => (
          <Bar
            key={b.dataKey}
            dataKey={b.dataKey}
            fill={b.color ?? themeColors.chart[i % themeColors.chart.length]}
            name={b.name ?? b.dataKey}
            stackId={stacked ? 'stack' : b.stackId}
            radius={[2, 2, 0, 0] as BarProps['radius']}
          />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
}
