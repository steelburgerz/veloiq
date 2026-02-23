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

// Boundaries as % of max HR
const HR_ZONE_PCT: Record<string, [number, number]> = {
  Z1: [50,  60],
  Z2: [60,  70],
  Z3: [70,  80],
  Z4: [80,  90],
  Z5: [90, 100],
  Z6: [100,110],
  Z7: [110, 999],
}

function hrRange(zone: string, maxHr: number): string {
  const pct = HR_ZONE_PCT[zone]
  if (!pct) return ''
  const lo = Math.round(maxHr * pct[0] / 100)
  const hi = pct[1] >= 999 ? null : Math.round(maxHr * pct[1] / 100)
  return hi ? `${lo}–${hi}` : `>${lo}`
}

interface HrZoneChartProps {
  zones: ZonesSec
  totalSec: number
  maxHr?: number
}

export function HrZoneChart({ zones, totalSec, maxHr = 177 }: HrZoneChartProps) {
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 mt-1">
        {data.map((d) => (
          <div key={d.zone} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: ZONE_COLORS[d.zone] ?? '#94a3b8' }} />
            <span className="text-muted-foreground">{d.zone}</span>
            <span className="text-muted-foreground/60">{hrRange(d.zone, maxHr)} bpm</span>
            <span className="font-medium text-foreground ml-auto">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
