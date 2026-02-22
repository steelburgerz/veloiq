'use client'

import { ReadinessEntry, ReadinessStatus } from '@/types'
import { formatSleep } from '@/lib/format'
import { Heart, Moon, Zap, Battery, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<ReadinessStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  GREEN:  { label: 'Good to go', color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-950/30',  border: 'border-green-200 dark:border-green-800',  dot: 'bg-green-500' },
  AMBER:  { label: 'Take it easy', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30',  border: 'border-amber-200 dark:border-amber-800',  dot: 'bg-amber-500' },
  RED:    { label: 'Rest day',    color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-950/30',      border: 'border-red-200 dark:border-red-800',      dot: 'bg-red-500'   },
}

interface ReadinessCardProps {
  entry: ReadinessEntry
}

export function ReadinessCard({ entry }: ReadinessCardProps) {
  const { status, reason, recommendation } = entry.wheelmate
  const cfg = statusConfig[status]
  const { intervals, garmin } = entry

  const metrics = [
    { icon: Moon,      label: 'Sleep',       value: formatSleep(garmin.sleep_sec), sub: `Score ${garmin.sleep_score}` },
    { icon: Heart,     label: 'HRV',         value: `${garmin.hrv_last_night_ms}ms`, sub: garmin.hrv_status },
    { icon: Zap,       label: 'RHR',         value: `${garmin.rhr_bpm} bpm`,       sub: 'Resting HR' },
    { icon: Battery,   label: 'Body Battery',value: `${garmin.body_battery_high}`,  sub: `Low ${garmin.body_battery_low}` },
    { icon: TrendingUp,label: 'Form (TSB)',   value: `${intervals.tsb > 0 ? '+' : ''}${intervals.tsb.toFixed(1)}`, sub: `CTL ${intervals.ctl.toFixed(1)}` },
  ]

  return (
    <div className={cn('rounded-2xl border p-6 space-y-5', cfg.bg, cfg.border)}>
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn('h-3 w-3 rounded-full', cfg.dot)} />
          <div>
            <p className={cn('text-xl font-bold', cfg.color)}>{status} — {cfg.label}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{reason}</p>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p className="font-medium">{new Date(entry.date).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {metrics.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="flex flex-col items-center text-center rounded-xl bg-background/60 p-3 gap-1">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <p className="text-base font-bold">{value}</p>
            <p className="text-xs text-muted-foreground leading-tight">{sub}</p>
          </div>
        ))}
      </div>

      {/* Coaching rec */}
      <div className="rounded-xl bg-background/70 border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Coach says</p>
        <p className="text-sm font-medium">{recommendation}</p>
      </div>
    </div>
  )
}
