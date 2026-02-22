import { Ride, SessionType } from '@/types'
import { formatDuration } from '@/lib/format'
import { TrainingEffectBadge } from '@/components/TrainingEffectBadge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ChevronRight, Bike, MonitorPlay } from 'lucide-react'

const OUTDOOR_GEAR = 'b16927637'

const sessionColors: Record<SessionType, string> = {
  threshold:  'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  tempo:      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  vo2:        'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  endurance:  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  long_ride:  'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  mixed:      'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  recovery:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  race:       'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
}

interface RideRowProps {
  ride: Ride
}

export function RideRow({ ride }: RideRowProps) {
  const dateStr = new Date(ride.date).toLocaleDateString('en-SG', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
  const isOutdoor = ride.gear_id === OUTDOOR_GEAR

  return (
    <Link
      href={`/ride/${ride.strava_id}`}
      className="flex items-center gap-3 py-3 border-b last:border-0 hover:bg-muted/40 -mx-4 px-4 transition-colors group"
    >
      {/* Bike type icon */}
      <div className="shrink-0 text-muted-foreground/60" title={isOutdoor ? 'Outdoor' : 'Zwift / Indoor'}>
        {isOutdoor
          ? <Bike className="h-3.5 w-3.5 text-sky-500" />
          : <MonitorPlay className="h-3.5 w-3.5 text-indigo-400" />
        }
      </div>

      {/* Date */}
      <div className="w-20 shrink-0 text-xs text-muted-foreground">{dateStr}</div>

      {/* Label + badges */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{ride.label}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', sessionColors[ride.session_type])}>
            {ride.session_type.replace('_', ' ')}
          </span>
          {ride.aerobic_te !== null && (
            <TrainingEffectBadge aerobic={ride.aerobic_te} anaerobic={ride.anaerobic_te ?? 0} size="sm" />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        {ride.np_w && (
          <div className="text-right">
            <p className="font-semibold text-foreground">{ride.np_w}W</p>
            <p>NP</p>
          </div>
        )}
        <div className="text-right">
          <p className="font-semibold text-foreground">{ride.distance_km.toFixed(0)}km</p>
          <p>{formatDuration(ride.duration_min)}</p>
        </div>
        {ride.intervals_load && (
          <div className="text-right">
            <p className="font-semibold text-foreground">{ride.intervals_load}</p>
            <p>Load</p>
          </div>
        )}
        {ride.suffer_score !== null && ride.suffer_score !== undefined && (
          <div className="text-right">
            <p className={cn('font-semibold',
              ride.suffer_score >= 200 ? 'text-red-500' :
              ride.suffer_score >= 100 ? 'text-orange-500' :
              'text-foreground'
            )}>
              {ride.suffer_score}
            </p>
            <p>Suffer</p>
          </div>
        )}
        {ride.tsb !== null && ride.tsb !== undefined && (
          <div className="text-right">
            <p className={cn('font-semibold', (ride.tsb ?? 0) >= 0 ? 'text-green-600' : 'text-red-500')}>
              {(ride.tsb ?? 0) > 0 ? '+' : ''}{(ride.tsb ?? 0).toFixed(1)}
            </p>
            <p>TSB</p>
          </div>
        )}
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
    </Link>
  )
}
