import { cn } from '@/lib/utils'

const AE_LABELS = ['', 'Recovery', 'Maintaining', 'Improving', 'Highly Effective', 'Overreaching']
const AE_COLORS = [
  '',
  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
]

function teLevel(val: number): number {
  if (val < 1) return 0
  return Math.min(5, Math.floor(val))
}

interface TrainingEffectBadgeProps {
  aerobic: number
  anaerobic: number
  size?: 'sm' | 'md'
}

export function TrainingEffectBadge({ aerobic, anaerobic, size = 'sm' }: TrainingEffectBadgeProps) {
  const aeLevel = teLevel(aerobic)
  const label = AE_LABELS[aeLevel] ?? 'Unknown'
  const colorCls = AE_COLORS[aeLevel] ?? AE_COLORS[0]

  if (size === 'sm') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium', colorCls)}>
        <span>AE {aerobic.toFixed(1)}</span>
      </span>
    )
  }

  return (
    <div className="space-y-3">
      {/* Aerobic TE */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium">Aerobic</span>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colorCls)}>{label}</span>
            <span className="text-sm font-bold">{aerobic.toFixed(1)}</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', aeLevel >= 4 ? 'bg-indigo-500' : aeLevel >= 3 ? 'bg-emerald-500' : aeLevel >= 2 ? 'bg-blue-400' : 'bg-slate-400')}
            style={{ width: `${(aerobic / 5) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
          <span>Recovery</span><span>Maintaining</span><span>Improving</span><span>Highly Eff.</span><span>Overreach</span>
        </div>
      </div>

      {/* Anaerobic TE */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium">Anaerobic</span>
          <span className="text-sm font-bold">{anaerobic.toFixed(1)}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${(anaerobic / 5) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
          <span>Low</span><span>Moderate</span><span>High</span><span>Peak</span>
        </div>
      </div>
    </div>
  )
}
