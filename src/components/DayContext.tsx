import { Ride } from '@/types'
import { formatSleep } from '@/lib/format'
import { Moon, Heart, Zap, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

function sleepColor(score: number | null) {
  if (!score) return 'text-muted-foreground'
  if (score >= 75) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-amber-500'
  return 'text-red-500'
}

function hrvColor(hrv: number | null) {
  if (!hrv) return 'text-muted-foreground'
  if (hrv >= 50) return 'text-green-600 dark:text-green-400'
  if (hrv >= 40) return 'text-amber-500'
  return 'text-red-500'
}

interface DayContextProps {
  ride: Ride
}

export function DayContext({ ride }: DayContextProps) {
  const hasDayData = ride.day_sleep_secs || ride.day_hrv_ms || ride.day_rhr_bpm || ride.day_vo2max || ride.day_eftp_w

  if (!hasDayData) return null

  const items = [
    ride.day_sleep_secs && {
      icon: Moon,
      label: 'Sleep',
      value: formatSleep(ride.day_sleep_secs),
      sub: ride.day_sleep_score ? `Score ${ride.day_sleep_score}` : '',
      color: sleepColor(ride.day_sleep_score),
    },
    ride.day_hrv_ms && {
      icon: Heart,
      label: 'HRV',
      value: `${ride.day_hrv_ms}ms`,
      sub: '',
      color: hrvColor(ride.day_hrv_ms),
    },
    ride.day_rhr_bpm && {
      icon: Heart,
      label: 'RHR',
      value: `${ride.day_rhr_bpm}bpm`,
      sub: '',
      color: 'text-foreground',
    },
    ride.day_eftp_w && {
      icon: Zap,
      label: 'eFTP',
      value: `${ride.day_eftp_w}W`,
      sub: ride.day_weight_kg ? `${(ride.day_eftp_w / ride.day_weight_kg).toFixed(2)} W/kg` : '',
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    ride.day_w_prime_j && {
      icon: Zap,
      label: "W' Reserve",
      value: `${(ride.day_w_prime_j / 1000).toFixed(1)}kJ`,
      sub: 'Anaerobic tank',
      color: 'text-orange-500',
    },
    ride.day_vo2max && {
      icon: Activity,
      label: 'VO₂max',
      value: `${ride.day_vo2max}`,
      sub: 'ml/kg/min',
      color: ride.day_vo2max >= 55 ? 'text-green-600 dark:text-green-400' : 'text-foreground',
    },
    ride.day_ramp_rate !== null && ride.day_ramp_rate !== undefined && {
      icon: Activity,
      label: 'Ramp Rate',
      value: `${ride.day_ramp_rate > 0 ? '+' : ''}${ride.day_ramp_rate.toFixed(1)}`,
      sub: Math.abs(ride.day_ramp_rate) > 8 ? 'Too hard' : Math.abs(ride.day_ramp_rate) <= 5 ? 'Optimal' : 'Heavy',
      color: Math.abs(ride.day_ramp_rate) > 8 ? 'text-red-500' : Math.abs(ride.day_ramp_rate) <= 5 ? 'text-green-600 dark:text-green-400' : 'text-amber-500',
    },
  ].filter(Boolean) as { icon: typeof Moon; label: string; value: string; sub: string; color: string }[]

  // Contextual verdict
  const verdict = (() => {
    const badSleep = ride.day_sleep_score && ride.day_sleep_score < 60
    const lowHrv = ride.day_hrv_ms && ride.day_hrv_ms < 40
    if (badSleep && lowHrv) return { text: 'Tough conditions — low sleep AND suppressed HRV going in. Respect this effort.', cls: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' }
    if (badSleep) return { text: 'Under-slept going into this session. Performance here is notable.', cls: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' }
    if (ride.day_sleep_score && ride.day_sleep_score >= 75 && ride.day_hrv_ms && ride.day_hrv_ms >= 50) return { text: 'Well rested and recovered — ideal conditions for this session.', cls: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' }
    return null
  })()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {items.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-xl border bg-muted/20 p-3 text-center">
            <Icon className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
            <p className={cn('text-sm font-bold', color)}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {sub && <p className="text-xs text-muted-foreground/60 leading-tight mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>
      {verdict && (
        <div className={cn('rounded-xl border px-4 py-3 text-sm', verdict.cls)}>
          {verdict.text}
        </div>
      )}
    </div>
  )
}
