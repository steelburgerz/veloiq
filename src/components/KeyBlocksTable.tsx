import { KeyBlock } from '@/types'
import { cn } from '@/lib/utils'

const ZONE_BAR_COLOR: Record<string, string> = {
  Z1: 'bg-slate-400',
  Z2: 'bg-blue-400',
  Z3: 'bg-emerald-400',
  'Z3-4': 'bg-green-500',
  Z4: 'bg-yellow-400',
  Z5: 'bg-orange-400',
  'Z5-6': 'bg-red-400',
  Z6: 'bg-red-500',
  Z7: 'bg-purple-500',
  SS: 'bg-indigo-400',
}

const ZONE_TEXT: Record<string, string> = {
  Z1: 'text-slate-500',
  Z2: 'text-blue-600 dark:text-blue-400',
  Z3: 'text-emerald-600 dark:text-emerald-400',
  'Z3-4': 'text-green-600 dark:text-green-400',
  Z4: 'text-yellow-600 dark:text-yellow-400',
  Z5: 'text-orange-500 dark:text-orange-400',
  'Z5-6': 'text-red-500',
  Z6: 'text-red-600 dark:text-red-400',
  Z7: 'text-purple-600 dark:text-purple-400',
  SS: 'text-indigo-600 dark:text-indigo-400',
}

function pctLabel(pct: number | null): { text: string; cls: string } {
  if (pct === null) return { text: '—', cls: 'text-muted-foreground' }
  if (pct >= 1.2)  return { text: `${Math.round(pct * 100)}%`, cls: 'text-purple-600 dark:text-purple-400 font-bold' }
  if (pct >= 1.06) return { text: `${Math.round(pct * 100)}%`, cls: 'text-red-500 font-semibold' }
  if (pct >= 0.91) return { text: `${Math.round(pct * 100)}%`, cls: 'text-yellow-600 dark:text-yellow-400 font-semibold' }
  if (pct >= 0.76) return { text: `${Math.round(pct * 100)}%`, cls: 'text-emerald-600 dark:text-emerald-400' }
  return { text: `${Math.round(pct * 100)}%`, cls: 'text-blue-500 dark:text-blue-400' }
}

function fmtDur(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}m`
  return `${m}m${s}s`
}

interface KeyBlocksTableProps {
  blocks: KeyBlock[]
  ftp?: number
}

export function KeyBlocksTable({ blocks, ftp = 270 }: KeyBlocksTableProps) {
  const maxPower = Math.max(...blocks.map(b => b.avg_power_w ?? 0), ftp)

  return (
    <div className="rounded-2xl border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 px-4 py-2 bg-muted/40 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Block</span>
        <span className="text-right">Dur</span>
        <span className="text-right">Watts</span>
        <span className="text-right">% FTP</span>
        <span className="text-right hidden sm:block">HR</span>
        <span className="text-right hidden sm:block">Cad</span>
      </div>

      {/* Rows */}
      {blocks.map((block, i) => {
        const pct = block.power_pct_ftp
        const { text: pctText, cls: pctCls } = pctLabel(pct)
        const barColor = block.zone ? (ZONE_BAR_COLOR[block.zone] ?? 'bg-slate-400') : 'bg-slate-400'
        const zoneText = block.zone ? (ZONE_TEXT[block.zone] ?? 'text-muted-foreground') : 'text-muted-foreground'
        const barWidth = block.avg_power_w ? Math.min(100, (block.avg_power_w / maxPower) * 100) : 0
        const totalSec = block.duration_sec * block.count

        return (
          <div
            key={i}
            className={cn(
              'grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 px-4 py-2.5 border-b last:border-0 items-center',
              'hover:bg-muted/30 transition-colors'
            )}
          >
            {/* Label + zone + power bar */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                {block.zone && (
                  <span className={cn('text-xs font-bold tabular-nums shrink-0', zoneText)}>
                    {block.zone}
                  </span>
                )}
                <span className="text-sm truncate">{block.label}</span>
                {block.count > 1 && (
                  <span className="text-xs text-muted-foreground shrink-0">{block.count}×</span>
                )}
              </div>
              {/* Inline power bar */}
              {block.avg_power_w !== null && (
                <div className="h-1 rounded-full bg-muted overflow-hidden w-full max-w-[180px]">
                  <div
                    className={cn('h-full rounded-full', barColor)}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="text-right tabular-nums">
              <span className="text-sm font-medium">{fmtDur(block.duration_sec)}</span>
              {block.count > 1 && (
                <p className="text-xs text-muted-foreground">{fmtDur(totalSec)} tot</p>
              )}
            </div>

            {/* Watts */}
            <div className="text-right tabular-nums">
              {block.avg_power_w !== null
                ? <span className="text-sm font-bold">{block.avg_power_w}W</span>
                : <span className="text-muted-foreground">—</span>
              }
            </div>

            {/* % FTP */}
            <div className={cn('text-right tabular-nums text-sm', pctCls)}>
              {pctText}
            </div>

            {/* HR — hidden on mobile */}
            <div className="text-right tabular-nums hidden sm:block">
              {block.avg_hr_bpm !== null
                ? <span className="text-sm text-muted-foreground">{block.avg_hr_bpm}</span>
                : <span className="text-muted-foreground/40">—</span>
              }
            </div>

            {/* Cadence — hidden on mobile */}
            <div className="text-right tabular-nums hidden sm:block">
              {block.avg_cadence_rpm !== null
                ? <span className="text-sm text-muted-foreground">{block.avg_cadence_rpm}</span>
                : <span className="text-muted-foreground/40">—</span>
              }
            </div>
          </div>
        )
      })}

      {/* Footer — FTP reference */}
      <div className="px-4 py-2 bg-muted/20 flex items-center gap-4 text-xs text-muted-foreground">
        <span>FTP: <span className="font-semibold text-foreground">{ftp}W</span></span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-emerald-400 inline-block" /> Z3 76–90%</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-yellow-400 inline-block" /> Z4 91–105%</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-3 rounded-full bg-red-500 inline-block" /> Z5+ &gt;106%</span>
      </div>
    </div>
  )
}
