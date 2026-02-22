'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { LoadChartPoint } from '@/types'

interface LoadChartProps {
  data: LoadChartPoint[]
}

function formatDate(dateStr: unknown) {
  if (typeof dateStr !== 'string') return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}

export function LoadChart({ data }: LoadChartProps) {
  return (
    <div className="w-full" style={{ height: 256 }}>
      <ResponsiveContainer width="100%" height={256}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            labelFormatter={formatDate}
            contentStyle={{ fontSize: 12 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(val: any, name: any) => [val != null ? Number(val).toFixed(1) : '–', String(name).toUpperCase()]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="ctl" stroke="#6366f1" strokeWidth={2} dot={false} name="CTL" />
          <Line type="monotone" dataKey="atl" stroke="#f59e0b" strokeWidth={2} dot={false} name="ATL" />
          <Line type="monotone" dataKey="tsb" stroke="#22c55e" strokeWidth={2} dot={false} name="TSB" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
