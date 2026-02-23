import 'server-only'
import fs from 'fs'
import path from 'path'
import { ReadinessEntry, Ride, PeakPowerRecord, WkgCheckpoint, WeekSummary } from '@/types'

const WORKSPACE = path.resolve(process.env.WHEELMATE_WORKSPACE ?? '/Users/ralphkoh/.openclaw/workspace')
const MEMORY = path.join(WORKSPACE, 'memory')

function readNdjson<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return []
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean)
  return lines.map((l) => JSON.parse(l) as T)
}

export function getReadinessHistory(days = 60): ReadinessEntry[] {
  const all = readNdjson<ReadinessEntry>(path.join(MEMORY, 'readiness.ndjson'))
  return all
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days)
}

export function getTodayReadiness(): ReadinessEntry | null {
  const all = readNdjson<ReadinessEntry>(path.join(MEMORY, 'readiness.ndjson'))
  if (!all.length) return null
  return all.sort((a, b) => b.date.localeCompare(a.date))[0]
}

export function getRecentRides(limit = 20): Ride[] {
  const all = readNdjson<Ride>(path.join(MEMORY, 'rides.ndjson'))
  return all
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}

export function getAllRides(): Ride[] {
  return readNdjson<Ride>(path.join(MEMORY, 'rides.ndjson'))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getRideById(stravaId: string): Ride | null {
  const all = readNdjson<Ride>(path.join(MEMORY, 'rides.ndjson'))
  return all.find((r) => r.strava_id === stravaId) ?? null
}

export function getPeakPower(): PeakPowerRecord[] {
  return readNdjson<PeakPowerRecord>(path.join(MEMORY, 'peak_power.ndjson'))
}

export function getWkgCheckpoints(): WkgCheckpoint[] {
  return readNdjson<WkgCheckpoint>(path.join(MEMORY, 'wkg_checkpoints.ndjson'))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getLoadChartData(days = 60) {
  const readiness = getReadinessHistory(days)
  return readiness.map((r) => ({
    date: r.date,
    ctl: Math.round(r.intervals.ctl * 10) / 10,
    atl: Math.round(r.intervals.atl * 10) / 10,
    tsb: Math.round(r.intervals.tsb * 10) / 10,
  }))
}

export function getWeekSummaries(weeksBack = 6): WeekSummary[] {
  const rides = getAllRides()
  const summaries: WeekSummary[] = []

  for (let w = 0; w < weeksBack; w++) {
    const now = new Date()
    // Start of current week (Monday)
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
    const startOfThisWeek = new Date(now)
    startOfThisWeek.setDate(now.getDate() - dayOfWeek - w * 7)
    startOfThisWeek.setHours(0, 0, 0, 0)

    const endOfThisWeek = new Date(startOfThisWeek)
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6)
    endOfThisWeek.setHours(23, 59, 59, 999)

    const startStr = startOfThisWeek.toISOString().slice(0, 10)
    const endStr = endOfThisWeek.toISOString().slice(0, 10)

    const weekRides = rides.filter(r => r.date >= startStr && r.date <= endStr)

    const totalHours = weekRides.reduce((s, r) => s + r.duration_min / 60, 0)
    const totalDistance = weekRides.reduce((s, r) => s + r.distance_km, 0)
    const totalLoad = weekRides.reduce((s, r) => s + (r.intervals_load ?? 0), 0)
    const totalElev = weekRides.reduce((s, r) => s + r.elev_m, 0)
    const tsbVals = weekRides.map(r => r.tsb).filter((v): v is number => v !== null)
    const avgTSB = tsbVals.length ? tsbVals.reduce((s, v) => s + v, 0) / tsbVals.length : null

    const weekLabel = w === 0 ? 'This week'
      : w === 1 ? 'Last week'
      : startOfThisWeek.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })

    summaries.push({
      weekLabel,
      startDate: startStr,
      endDate: endStr,
      rides: weekRides,
      totalHours: Math.round(totalHours * 10) / 10,
      totalDistance: Math.round(totalDistance),
      totalLoad,
      totalElev,
      avgTSB: avgTSB !== null ? Math.round(avgTSB * 10) / 10 : null,
    })
  }

  return summaries
}

export function getEftpTrend(): import('@/types').EftpPoint[] {
  const rides = readNdjson<import('@/types').Ride>(path.join(MEMORY, 'rides.ndjson'))
  // One point per date — take max eftp if multiple rides same day
  const byDate: Record<string, import('@/types').EftpPoint> = {}
  for (const r of rides) {
    if (!r.day_eftp_w) continue
    if (!byDate[r.date] || r.day_eftp_w > byDate[r.date].eftp) {
      byDate[r.date] = {
        date: r.date,
        eftp: r.day_eftp_w,
        wPrime: r.day_w_prime_j ?? 0,
        rampRate: r.day_ramp_rate ?? null,
      }
    }
  }
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
}

export function getAthleteStats() {
  const rides = readNdjson<import('@/types').Ride>(path.join(MEMORY, 'rides.ndjson'))
  const sorted = rides.sort((a, b) => b.date.localeCompare(a.date))
  const latest = sorted[0]
  const vo2maxRides = sorted.filter(r => r.day_vo2max !== null)
  return {
    vo2max: vo2maxRides.length ? vo2maxRides[0].day_vo2max : null,
    eftp: latest?.day_eftp_w ?? null,
    wPrime: latest?.day_w_prime_j ?? null,
    weight: latest?.day_weight_kg ?? null,
    rampRate: latest?.day_ramp_rate ?? null,
  }
}

export function getEfTrend(days = 60): import('@/types').EfPoint[] {
  const rides = readNdjson<import('@/types').Ride>(path.join(MEMORY, 'rides.ndjson'))
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  return rides
    .filter(r => r.efficiency_factor != null && r.date >= cutoffStr)
    .map(r => ({
      date: r.date,
      ef: r.efficiency_factor!,
      sessionType: r.session_type,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export { formatDuration, formatSleep } from './format'
export { getTitiDaysRemaining } from './titi'
