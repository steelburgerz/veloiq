import {
  getTodayReadiness, getRecentRides,
  getLoadChartData, getWeekSummaries, getWkgCheckpoints,
  getEfTrend, getAthleteStats
} from '@/lib/data'
import { getTitiDaysRemaining } from '@/lib/titi'
import { ReadinessCard } from '@/components/ReadinessCard'
import { RideRow } from '@/components/RideRow'
import { TitiCountdown } from '@/components/TitiCountdown'
import { LoadChart } from '@/components/LoadChart'
import { WeekSummaryStrip } from '@/components/WeekSummaryStrip'
import { WkgChart } from '@/components/WkgChart'
import { EfChart } from '@/components/EfChart'
import { AthleteStatBar } from '@/components/AthleteStatBar'
import { AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [
    today,
    rides,
    chartData,
    weeks,
    wkgCheckpoints,
    efTrend,
    stats
  ] = await Promise.all([
    getTodayReadiness(),
    getRecentRides(20),
    getLoadChartData(60),
    getWeekSummaries(6),
    getWkgCheckpoints(),
    getEfTrend(60),
    getAthleteStats(),
  ])
  
  const daysToTiti = getTitiDaysRemaining()
  const thisWeek = weeks[0]
  const rampAlert = stats.rampRate !== null && Math.abs(stats.rampRate) > 8

  return (
    <div className="space-y-8">
      {/* Ramp rate alert */}
      {rampAlert && (
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">
            <span className="font-semibold">Ramp rate alert:</span> CTL is changing at {stats.rampRate! > 0 ? '+' : ''}{stats.rampRate!.toFixed(1)}/day.
            {stats.rampRate! < 0
              ? ' Sharp fitness drop — consider easing up or reviewing recent load.'
              : ' Loading up fast — watch for overtraining signs.'}
          </p>
        </div>
      )}

      {/* Athlete snapshot */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Athlete Snapshot</h2>
        <AthleteStatBar
          vo2max={stats.vo2max}
          eftp={stats.eftp}
          rollingFtp={stats.rollingFtp}
          wPrime={stats.wPrime}
          weight={stats.weight}
          rampRate={stats.rampRate}
        />
      </div>

      {/* Readiness + TiTi countdown */}
      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Today's Readiness</h2>
          {today ? (
            <ReadinessCard entry={today} />
          ) : (
            <div className="rounded-2xl border p-8 text-center text-muted-foreground">
              No readiness data. Run <code className="text-xs bg-muted px-1 py-0.5 rounded">scripts/readiness.py</code>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Race Countdown</h2>
          <TitiCountdown />
        </div>
      </div>

      {/* Weekly summary */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Weekly Summary</h2>
        <WeekSummaryStrip weeks={weeks} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Training Load (CTL/ATL/TSB)</h2>
          <LoadChart data={chartData} />
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">W/kg Progress</h2>
          <WkgChart checkpoints={wkgCheckpoints} />
        </div>
      </div>

      {/* Efficiency Factor trend */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Efficiency Factor Trend</h2>
        <EfChart data={efTrend} />
      </div>

      {/* Recent rides */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Recent Rides</h2>
        <div className="space-y-2">
          {rides.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No rides yet. Sync from Strava to get started.
            </div>
          )}
          {rides.map((ride) => (
            <RideRow key={ride.strava_id} ride={ride} />
          ))}
        </div>
      </div>
    </div>
  )
}
