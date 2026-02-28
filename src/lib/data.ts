import 'server-only'
import { Pool } from 'pg'
import { ReadinessEntry, Ride, PeakPowerRecord, WkgCheckpoint, WeekSummary } from '@/types'
import { classifySession } from './classify-session'

// PostgreSQL connection pool
const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'wheelmate',
  max: 10,
})

// Helper to convert PostgreSQL numeric to number
function toNum(val: unknown): number | null {
  if (val === null || val === undefined) return null
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseFloat(val)
  return null
}

// Helper to convert PostgreSQL date to ISO string
function toDateStr(val: unknown): string {
  if (val instanceof Date) {
    const offsetMs = val.getTimezoneOffset() * 60 * 1000; const localDate = new Date(val.getTime() - offsetMs); return localDate.toISOString().slice(0, 10)
  }
  return String(val)
}

// Helper to map PostgreSQL row to Ride type
function mapRowToRide(row: Record<string, unknown>): Ride {
  // First, build the ride object with raw session_type from DB
  const ride: Ride = {
    date: toDateStr(row.date),
    source: row.source as string,
    strava_id: row.strava_id as string,
    intervals_id: row.intervals_id as string | null,
    label: row.label as string,
    session_type: row.session_type as Ride['session_type'],
    detail_quality: 'high',
    duration_min: toNum(row.duration_min) ?? 0,
    distance_km: toNum(row.distance_km) ?? 0,
    elev_m: toNum(row.elevation_gain_m) ?? 0,
    elev_high_m: toNum(row.max_elevation_m),
    elev_low_m: toNum(row.min_elevation_m),
    work_kj: toNum(row.work_kj) ?? 0,
    avg_power_w: toNum(row.avg_power_w),
    np_w: toNum(row.np_w),
    max_power_w: toNum(row.max_power_w),
    avg_hr_bpm: toNum(row.avg_hr_bpm),
    max_hr_bpm: toNum(row.max_hr_bpm),
    avg_cadence_rpm: toNum(row.avg_cadence_rpm),
    avg_respiration_rpm: toNum(row.avg_respiration_rpm),
    intervals_load: toNum(row.intervals_load),
    garmin_training_load: toNum(row.garmin_training_load),
    ctl: toNum(row.ctl),
    atl: toNum(row.atl),
    tsb: toNum(row.tsb),
    if: toNum(row.if_factor),
    tss: toNum(row.tss),
    calories: toNum(row.calories),
    suffer_score: toNum(row.suffer_score),
    elapsed_time_sec: toNum(row.elapsed_time_sec),
    gear_id: row.gear_id as string | null,
    training_load_pct: toNum(row.training_load_pct),
    power_hr_ratio: toNum(row.power_hr_ratio),
    peak_cp_w: toNum(row.peak_cp_w),
    peak_ftp_w: toNum(row.peak_ftp_w),
    peak_ftp_secs: toNum(row.peak_ftp_secs),
    peak_pmax_w: toNum(row.peak_pmax_w),
    rolling_ftp_w: toNum(row.rolling_ftp_w),
    peak_power_curve: row.peak_power_curve as Record<string, number> | null,
    aerobic_te: toNum(row.aerobic_te),
    anaerobic_te: toNum(row.anaerobic_te),
    decoupling_pct: toNum(row.decoupling_pct),
    efficiency_factor: toNum(row.efficiency_factor),
    variability_index: toNum(row.variability_index),
    polarization_index: toNum(row.polarization_index),
    lr_balance: row.lr_balance as string | null,
    avg_temp_c: toNum(row.avg_temp_c),
    max_temp_c: toNum(row.max_temp_c),
    carbs_used_g: toNum(row.carbs_used_g),
    zones_power_sec: row.zones_power_sec as Ride['zones_power_sec'],
    zones_hr_sec: row.zones_hr_sec as Ride['zones_hr_sec'],
    key_blocks: row.key_blocks as Ride['key_blocks'],
    day_weight_kg: toNum(row.day_weight_kg),
    day_rhr_bpm: toNum(row.day_rhr_bpm),
    day_hrv_ms: toNum(row.day_hrv_ms),
    day_sleep_secs: toNum(row.day_sleep_secs),
    day_sleep_score: toNum(row.day_sleep_score),
    day_vo2max: toNum(row.day_vo2max),
    day_eftp_w: toNum(row.day_eftp_w),
    day_w_prime_j: toNum(row.day_w_prime_j),
    day_ramp_rate: toNum(row.day_ramp_rate),
  }

  // Auto-classify session type if it's 'mixed' or missing
  // Use power zones and key blocks to determine actual type
  if (ride.session_type === 'mixed' || !ride.session_type) {
    ride.session_type = classifySession(ride)
  }

  return ride
}

