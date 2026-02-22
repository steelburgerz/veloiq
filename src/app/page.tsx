import {
  getTodayReadiness, getRecentRides, getPeakPower,
  getLoadChartData, getWeekSummaries, getWkgCheckpoints,
  getEftpTrend, getAthleteStats
} from '@/lib/data'
import { getTitiDaysRemaining } from '@/lib/titi'
import { ReadinessCard } from '@/components/ReadinessCard'
import { RideRow } from '@/components/RideRow'
import { TitiCountdown } from '@/components/TitiCountdown'
import { PeakPowerTable } from '@/components/PeakPowerTable'
import { LoadChart } from '@/components/LoadChart'
import { WeekSummaryStrip } from '@/components/WeekSummaryStrip'
import { WkgChart } from '@/components/WkgChart'
import { EftpChart } from '@/components/EftpChart'
import { AthleteStatBar } from '@/components/AthleteStatBar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Bike, Zap, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const today = getTodayReadiness()
  const rides = getRecentRides(20)
  const peakPower = getPeakPower()
  const chartData = getLoadChartData(60)
  const daysToTiti = getTitiDaysRemaining()
  const weeks = getWeekSummaries(6)
  const wkgCheckpoints = getWkgCheckpoints()
  const eftpTrend = getEftpTrend()
  const stats = getAthleteStats()
  const thisWeek = weeks[0]
  const rampAlert = stats.rampRate !== null && Math.abs(stats.rampRate) > 8

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top nav ─────────────────────────────────────────────── */}
      <nav className="border-b sticky top-0 bg-background/90 backdrop-blur z-20 shrink-0">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Bike className="h-5 w-5 text-indigo-500" />
            WheelMate
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Ralph</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-indigo-500 font-semibold">{daysToTiti}d to TiTi</span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ── Two-panel body ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL — Recent Rides ───────────────────────── */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-r bg-muted/20 overflow-y-auto">
          <div className="sticky top-0 bg-muted/20 backdrop-blur border-b px-4 py-3 z-10">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Rides</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{rides.length} activities</p>
          </div>
          <div className="flex-1 px-2 py-2">
            {rides.length > 0 ? (
              rides.map((ride) => (
                <RideRow key={`${ride.date}-${ride.strava_id}`} ride={ride} />
              ))
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm px-4">
                No rides logged yet
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT PANEL — Main content ──────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Weekly Summary</h2>
                {thisWeek && (
                  <span className="text-xs text-muted-foreground">
                    This week: <span className="font-semibold text-foreground">{thisWeek.totalHours}h · {thisWeek.totalDistance}km · {thisWeek.totalLoad} load</span>
                  </span>
                )}
              </div>
              <WeekSummaryStrip weeks={weeks} />
            </div>

            {/* eFTP trend + Training load */}
            <div className="grid xl:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  eFTP Trend
                  {stats.eftp && (
                    <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold normal-case text-sm">{stats.eftp}W</span>
                  )}
                </h2>
                <div className="rounded-2xl border p-5">
                  {eftpTrend.length > 0 ? (
                    <>
                      <EftpChart data={eftpTrend} ftp={270} />
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-indigo-500 inline-block" />eFTP</div>
                        <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-amber-400 opacity-60 inline-block" />Ramp rate</div>
                      </div>
                    </>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No eFTP data</div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Training Load — 60 days</h2>
                <div className="rounded-2xl border p-5">
                  {chartData.length > 0 ? (
                    <LoadChart data={chartData} />
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No load data</div>
                  )}
                  <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-indigo-500 inline-block" />CTL</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-amber-500 inline-block" />ATL</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-green-500 inline-block" />TSB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* W/kg progression */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                W/kg Progression
                {wkgCheckpoints.length > 0 && (
                  <span className="ml-2 text-foreground font-bold normal-case text-sm">
                    {wkgCheckpoints[wkgCheckpoints.length - 1].ftp_wkg.toFixed(2)} W/kg
                  </span>
                )}
              </h2>
              <div className="rounded-2xl border p-5">
                {wkgCheckpoints.length > 0 ? (
                  <>
                    <WkgChart checkpoints={wkgCheckpoints} targetWkg={3.86} />
                    <p className="text-xs text-muted-foreground mt-3">
                      Current FTP: <span className="font-semibold text-foreground">{wkgCheckpoints[wkgCheckpoints.length - 1].ftp_w}W</span>
                      {' · '}Target: <span className="font-semibold text-green-600">3.86+ W/kg for TiTi</span>
                    </p>
                  </>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No W/kg data yet</div>
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

            {/* Recent rides — mobile only (sidebar hidden on mobile) */}
            <div className="lg:hidden">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Recent Rides</h2>
              <div className="rounded-2xl border px-4">
                {rides.map((ride) => (
                  <RideRow key={`${ride.date}-${ride.strava_id}`} ride={ride} />
                ))}
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  )
}
