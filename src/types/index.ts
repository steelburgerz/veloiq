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
}

export interface PeakPowerEntry {
  period: string
  entries: {
    duration_sec: number
    power_w: number
    power_wkg: number
    date: string
    source: string
    activity_label: string
  }[]
}

export interface LoadChartPoint {
  date: string
  ctl: number
  atl: number
  tsb: number
}
