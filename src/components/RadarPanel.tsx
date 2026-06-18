import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export interface RadarSeries {
  key: string // data key
  name: string // legend label
  color: string
}

export interface RadarRow {
  metric: string
  [seriesKey: string]: string | number
}

// Generic radar wrapper used by both the single-player profile (player vs
// benchmark) and the compare overlay (multiple players).
export function RadarPanel({
  data,
  series,
  height = 300,
}: {
  data: RadarRow[]
  series: RadarSeries[]
  height?: number
}) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} angle={90} />
          {series.map((s) => (
            <Radar
              key={s.key}
              name={s.name}
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            formatter={(value: number | string, name: string) => [`p${value}`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
