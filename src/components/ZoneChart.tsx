'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ZonesSec } from '@/types'

const ZONE_COLORS: Record<string, string> = {
  Z1: '#94a3b8',
  Z2: '#60a5fa',
  Z3: '#34d399',
  Z4: '#fbbf24',
  Z5: '#f97316',
  Z6: '#ef4444',
  Z7: '#a855f7',
  SS: '#818cf8',
}

const ZONE_LABELS: Record<string, string> = {
  Z1: 'Z1 Recovery',
  Z2: 'Z2 Endurance',
  Z3: 'Z3 Tempo',
  Z4: 'Z4 Threshold',
  Z5: 'Z5 VO2',
  Z6: 'Z6 Anaerobic',
  Z7: 'Z7 Neuro',
  SS: 'Sweet Spot',
}

function fmtMin(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

interface ZoneChartProps {
  zones: ZonesSec
  totalSec: number
}

export function ZoneChart({ zones, totalSec }: ZoneChartProps) {
  const data = Object.entries(zones)
    .filter(([, sec]) => sec && sec > 0)
    .map(([zone, sec]) => ({
      zone,
      label: ZONE_LABELS[zone] ?? zone,
      minutes: Math.round((sec ?? 0) / 60 * 10) / 10,
      pct: Math.round(((sec ?? 0) / totalSec) * 1000) / 10,
    }))
    .sort((a, b) => {
      const order = ['Z1', 'Z2', 'SS', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7']
      return order.indexOf(a.zone) - order.indexOf(b.zone)
    })

  return (
    <div className="space-y-3">
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 80, bottom: 0 }}>
            <XAxis type="number" unit="min" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={80} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(val: any) => [`${val} min`, 'Time']}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="minutes" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.zone} fill={ZONE_COLORS[entry.zone] ?? '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend with % */}
      <div className="flex flex-wrap gap-2">
        {data.map((d) => (
          <div key={d.zone} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full inline-block" style={{ background: ZONE_COLORS[d.zone] ?? '#94a3b8' }} />
            <span>{d.zone}</span>
            <span className="font-medium text-foreground">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
