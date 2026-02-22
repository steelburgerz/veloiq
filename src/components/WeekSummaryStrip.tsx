import { WeekSummary, SessionType } from '@/types'
import { cn } from '@/lib/utils'

const sessionDots: Record<SessionType, string> = {
  threshold:  'bg-red-500',
  tempo:      'bg-orange-500',
  vo2:        'bg-purple-500',
  endurance:  'bg-blue-400',
  long_ride:  'bg-sky-500',
  mixed:      'bg-teal-500',
  recovery:   'bg-gray-400',
  race:       'bg-yellow-500',
}

interface WeekSummaryStripProps {
  weeks: WeekSummary[]
}

export function WeekSummaryStrip({ weeks }: WeekSummaryStripProps) {
  // Max load for bar scaling
  const maxLoad = Math.max(...weeks.map(w => w.totalLoad), 1)

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {weeks.map((week) => {
        const loadPct = (week.totalLoad / maxLoad) * 100
        const isCurrentWeek = week.weekLabel === 'This week'

        return (
          <div
            key={week.startDate}
            className={cn(
              'rounded-xl border p-3 space-y-2',
              isCurrentWeek && 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
            )}
          >
            {/* Week label */}
            <p className={cn('text-xs font-semibold truncate', isCurrentWeek ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground')}>
              {week.weekLabel}
            </p>

            {/* Load bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full', isCurrentWeek ? 'bg-indigo-500' : 'bg-muted-foreground/40')}
                style={{ width: `${loadPct}%` }}
              />
            </div>

            {/* Stats */}
            <div className="space-y-0.5">
              <p className="text-sm font-bold">{week.totalLoad} <span className="text-xs font-normal text-muted-foreground">load</span></p>
              <p className="text-xs text-muted-foreground">{week.totalHours}h · {week.totalDistance}km</p>
              {week.totalElev > 0 && (
                <p className="text-xs text-muted-foreground">↑{week.totalElev.toLocaleString()}m</p>
              )}
            </div>

            {/* Ride type dots */}
            {week.rides.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {week.rides.map((r, i) => (
                  <span
                    key={i}
                    title={`${r.session_type.replace('_', ' ')} — ${r.date}`}
                    className={cn('h-2 w-2 rounded-full', sessionDots[r.session_type] ?? 'bg-gray-400')}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/50">No rides</p>
            )}

            {/* TSB */}
            {week.avgTSB !== null && (
              <p className={cn('text-xs font-medium', week.avgTSB >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
                TSB {week.avgTSB > 0 ? '+' : ''}{week.avgTSB}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
