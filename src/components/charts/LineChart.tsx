import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { themeColors } from '../../theme/theme';

interface LineDef {
  dataKey: string;
  color?: string;
  name?: string;
  dashed?: boolean;
}

interface NPCLineChartProps {
  data: object[];
  lines: LineDef[];
  xKey: string;
  height?: number;
}

export default function NPCLineChart({
  data,
  lines,
  xKey,
  height = 260,
}: NPCLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        {lines.map((l, i) => (
          <Line
            key={l.dataKey}
            type="monotone"
            dataKey={l.dataKey}
            stroke={l.color ?? themeColors.chart[i % themeColors.chart.length]}
            name={l.name ?? l.dataKey}
            strokeWidth={2}
            dot={{ r: 3, fill: l.color ?? themeColors.chart[i % themeColors.chart.length] }}
            strokeDasharray={l.dashed ? '5 5' : undefined}
          />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  );
}
