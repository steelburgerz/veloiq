'use client'

import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'
import { EftpPoint } from '@/types'

interface EftpChartProps {
  data: EftpPoint[]
  ftp?: number
}

function formatDate(d: unknown) {
  if (typeof d !== 'string') return ''
  return new Date(d).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}

export function EftpChart({ data, ftp = 270 }: EftpChartProps) {
  const minEftp = Math.min(...data.map(d => d.eftp)) - 5
  const maxEftp = Math.max(...data.map(d => d.eftp)) + 5

  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
          <YAxis yAxisId="eftp" domain={[minEftp, maxEftp]} tick={{ fontSize: 11 }} />
          <YAxis yAxisId="ramp" orientation="right" tick={{ fontSize: 11 }}
            tickFormatter={v => `${v > 0 ? '+' : ''}${v}`} />
          <Tooltip
            labelFormatter={formatDate}
            contentStyle={{ fontSize: 12 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(val: any, name: any) => {
              if (name === 'eftp') return [`${val}W`, 'eFTP']
              if (name === 'rampRate') return [`${val > 0 ? '+' : ''}${val}`, 'Ramp Rate']
              return [val, name]
            }}
          />
          <ReferenceLine yAxisId="eftp" y={ftp} stroke="#6366f1" strokeDasharray="6 3"
            label={{ value: `FTP ${ftp}W`, position: 'insideTopLeft', fontSize: 10, fill: '#6366f1' }} />
          <ReferenceLine yAxisId="ramp" y={0} stroke="#9ca3af" strokeDasharray="2 2" />
          <Bar yAxisId="ramp" dataKey="rampRate" fill="#fbbf24" opacity={0.5} name="rampRate" radius={[2,2,0,0]} />
          <Line yAxisId="eftp" type="monotone" dataKey="eftp" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }} name="eftp" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
