import { getRideById } from '@/lib/data'
import { formatDuration, formatSleep } from '@/lib/format'
import { ZoneChart } from '@/components/ZoneChart'
import { HrZoneChart } from '@/components/HrZoneChart'
import { KeyBlocksTable } from '@/components/KeyBlocksTable'
import { RideAnalysis } from '@/components/RideAnalysis'
import { RideMetrics } from '@/components/RideMetrics'
import { TrainingEffectBadge } from '@/components/TrainingEffectBadge'
import { DayContext } from '@/components/DayContext'
import { SessionType } from '@/types'
import {
  ArrowLeft, Bike, Zap, Heart, Timer, Mountain,
  Flame, TrendingUp, MonitorPlay, Wind, Utensils
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

interface PageProps {
  params: Promise<{ stravaId: string }>
}

export default async function RidePage({ params }: PageProps) {
  const { stravaId } = await params
  const ride = getRideById(stravaId)
  if (!ride) notFound()

  const dateStr = new Date(ride.date).toLocaleDateString('en-SG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const isOutdoor = ride.gear_id === OUTDOOR_GEAR
  const movingMin = ride.elapsed_time_sec ? ride.elapsed_time_sec / 60 : null
  const stopTime = movingMin ? Math.max(0, movingMin - ride.duration_min) : null

  const totalZonePowerSec = ride.zones_power_sec
    ? Object.values(ride.zones_power_sec).reduce((s, v) => s + (v ?? 0), 0) : 0
  const totalZoneHrSec = ride.zones_hr_sec
    ? Object.values(ride.zones_hr_sec).reduce((s, v) => s + (v ?? 0), 0) : 0

  const statCards = [
    { icon: Timer,      label: 'Moving',      value: formatDuration(ride.duration_min) },
    ...(stopTime && stopTime > 2 ? [{ icon: Timer, label: 'Elapsed', value: formatDuration(movingMin!) }] : []),
    { icon: Bike,       label: 'Distance',    value: `${ride.distance_km.toFixed(1)}km` },
    { icon: Mountain,   label: 'Elevation',   value: `${ride.elev_m}m` },
    ...(ride.elev_high_m ? [{ icon: Mountain, label: 'Peak Alt', value: `${ride.elev_high_m.toFixed(0)}m` }] : []),
    { icon: Zap,        label: 'NP',          value: ride.np_w ? `${ride.np_w}W` : '—' },
    { icon: Zap,        label: 'Avg Power',   value: ride.avg_power_w ? `${ride.avg_power_w}W` : '—' },
    { icon: Zap,        label: 'Max Power',   value: ride.max_power_w ? `${ride.max_power_w}W` : '—' },
    { icon: Heart,      label: 'Avg HR',      value: ride.avg_hr_bpm ? `${ride.avg_hr_bpm}bpm` : '—' },
    { icon: Heart,      label: 'Max HR',      value: ride.max_hr_bpm ? `${ride.max_hr_bpm}bpm` : '—' },
    { icon: Flame,      label: 'Calories',    value: ride.calories ? `${ride.calories.toLocaleString()}` : '—' },
    { icon: Flame,      label: 'Work',        value: `${ride.work_kj}kJ` },
    { icon: TrendingUp, label: 'Load',        value: ride.intervals_load ? `${ride.intervals_load}` : '—' },
    { icon: TrendingUp, label: 'IF',          value: ride.if ? ride.if.toFixed(2) : '—' },
    { icon: TrendingUp, label: 'TSB',         value: ride.tsb != null ? `${ride.tsb > 0 ? '+' : ''}${ride.tsb.toFixed(1)}` : '—' },
    ...(ride.suffer_score ? [{ icon: Flame, label: 'Suffer', value: `${ride.suffer_score}` }] : []),
    ...(ride.avg_respiration_rpm ? [{ icon: Wind, label: 'Breathing', value: `${ride.avg_respiration_rpm.toFixed(1)} rpm` }] : []),
    ...(ride.carbs_used_g ? [{ icon: Utensils, label: 'Carbs', value: `${ride.carbs_used_g}g`, }] : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b sticky top-0 bg-background/90 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Bike className="h-5 w-5 text-indigo-500" />
            WheelMate
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {isOutdoor
                ? <><Bike className="h-4 w-4 text-sky-500" /><span className="text-xs">Outdoor</span></>
                : <><MonitorPlay className="h-4 w-4 text-indigo-400" /><span className="text-xs">Zwift</span></>
              }
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', sessionColors[ride.session_type])}>
              {ride.session_type.replace('_', ' ')}
            </span>
            {ride.detail_quality === 'full-interval' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Full data
              </span>
            )}
            {ride.avg_temp_c && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                ride.avg_temp_c > 30 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              )}>
                🌡️ {ride.avg_temp_c.toFixed(0)}°C
              </span>
            )}
            <a
              href={`https://www.strava.com/activities/${ride.strava_id}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs text-orange-500 hover:underline ml-auto"
            >
              View on Strava ↗
            </a>
          </div>
          <h1 className="text-2xl font-bold">{ride.label}</h1>
          <p className="text-sm text-muted-foreground mt-1">{dateStr}</p>
        </div>

        {/* Training Effect — prominent at top */}
        {ride.aerobic_te !== null && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Training Effect</h2>
            <div className="rounded-2xl border p-5">
              <TrainingEffectBadge aerobic={ride.aerobic_te} anaerobic={ride.anaerobic_te ?? 0} size="md" />
              <p className="text-xs text-muted-foreground mt-3">
                Training effect shows whether this session was primarily aerobic or anaerobic stimulus, and how hard it pushed adaptation.
              </p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {statCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-muted/20 p-3 text-center">
              <Icon className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
              <p className="text-base font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* How you felt that day */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">How You Felt That Day</h2>
          <DayContext ride={ride} />
        </div>

        {/* Coach analysis */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Coach Analysis</h2>
          <RideAnalysis ride={ride} />
        </div>

        {/* Performance + Environmental metrics */}
        <RideMetrics ride={ride} />

        {/* Key blocks */}
        {ride.key_blocks && ride.key_blocks.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Key Blocks <span className="text-foreground/40 font-normal normal-case">({ride.key_blocks.length})</span>
            </h2>
            <KeyBlocksTable blocks={ride.key_blocks} ftp={270} />
          </div>
        )}

        {/* Zone charts */}
        {(totalZonePowerSec > 0 || totalZoneHrSec > 0) && (
          <div className={cn('grid gap-6', totalZonePowerSec > 0 && totalZoneHrSec > 0 ? 'lg:grid-cols-2' : 'grid-cols-1')}>
            {totalZonePowerSec > 0 && ride.zones_power_sec && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Power Zones</h2>
                <div className="rounded-2xl border p-5">
                  <ZoneChart zones={ride.zones_power_sec} totalSec={totalZonePowerSec} />
                </div>
              </div>
            )}
            {totalZoneHrSec > 0 && ride.zones_hr_sec && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">HR Zones</h2>
                <div className="rounded-2xl border p-5">
                  <HrZoneChart zones={ride.zones_hr_sec} totalSec={totalZoneHrSec} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Load context */}
        {(ride.ctl || ride.atl || ride.tsb) && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Load Context</h2>
            <div className="rounded-2xl border p-5 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-indigo-500">{ride.ctl?.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">CTL (Fitness)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{ride.atl?.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">ATL (Fatigue)</p>
              </div>
              <div>
                <p className={cn('text-2xl font-bold', (ride.tsb ?? 0) >= 0 ? 'text-green-500' : 'text-red-500')}>
                  {(ride.tsb ?? 0) > 0 ? '+' : ''}{ride.tsb?.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">TSB (Form)</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
