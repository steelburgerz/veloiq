export type ReadinessStatus = 'GREEN' | 'AMBER' | 'RED'

export type SessionType = 'threshold' | 'tempo' | 'endurance' | 'vo2' | 'mixed' | 'long_ride' | 'recovery' | 'race'

export interface ReadinessEntry {
  date: string
  intervals: {
    sleep_sec: number
    sleep_score: number
    rhr_bpm: number
    hrv_ms: number
    ctl: number
    atl: number
    tsb: number
  }
  garmin: {
    sleep_sec: number
    sleep_score: number
    hrv_last_night_ms: number
    hrv_weekly_avg_ms: number
    hrv_status: 'BALANCED' | 'UNBALANCED'
    rhr_bpm: number
    body_battery_charged: number
    body_battery_drained: number
    body_battery_high: number
    body_battery_low: number
  }
  wheelmate: {
    status: ReadinessStatus
    reason: string
    recommendation: string
  }
}

export interface KeyBlock {
  label: string
  count: number
  duration_sec: number
  avg_power_w: number | null
  power_pct_ftp: number | null
  avg_hr_bpm: number | null
  avg_cadence_rpm: number | null
  zone: string | null
  source: string
}

export interface ZonesSec {
  Z1?: number
  Z2?: number
  Z3?: number
  Z4?: number
  Z5?: number
  Z6?: number
  Z7?: number
  SS?: number
}

export interface Ride {
  date: string
  source: string
  strava_id: string
  intervals_id: string | null
  label: string
  session_type: SessionType
  detail_quality: string
  duration_min: number
  distance_km: number
  elev_m: number
  work_kj: number
  avg_power_w: number | null
  np_w: number | null
  max_power_w: number | null
  avg_hr_bpm: number | null
  max_hr_bpm: number | null
  avg_cadence_rpm: number | null
  intervals_load: number | null
  ctl: number | null
  atl: number | null
  tsb: number | null
  if: number | null
  tss: number | null
  zones_power_sec: ZonesSec | null
  zones_hr_sec: ZonesSec | null
  key_blocks: KeyBlock[] | null
  // Performance metrics
  decoupling_pct: number | null
  efficiency_factor: number | null
  variability_index: number | null
  polarization_index: number | null
  lr_balance: string | null
  // Environmental
  avg_temp_c: number | null
  max_temp_c: number | null
  // Nutrition
  carbs_used_g: number | null
}

export interface PeakPowerRecord {
  period: string
  duration_sec: number
  power_w: number
  power_wkg: number
  date: string
  source: string
  activity_label: string
}

export interface WkgCheckpoint {
  date: string
  weight_kg: number
  ftp_w: number
  ftp_wkg: number
  notes: string | null
}

export interface LoadChartPoint {
  date: string
  ctl: number
  atl: number
  tsb: number
}

export interface WeekSummary {
  weekLabel: string
  startDate: string
  endDate: string
  rides: Ride[]
  totalHours: number
  totalDistance: number
  totalLoad: number
  totalElev: number
  avgTSB: number | null
}