// Helper to map PostgreSQL row to ReadinessEntry type
function mapRowToReadiness(row: Record<string, unknown>): ReadinessEntry {
  return {
    date: toDateStr(row.date),
    intervals: {
      sleep_sec: (toNum(row.sleep_h) ?? 0) * 3600,
      sleep_score: toNum(row.sleep_score) ?? 0,
      rhr_bpm: toNum(row.rhr_bpm) ?? 0,
      hrv_ms: toNum(row.hrv_weekly_avg_ms) ?? 0,
      ctl: toNum(row.ctl) ?? 0,
      atl: toNum(row.atl) ?? 0,
      tsb: toNum(row.tsb) ?? 0,
    },
    garmin: {
      sleep_sec: (toNum(row.sleep_h) ?? 0) * 3600,
      sleep_score: toNum(row.sleep_score) ?? 0,
      hrv_last_night_ms: toNum(row.hrv_last_night_ms) ?? 0,
      hrv_weekly_avg_ms: toNum(row.hrv_weekly_avg_ms) ?? 0,
      hrv_status: (row.hrv_status || 'BALANCED') as 'BALANCED' | 'UNBALANCED',
      rhr_bpm: toNum(row.rhr_bpm) ?? 0,
      body_battery_charged: toNum(row.body_battery_charged) ?? 0,
      body_battery_drained: toNum(row.body_battery_drained) ?? 0,
      body_battery_high: toNum(row.body_battery_high) ?? 0,
      body_battery_low: toNum(row.body_battery_low) ?? 0,
    },
    wheelmate: {
      status: (row.status || 'GREEN') as ReadinessEntry['wheelmate']['status'],
      reason: row.reason as string || "",
      recommendation: row.recommendation as string || "",
    },
  }
}

export async function getReadinessHistory(days = 60): Promise<ReadinessEntry[]> {
  const result = await pool.query(`
    SELECT * FROM readiness
    ORDER BY date DESC
    LIMIT $1
  `, [days])
  
  return result.rows.map(mapRowToReadiness).reverse()
}

export async function getTodayReadiness(): Promise<ReadinessEntry | null> {
  const result = await pool.query(`
    SELECT * FROM readiness
    ORDER BY date DESC
    LIMIT 1
  `)
  
  if (!result.rows.length) return null
  return mapRowToReadiness(result.rows[0])
}

export async function getRecentRides(limit = 20): Promise<Ride[]> {
  const result = await pool.query(`
    SELECT * FROM rides
    ORDER BY date DESC
    LIMIT $1
  `, [limit])
  
  return result.rows.map(mapRowToRide)
}

export async function getAllRides(): Promise<Ride[]> {
  const result = await pool.query(`
    SELECT * FROM rides
    ORDER BY date DESC
  `)
  
  return result.rows.map(mapRowToRide)
}

export async function getRideById(stravaId: string): Promise<Ride | null> {
  const result = await pool.query(`
    SELECT * FROM rides
    WHERE strava_id = $1
  `, [stravaId])
  
  if (!result.rows.length) return null
  return mapRowToRide(result.rows[0])
}

export async function getPeakPower(): Promise<PeakPowerRecord[]> {
  const result = await pool.query(`
    SELECT 
      date,
      label as activity_label,
      source,
      peak_power_curve
    FROM rides
    WHERE peak_power_curve IS NOT NULL
    ORDER BY date DESC
  `)
  
  const records: PeakPowerRecord[] = []
  const periodMap: Record<string, string> = {
    '5': '5s',
    '15': '15s',
    '30': '30s',
    '60': '1min',
    '300': '5min',
    '1200': '20min',
    '3600': '60min',
  }
  
  for (const row of result.rows) {
    const curve = row.peak_power_curve as Record<string, number>
    if (!curve) continue
    
    for (const [duration, power] of Object.entries(curve)) {
      records.push({
        period: periodMap[duration] || duration + 's',
        duration_sec: parseInt(duration),
        power_w: toNum(power) ?? 0,
        power_wkg: (toNum(power) ?? 0) / 65,
        date: toDateStr(row.date),
        source: row.source as string,
        activity_label: row.activity_label as string,
      })
    }
  }
  
  return records
}

export async function getWkgCheckpoints(): Promise<WkgCheckpoint[]> {
  const result = await pool.query(`
    SELECT DISTINCT ON (date)
      date,
      day_weight_kg as weight_kg,
      day_eftp_w as ftp_w,
      CASE 
        WHEN day_weight_kg > 0 AND day_eftp_w > 0 
        THEN ROUND((day_eftp_w / day_weight_kg)::numeric, 2)
        ELSE NULL 
      END as ftp_wkg
    FROM rides
    WHERE day_weight_kg IS NOT NULL AND day_eftp_w IS NOT NULL
    ORDER BY date
  `)
  
  return result.rows.map(row => ({
    date: toDateStr(row.date),
    weight_kg: toNum(row.weight_kg) ?? 0,
    ftp_w: toNum(row.ftp_w) ?? 0,
    ftp_wkg: toNum(row.ftp_wkg) ?? 0,
    notes: null,
  }))
}

