'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, ReferenceLine, Dot,
} from 'recharts'
import { EfPoint } from '@/types'

interface EfChartProps {
  data: EfPoint[]
}

const SESSION_COLORS: Record<string, string> = {
  threshold:  '#ef4444',
  tempo:      '#f97316',
  vo2:        '#a855f7',
  endurance:  '#60a5fa',
  long_ride:  '#38bdf8',
  mixed:      '#2dd4bf',
  recovery:   '#94a3b8',
  race:       '#eab308',
}

function formatDate(d: unknown) {
  if (typeof d !== 'string') return ''
  return new Date(d).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props
  const color = SESSION_COLORS[payload.sessionType] ?? '#6366f1'
  return (
    <Dot
      cx={cx} cy={cy} r={4}
      fill={color}
      stroke="white"
      strokeWidth={2}
    />
  )
}

export function EfChart({ data }: EfChartProps) {
  if (!data.length) return (
    <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
      No efficiency factor data yet
    </div>
  )

  const values = data.map(d => d.ef)
  const minVal = Math.max(0.8, Math.min(...values) - 0.05)
  const maxVal = Math.min(2.2, Math.max(...values) + 0.05)

  return (
    <div className="space-y-3">
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
            <YAxis
              domain={[minVal, maxVal]}
              tickFormatter={v => v.toFixed(2)}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={formatDate}
              contentStyle={{ fontSize: 12 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any, _name: any, item: any) => [
                `${Number(val).toFixed(2)} (${item.payload.sessionType.replace('_', ' ')})`,
                'EF'
              ]}
            />
            {/* Good EF threshold */}
            <ReferenceLine
              y={1.35}
              stroke="#22c55e"
              strokeDasharray="6 3"
              label={{ value: 'Good ≥1.35', position: 'insideTopLeft', fontSize: 10, fill: '#22c55e' }}
            />
            <Line
              type="monotone"
              dataKey="ef"
              stroke="#6366f1"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="EF"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Session type legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(SESSION_COLORS)
          .filter(([key]) => data.some(d => d.sessionType === key))
          .map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full inline-block" style={{ background: color }} />
              {key.replace('_', ' ')}
            </div>
          ))}
      </div>
    </div>
  )
}
