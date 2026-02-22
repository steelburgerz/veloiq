'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ResponsiveContainer, Dot } from 'recharts'
import { WkgCheckpoint } from '@/types'

interface WkgChartProps {
  checkpoints: WkgCheckpoint[]
  targetWkg?: number
}

function formatDate(d: unknown) {
  if (typeof d !== 'string') return ''
  return new Date(d).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#6366f1" stroke="white" strokeWidth={2} />
    </g>
  )
}

export function WkgChart({ checkpoints, targetWkg = 3.86 }: WkgChartProps) {
  // Pad with a future target point
  const titiDate = '2026-04-25'
  const data = [
    ...checkpoints.map(c => ({ date: c.date, wkg: c.ftp_wkg, ftp: c.ftp_w, label: c.notes })),
    { date: titiDate, wkg: null, ftp: null, label: 'TiTi Ultra', target: targetWkg },
  ]

  const minWkg = Math.min(...checkpoints.map(c => c.ftp_wkg)) - 0.2
  const maxWkg = Math.max(targetWkg, ...checkpoints.map(c => c.ftp_wkg)) + 0.2

  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
          <YAxis domain={[minWkg, maxWkg]} tickFormatter={(v) => `${v.toFixed(2)}`} tick={{ fontSize: 11 }} />
          <Tooltip
            labelFormatter={formatDate}
            formatter={(val: unknown) => val != null ? [`${Number(val).toFixed(2)} W/kg`, 'FTP'] : ['—', 'FTP']}
            contentStyle={{ fontSize: 12 }}
          />
          <ReferenceLine
            y={targetWkg}
            stroke="#22c55e"
            strokeDasharray="6 3"
            label={{ value: `Target ${targetWkg}`, position: 'insideTopRight', fontSize: 11, fill: '#22c55e' }}
          />
          <Line
            type="monotone"
            dataKey="wkg"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={<CustomDot />}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
