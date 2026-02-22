import { Ride, SessionType } from '@/types'
import { formatDuration } from '@/lib/format'
import { TrainingEffectBadge } from '@/components/TrainingEffectBadge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Bike, MonitorPlay } from 'lucide-react'

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

const sessionBarColor: Record<SessionType, string> = {
  threshold:  'bg-red-500',
  tempo:      'bg-orange-500',
  vo2:        'bg-purple-500',
  endurance:  'bg-blue-400',
  long_ride:  'bg-sky-500',
  mixed:      'bg-teal-500',
  recovery:   'bg-gray-400',
  race:       'bg-yellow-500',
}

interface RideRowProps {
  ride: Ride
}

export function RideRow({ ride }: RideRowProps) {
  const isOutdoor = ride.gear_id === OUTDOOR_GEAR
  const dateStr = new Date(ride.date).toLocaleDateString('en-SG', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  return (
    <Link
      href={`/ride/${ride.strava_id}`}
      className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-muted/60 transition-colors group cursor-pointer"
    >
      {/* Left accent bar */}
      <div className={cn('w-1 rounded-full shrink-0 mt-1', sessionBarColor[ride.session_type])} style={{ height: 36 }} />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Label */}
        <p className="text-sm font-medium leading-tight truncate group-hover:text-primary transition-colors">
          {ride.label}
        </p>

        {/* Date + bike type */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isOutdoor
            ? <Bike className="h-3 w-3 text-sky-500 shrink-0" />
            : <MonitorPlay className="h-3 w-3 text-indigo-400 shrink-0" />
          }
          <span>{dateStr}</span>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', sessionColors[ride.session_type])}>
            {ride.session_type.replace('_', ' ')}
          </span>
          {ride.aerobic_te !== null && (
            <TrainingEffectBadge aerobic={ride.aerobic_te} anaerobic={ride.anaerobic_te ?? 0} size="sm" />
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
          <span className="font-semibold text-foreground">{ride.distance_km.toFixed(0)}km</span>
          <span>{formatDuration(ride.duration_min)}</span>
          {ride.np_w && (
            <span className="font-semibold text-foreground">{ride.np_w}W</span>
          )}
          {ride.intervals_load && (
            <span className="ml-auto font-medium">{ride.intervals_load} <span className="font-normal">load</span></span>
          )}
        </div>
      </div>
    </Link>
  )
}
