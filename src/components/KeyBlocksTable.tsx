import { KeyBlock } from '@/types'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/format'

const ZONE_COLORS: Record<string, string> = {
  Z1: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Z2: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Z3: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Z3-4': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  Z4: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  Z5: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'Z5-6': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Z6: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',
  Z7: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  SS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
}

function pctToColor(pct: number | null): string {
  if (pct === null) return 'text-muted-foreground'
  if (pct >= 1.06) return 'text-purple-600 dark:text-purple-400 font-bold'
  if (pct >= 0.91) return 'text-yellow-600 dark:text-yellow-400 font-semibold'
  if (pct >= 0.76) return 'text-emerald-600 dark:text-emerald-400'
  return 'text-blue-500 dark:text-blue-400'
}

interface KeyBlocksTableProps {
  blocks: KeyBlock[]
  ftp?: number
}

export function KeyBlocksTable({ blocks, ftp = 270 }: KeyBlocksTableProps) {
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const zoneCls = block.zone ? (ZONE_COLORS[block.zone] ?? ZONE_COLORS['Z3']) : ZONE_COLORS['Z3']
        const pct = block.power_pct_ftp
        const totalSec = block.duration_sec * block.count
        return (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm capitalize">{block.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  {block.zone && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', zoneCls)}>
                      {block.zone}
                    </span>
                  )}
                  {block.count > 1 && (
                    <span className="text-xs text-muted-foreground">{block.count}×</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(block.duration_sec / 60)} each
                    {block.count > 1 ? ` · ${formatDuration(totalSec / 60)} total` : ''}
                  </span>
                </div>
              </div>
              {pct !== null && (
                <div className="text-right shrink-0">
                  <p className={cn('text-lg font-bold', pctToColor(pct))}>
                    {Math.round(pct * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">of FTP</p>
                </div>
              )}
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {block.avg_power_w !== null && (
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-base font-bold">{block.avg_power_w}W</p>
                  <p className="text-xs text-muted-foreground">Avg Power</p>
                </div>
              )}
              {block.avg_hr_bpm !== null && (
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-base font-bold">{block.avg_hr_bpm}</p>
                  <p className="text-xs text-muted-foreground">Avg HR</p>
                </div>
              )}
              {block.avg_cadence_rpm !== null && (
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-base font-bold">{block.avg_cadence_rpm}</p>
                  <p className="text-xs text-muted-foreground">Cadence</p>
                </div>
              )}
            </div>

            {/* Power bar relative to FTP */}
            {block.avg_power_w !== null && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>0W</span>
                  <span className="text-foreground font-medium">{ftp}W FTP</span>
                  <span>{Math.round(ftp * 1.2)}W</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      pct && pct >= 1.06 ? 'bg-purple-500' :
                      pct && pct >= 0.91 ? 'bg-yellow-500' :
                      pct && pct >= 0.76 ? 'bg-emerald-500' : 'bg-blue-400'
                    )}
                    style={{ width: `${Math.min(100, (block.avg_power_w / (ftp * 1.2)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
