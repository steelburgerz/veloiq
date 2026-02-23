import { getRideById } from '@/lib/data'
import { getActivityMap } from '@/lib/strava'
import { formatDuration, formatSleep } from '@/lib/format'
import { PowerZoneDonut } from '@/components/PowerZoneDonut'
import { HrZoneChart } from '@/components/HrZoneChart'
import { KeyBlocksTable } from '@/components/KeyBlocksTable'
import { RideAnalysis } from '@/components/RideAnalysis'
import { RideMetrics } from '@/components/RideMetrics'
import { TrainingEffectBadge } from '@/components/TrainingEffectBadge'
import { DayContext } from '@/components/DayContext'
import { RideMap } from '@/components/RideMap'
import { SessionType } from '@/types'
import { Bike, MonitorPlay } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function isVirtualRide(label: string) {
  return /zwift|virtualride|virtual ride/i.test(label)
}

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

  const activityMap = await getActivityMap(stravaId)

  const dateStr = new Date(ride.date).toLocaleDateString('en-SG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const isOutdoor = !isVirtualRide(ride.label)
  const movingMin = ride.elapsed_time_sec ? ride.elapsed_time_sec / 60 : null
  const stopTime = movingMin ? Math.max(0, movingMin - ride.duration_min) : null

  const totalZonePowerSec = ride.zones_power_sec
    ? Object.values(ride.zones_power_sec).reduce((s, v) => s + (v ?? 0), 0) : 0
  const totalZoneHrSec = ride.zones_hr_sec
    ? Object.values(ride.zones_hr_sec).reduce((s, v) => s + (v ?? 0), 0) : 0

  // Grouped stat definitions
  const summaryStats = [
    { label: 'Distance',  value: `${ride.distance_km.toFixed(1)} km` },
    { label: 'Moving',    value: formatDuration(ride.duration_min) },
    ...(stopTime && stopTime > 2 ? [{ label: 'Elapsed', value: formatDuration(movingMin!) }] : []),
    { label: 'Elevation', value: `${ride.elev_m} m` },
    ...(ride.elev_high_m ? [{ label: 'Peak Alt', value: `${ride.elev_high_m.toFixed(0)} m` }] : []),
    { label: 'Work',      value: `${ride.work_kj} kJ` },
    ...(ride.calories ? [{ label: 'Calories', value: ride.calories.toLocaleString() }] : []),
  ]

  const powerStats = [
    ...(ride.np_w        ? [{ label: 'NP',        value: `${ride.np_w} W` }] : []),
    ...(ride.avg_power_w ? [{ label: 'Avg',       value: `${ride.avg_power_w} W` }] : []),
    ...(ride.max_power_w ? [{ label: 'Max',       value: `${ride.max_power_w} W` }] : []),
    ...(ride.if          ? [{ label: 'IF',         value: ride.if.toFixed(2) }] : []),
    ...(ride.carbs_used_g ? [{ label: 'Carbs',    value: `${ride.carbs_used_g} g` }] : []),
  ]

  const hrStats = [
    ...(ride.avg_hr_bpm ? [{ label: 'Avg HR',     value: `${ride.avg_hr_bpm} bpm` }] : []),
    ...(ride.max_hr_bpm ? [{ label: 'Max HR',     value: `${ride.max_hr_bpm} bpm` }] : []),
    ...(ride.suffer_score ? [{ label: 'Suffer',   value: `${ride.suffer_score}` }] : []),
    ...(ride.avg_respiration_rpm ? [{ label: 'Breathing', value: `${ride.avg_respiration_rpm.toFixed(1)} rpm` }] : []),
  ]

  const loadStats = [
    ...(ride.intervals_load ? [{ label: 'Load', value: `${ride.intervals_load}` }] : []),
    ...(ride.tsb != null    ? [{ label: 'TSB',  value: `${ride.tsb > 0 ? '+' : ''}${ride.tsb.toFixed(1)}` }] : []),
    ...(ride.ctl            ? [{ label: 'CTL',  value: ride.ctl.toFixed(1) }] : []),
    ...(ride.atl            ? [{ label: 'ATL',  value: ride.atl.toFixed(1) }] : []),
  ]

  return (
    <div className="space-y-8">

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

        {/* Route map */}
        {activityMap?.summaryPolyline && !activityMap.isVirtual && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Route</h2>
            <RideMap
              polyline={activityMap.summaryPolyline}
              startLatlng={activityMap.startLatlng}
            />
          </div>
        )}
        {activityMap?.isVirtual && (
          <div className="rounded-2xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
            <span>🖥️</span>
            <span>Virtual ride — no real-world map available.</span>
          </div>
        )}

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

        {/* Stats — grouped */}
        <div className="rounded-2xl border divide-y">

          {/* Ride summary */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Ride</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {summaryStats.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Power */}
          {powerStats.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Power</p>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {powerStats.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heart rate */}
          {hrStats.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Heart Rate</p>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {hrStats.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training load */}
          {loadStats.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Training Load</p>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {loadStats.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

        {/* Zone charts */}
        {(totalZonePowerSec > 0 || totalZoneHrSec > 0) && (
          <div className={cn('grid gap-6', totalZonePowerSec > 0 && totalZoneHrSec > 0 ? 'lg:grid-cols-2' : 'grid-cols-1')}>
            {totalZonePowerSec > 0 && ride.zones_power_sec && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Power Zones</h2>
                <div className="rounded-2xl border p-5">
                  <PowerZoneDonut zones={ride.zones_power_sec} totalSec={totalZonePowerSec} />
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

        {/* Key blocks */}
        {ride.key_blocks && ride.key_blocks.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Key Blocks <span className="text-foreground/40 font-normal normal-case">({ride.key_blocks.length})</span>
            </h2>
            <KeyBlocksTable blocks={ride.key_blocks} ftp={270} />
          </div>
        )}

    </div>
  )
}