export async function getLoadChartData(days = 60) {
  const result = await pool.query(`
    SELECT 
      date,
      ctl,
      atl,
      tsb
    FROM readiness
    ORDER BY date DESC
    LIMIT $1
  `, [days])
  
  return result.rows.reverse().map((r) => ({
    date: toDateStr(r.date),
    ctl: Math.round((toNum(r.ctl) ?? 0) * 10) / 10,
    atl: Math.round((toNum(r.atl) ?? 0) * 10) / 10,
    tsb: Math.round((toNum(r.tsb) ?? 0) * 10) / 10,
  }))
}

export async function getWeekSummaries(weeksBack = 6): Promise<WeekSummary[]> {
  const rides = await getAllRides()
  const summaries: WeekSummary[] = []

  for (let w = 0; w < weeksBack; w++) {
    const now = new Date()
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
    const startOfThisWeek = new Date(now)
    startOfThisWeek.setDate(now.getDate() - dayOfWeek - w * 7)
    startOfThisWeek.setHours(0, 0, 0, 0)

    const endOfThisWeek = new Date(startOfThisWeek)
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6)
    endOfThisWeek.setHours(23, 59, 59, 999)

    const startStr = toDateStr(startOfThisWeek)
    const endStr = toDateStr(endOfThisWeek)

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

export async function getEftpTrend(): Promise<import('@/types').EftpPoint[]> {
  const result = await pool.query(`
    SELECT DISTINCT ON (date)
      date,
      day_eftp_w,
      day_w_prime_j,
      day_ramp_rate
    FROM rides
    WHERE day_eftp_w IS NOT NULL
    ORDER BY date
  `)
  
  return result.rows.map(r => ({
    date: toDateStr(r.date),
    eftp: toNum(r.day_eftp_w) ?? 0,
    wPrime: toNum(r.day_w_prime_j) ?? 0,
    rampRate: toNum(r.day_ramp_rate),
  }))
}

export async function getAthleteStats() {
  const result = await pool.query(`
    SELECT 
      day_vo2max,
      day_eftp_w,
      rolling_ftp_w,
      day_w_prime_j,
      day_weight_kg,
      day_ramp_rate
    FROM rides
    ORDER BY date DESC
    LIMIT 1
  `)
  
  if (!result.rows.length) {
    return {
      vo2max: null,
      eftp: null,
      rollingFtp: null,
      wPrime: null,
      weight: null,
      rampRate: null,
    }
  }
  
  const row = result.rows[0]
  return {
    vo2max: toNum(row.day_vo2max),
    eftp: toNum(row.day_eftp_w),
    rollingFtp: toNum(row.rolling_ftp_w),
    wPrime: toNum(row.day_w_prime_j),
    weight: toNum(row.day_weight_kg),
    rampRate: toNum(row.day_ramp_rate),
  }
}

export async function getPeakPowerByDate(date: string): Promise<import('@/types').PeakPowerRecord[]> {
  const result = await pool.query(`
    SELECT 
      date,
      label as activity_label,
      source,
      peak_power_curve
    FROM rides
    WHERE date = $1 AND peak_power_curve IS NOT NULL
  `, [date])
  
  if (!result.rows.length) return []
  
  const records: PeakPowerRecord[] = []
  const periodMap: Record<string, string> = {
    '5': '5s',
    '15': '15s',
    '30': '30s',
    '60': '1min',
    '300': '5min',
    '1200': '20min',
    '3600': '60min',
  }
  
  const row = result.rows[0]
  const curve = row.peak_power_curve as Record<string, number>
  
  for (const [duration, power] of Object.entries(curve)) {
    records.push({
      period: periodMap[duration] || duration + 's',
      duration_sec: parseInt(duration),
      power_w: toNum(power) ?? 0,
      power_wkg: (toNum(power) ?? 0) / 65,
      date: toDateStr(row.date),
      source: row.source as string,
      activity_label: row.activity_label as string,
    })
  }
  
  return records.sort((a, b) => a.duration_sec - b.duration_sec)
}

export async function getEfTrend(days = 60): Promise<import('@/types').EfPoint[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const result = await pool.query(`
    SELECT 
      date,
      efficiency_factor,
      session_type
    FROM rides
    WHERE efficiency_factor IS NOT NULL
      AND date >= $1
    ORDER BY date
  `, [cutoffStr])
  
  return result.rows.map(r => ({
    date: toDateStr(r.date),
    ef: toNum(r.efficiency_factor) ?? 0,
    sessionType: r.session_type as string || "",
  }))
}

export { formatDuration, formatSleep } from './format'
export { getTitiDaysRemaining } from './titi'
export { classifySession, getSessionTypeLabel, getSessionTypeColor } from './classify-session'
