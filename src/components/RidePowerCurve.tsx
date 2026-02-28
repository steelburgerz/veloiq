'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const CURVE_ORDER = ['5s','15s','30s','1min','2min','5min','10min','20min','30min','40min','1hr','1.5hr','2hr','3hr']

interface Props {
  curve: Record<string, number>
  ftp?: number
}

export function RidePowerCurve({ curve, ftp = 270 }: Props) {
  const data = CURVE_ORDER
    .filter(k => curve[k] != null)
    .map(k => ({ label: k, watts: curve[k] }))

  if (!data.length) return null

  const maxW = Math.max(...data.map(d => d.watts))

  return (
    <div className="space-y-3">
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, maxW + 20]} tick={{ fontSize: 11 }} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any) => [`${val}W`, 'Power']}
              contentStyle={{ fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="watts"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#pcGrad)"
              dot={{ r: 3, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Row summary */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {data.map(d => (
          <div key={d.label}>
            <p className="text-xs text-muted-foreground">{d.label}</p>
            <p className={`text-sm font-semibold ${ftp && d.watts >= ftp ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
              {d.watts}W
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
