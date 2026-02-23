'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
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
  Z1: 'Recovery',
  Z2: 'Endurance',
  Z3: 'Tempo',
  Z4: 'Threshold',
  Z5: 'VO₂ Max',
  Z6: 'Anaerobic',
  Z7: 'Neuromuscular',
  SS: 'Sweet Spot',
}

const ZONE_ORDER = ['Z1', 'Z2', 'SS', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7']

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`
  return `${s}s`
}

// Boundaries as % of FTP (upper bound, inclusive)
const ZONE_PCT: Record<string, [number, number]> = {
  Z1: [0,   55],
  Z2: [56,  75],
  Z3: [76,  90],
  SS: [88,  95],
  Z4: [91, 105],
  Z5: [106,120],
  Z6: [121,150],
  Z7: [151, 999],
}

function zoneRange(zone: string, ftp: number): string {
  const pct = ZONE_PCT[zone]
  if (!pct) return ''
  const lo = Math.round(ftp * pct[0] / 100)
  const hi = pct[1] >= 999 ? null : Math.round(ftp * pct[1] / 100)
  return hi ? `${lo}–${hi}W` : `>${lo}W`
}

interface Props {
  zones: ZonesSec
  totalSec: number
  ftp?: number
}

export function PowerZoneDonut({ zones, totalSec, ftp = 270 }: Props) {
  const data = ZONE_ORDER
    .filter((z) => {
      const k = z as keyof ZonesSec
      return zones[k] && (zones[k] ?? 0) > 0
    })
    .map((z) => {
      const k = z as keyof ZonesSec
      const sec = zones[k] ?? 0
      return {
        zone: z,
        label: ZONE_LABELS[z] ?? z,
        sec,
        pct: Math.round((sec / totalSec) * 1000) / 10,
      }
    })

  return (
    <div className="space-y-4">
      {/* Donut */}
      <div className="flex items-center gap-4">
        <div className="shrink-0" style={{ width: 130, height: 130 }}>
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie
                data={data}
                dataKey="sec"
                innerRadius={38}
                outerRadius={60}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.zone} fill={ZONE_COLORS[d.zone] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(val: any) => [fmtTime(Number(val)), 'Time']}
                contentStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {data.map((d) => (
            <div key={d.zone} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ background: ZONE_COLORS[d.zone] ?? '#94a3b8' }}
              />
              <span className="text-xs text-muted-foreground flex-1">{d.zone} {d.label}</span>
              <span className="text-xs text-muted-foreground/60 tabular-nums w-20">{zoneRange(d.zone, ftp)}</span>
              <span className="text-xs font-semibold tabular-nums">{d.pct}%</span>
              <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">{fmtTime(d.sec)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stacked bar */}
      <div className="rounded-full overflow-hidden h-2 flex w-full gap-px">
        {data.map((d) => (
          <div
            key={d.zone}
            style={{ width: `${d.pct}%`, background: ZONE_COLORS[d.zone] ?? '#94a3b8' }}
            title={`${d.zone}: ${d.pct}%`}
          />
        ))}
      </div>
    </div>
  )
}
