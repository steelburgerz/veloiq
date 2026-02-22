import { getTitiDaysRemaining } from '@/lib/titi'
import { Flag } from 'lucide-react'

export function TitiCountdown() {
  const days = getTitiDaysRemaining()
  const weeks = Math.floor(days / 7)
  const remaining = days % 7

  return (
    <div className="rounded-2xl border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Flag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">TiTi Ultra 2026</p>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold text-indigo-700 dark:text-indigo-300">{days}</span>
        <span className="text-lg text-indigo-500">days</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {weeks > 0 ? `${weeks}w ${remaining}d` : `${days}d`} · April 25, 2026 · ~120km
      </p>
      <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
        <div>
          <p className="font-semibold text-foreground text-sm">270W</p>
          <p>Target FTP</p>
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">~120km</p>
          <p>Distance</p>
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">🏆</p>
          <p>Race to place</p>
        </div>
      </div>
    </div>
  )
}
