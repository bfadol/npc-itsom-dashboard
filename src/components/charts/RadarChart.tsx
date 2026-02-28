import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface RadarDataPoint {
  axis: string;
  value: number;
  color?: string;
}

interface NPCRadarChartProps {
  data: RadarDataPoint[];
  max?: number;
  size?: number;
  fillColor?: string;
  strokeColor?: string;
}

export default function NPCRadarChart({
  data,
  max = 5,
  size = 280,
  fillColor = 'rgba(139,24,55,0.25)',
  strokeColor = '#b8223f',
}: NPCRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={size}>
      <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid
          gridType="polygon"
          stroke="rgba(162,149,116,0.15)"
        />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: 'rgba(180,184,188,0.8)', fontSize: 10 }}
        />
        <PolarRadiusAxis
          domain={[0, max]}
          tickCount={max + 1}
          tick={{ fill: 'rgba(180,184,188,0.4)', fontSize: 8 }}
          axisLine={false}
        />
        <Radar
          dataKey="value"
          stroke={strokeColor}
          fill={fillColor}
          strokeWidth={2}
          dot={{ r: 4, fill: strokeColor, stroke: strokeColor }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
