import 'server-only'
import fs from 'fs'
import path from 'path'
import { ReadinessEntry, Ride, PeakPowerEntry } from '@/types'

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

export function getPeakPower(): PeakPowerEntry | null {
  const all = readNdjson<PeakPowerEntry>(path.join(MEMORY, 'peak_power.ndjson'))
  if (!all.length) return null
  return all[all.length - 1]
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

export { formatDuration, formatSleep } from './format'
