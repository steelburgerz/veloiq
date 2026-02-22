'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ZonesSec } from '@/types'

const ZONE_COLORS: Record<string, string> = {
  Z1: '#94a3b8', Z2: '#60a5fa', Z3: '#34d399',
  Z4: '#fbbf24', Z5: '#f97316', Z6: '#ef4444', Z7: '#a855f7',
}
const ZONE_LABELS: Record<string, string> = {
  Z1: 'Z1 Recovery', Z2: 'Z2 Aerobic', Z3: 'Z3 Tempo',
  Z4: 'Z4 Threshold', Z5: 'Z5 VO2', Z6: 'Z6 Anaerobic', Z7: 'Z7 Max',
}

interface HrZoneChartProps {
  zones: ZonesSec
  totalSec: number
}

export function HrZoneChart({ zones, totalSec }: HrZoneChartProps) {
  const data = Object.entries(zones)
    .filter(([k, sec]) => k !== 'SS' && sec && sec > 0)
    .map(([zone, sec]) => ({
      zone,
      label: ZONE_LABELS[zone] ?? zone,
      minutes: Math.round((sec ?? 0) / 60 * 10) / 10,
      pct: Math.round(((sec ?? 0) / totalSec) * 1000) / 10,
    }))
    .sort((a, b) => {
      const order = ['Z1','Z2','Z3','Z4','Z5','Z6','Z7']
      return order.indexOf(a.zone) - order.indexOf(b.zone)
    })

  return (
    <div className="space-y-3">
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 80, bottom: 0 }}>
            <XAxis type="number" unit="min" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={80} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip formatter={(val: any) => [`${val} min`, 'Time']} contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="minutes" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.zone} fill={ZONE_COLORS[entry.zone] ?? '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.map((d) => (
          <div key={d.zone} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: ZONE_COLORS[d.zone] ?? '#94a3b8' }} />
            <span>{d.zone}</span>
            <span className="font-medium text-foreground">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
