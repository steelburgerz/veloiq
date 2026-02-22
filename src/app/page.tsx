import { getTodayReadiness, getRecentRides, getPeakPower, getLoadChartData } from '@/lib/data'
import { getTitiDaysRemaining } from '@/lib/titi'
import { ReadinessCard } from '@/components/ReadinessCard'
import { RideRow } from '@/components/RideRow'
import { TitiCountdown } from '@/components/TitiCountdown'
import { PeakPowerTable } from '@/components/PeakPowerTable'
import { LoadChart } from '@/components/LoadChart'
import { Bike, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const today = getTodayReadiness()
  const rides = getRecentRides(15)
  const peakPower = getPeakPower()
  const chartData = getLoadChartData(60)
  const daysToTiti = getTitiDaysRemaining()

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b sticky top-0 bg-background/90 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Bike className="h-5 w-5 text-indigo-500" />
            WheelMate
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Ralph</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-indigo-500 font-semibold">{daysToTiti}d to TiTi</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Top row — Readiness + TiTi */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Today's Readiness</h2>
            {today ? (
              <ReadinessCard entry={today} />
            ) : (
              <div className="rounded-2xl border p-8 text-center text-muted-foreground">
                No readiness data yet. Run <code className="text-xs bg-muted px-1 py-0.5 rounded">scripts/readiness.py</code>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Race Countdown</h2>
            <TitiCountdown />
          </div>
        </div>

        {/* Load chart */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Training Load — 60 days</h2>
          <div className="rounded-2xl border p-5">
            {chartData.length > 0 ? (
              <LoadChart data={chartData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No load data available
              </div>
            )}
            <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-indigo-500 inline-block" />CTL (Fitness)</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-amber-500 inline-block" />ATL (Fatigue)</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-green-500 inline-block" />TSB (Form)</div>
            </div>
          </div>
        </div>

        {/* Recent rides + Peak power */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent rides */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Recent Rides</h2>
            <div className="rounded-2xl border px-4">
              {rides.length > 0 ? (
                rides.map((ride) => <RideRow key={`${ride.date}-${ride.strava_id}`} ride={ride} />)
              ) : (
                <div className="py-10 text-center text-muted-foreground text-sm">No rides logged yet</div>
              )}
            </div>
          </div>

          {/* Peak power */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Peak Power Records
            </h2>
            <div className="rounded-2xl border px-4 py-2">
              {peakPower.length > 0 ? (
                <>
                  <PeakPowerTable records={peakPower} />
                  <p className="text-xs text-muted-foreground mt-3 pb-2">Period: {peakPower[0].period}</p>
                </>
              ) : (
                <div className="py-10 text-center text-muted-foreground text-sm">No peak power data yet</div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
