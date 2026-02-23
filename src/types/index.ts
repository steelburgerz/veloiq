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
  elev_high_m: number | null
  elev_low_m: number | null
  work_kj: number
  avg_power_w: number | null
  np_w: number | null
  max_power_w: number | null
  avg_hr_bpm: number | null
  max_hr_bpm: number | null
  avg_cadence_rpm: number | null
  avg_respiration_rpm: number | null
  intervals_load: number | null
  garmin_training_load: number | null
  ctl: number | null
  atl: number | null
  tsb: number | null
  if: number | null
  tss: number | null
  calories: number | null
  suffer_score: number | null
  elapsed_time_sec: number | null
  gear_id: string | null
  training_load_pct: number | null
  power_hr_ratio: number | null
  peak_cp_w: number | null
  peak_ftp_w: number | null
  peak_ftp_secs: number | null
  peak_pmax_w: number | null
  rolling_ftp_w: number | null
  peak_power_curve: Record<string, number> | null
  // Training effect
  aerobic_te: number | null
  anaerobic_te: number | null
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
  // Zone distributions
  zones_power_sec: ZonesSec | null
  zones_hr_sec: ZonesSec | null
  key_blocks: KeyBlock[] | null
  // Day-of context (readiness at time of ride)
  day_weight_kg: number | null
  day_rhr_bpm: number | null
  day_hrv_ms: number | null
  day_sleep_secs: number | null
  day_sleep_score: number | null
  day_vo2max: number | null
  day_eftp_w: number | null
  day_w_prime_j: number | null
  day_ramp_rate: number | null
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

export interface EftpPoint {
  date: string
  eftp: number
  wPrime: number
  rampRate: number | null
}

export interface EfPoint {
  date: string
  ef: number
  sessionType: string
}
