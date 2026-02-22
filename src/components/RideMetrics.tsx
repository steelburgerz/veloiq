import { Ride } from '@/types'
import { cn } from '@/lib/utils'
import { Thermometer, Droplets, Scale, Activity, ArrowLeftRight } from 'lucide-react'

interface MetricProps {
  label: string
  value: string
  sub?: string
  highlight?: 'good' | 'warn' | 'bad' | null
}

function Metric({ label, value, sub, highlight }: MetricProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3 text-center">
      <p className={cn(
        'text-base font-bold',
        highlight === 'good' && 'text-green-600 dark:text-green-400',
        highlight === 'warn' && 'text-amber-500',
        highlight === 'bad'  && 'text-red-500',
      )}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  )
}

function decouplingHighlight(pct: number | null): 'good' | 'warn' | 'bad' | null {
  if (pct === null) return null
  if (pct <= 5) return 'good'
  if (pct <= 8) return 'warn'
  return 'bad'
}

function efHighlight(ef: number | null): 'good' | 'warn' | null {
  if (ef === null) return null
  return ef >= 1.35 ? 'good' : 'warn'
}

function viHighlight(vi: number | null): 'good' | 'warn' | 'bad' | null {
  if (vi === null) return null
  if (vi <= 1.05) return 'good'
  if (vi <= 1.12) return 'warn'
  return 'bad'
}

function lrHighlight(lr: string | null): 'good' | 'warn' | null {
  if (!lr) return null
  const left = parseFloat(lr.split('/')[0])
  return Math.abs(left - 50) <= 2 ? 'good' : 'warn'
}

interface RideMetricsProps {
  ride: Ride
}

export function RideMetrics({ ride }: RideMetricsProps) {
  const hasPerf = ride.decoupling_pct !== null || ride.efficiency_factor !== null ||
    ride.variability_index !== null || ride.polarization_index !== null || ride.lr_balance !== null
  const hasEnv = ride.avg_temp_c !== null || ride.carbs_used_g !== null

  if (!hasPerf && !hasEnv) return null

  return (
    <div className="space-y-6">
      {/* Performance metrics */}
      {hasPerf && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Performance Metrics</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ride.decoupling_pct !== null && (
              <Metric
                label="Aerobic Decoupling"
                value={`${ride.decoupling_pct.toFixed(1)}%`}
                sub={ride.decoupling_pct <= 5 ? 'Well coupled' : ride.decoupling_pct <= 8 ? 'Slight drift' : 'HR drifting'}
                highlight={decouplingHighlight(ride.decoupling_pct)}
              />
            )}
            {ride.efficiency_factor !== null && (
              <Metric
                label="Efficiency Factor"
                value={ride.efficiency_factor.toFixed(2)}
                sub="NP ÷ Avg HR"
                highlight={efHighlight(ride.efficiency_factor)}
              />
            )}
            {ride.variability_index !== null && (
              <Metric
                label="Variability Index"
                value={ride.variability_index.toFixed(2)}
                sub={ride.variability_index <= 1.05 ? 'Even pacing' : ride.variability_index <= 1.12 ? 'Moderate surging' : 'High surging'}
                highlight={viHighlight(ride.variability_index)}
              />
            )}
            {ride.polarization_index !== null && (
              <Metric
                label="Polarization"
                value={ride.polarization_index.toFixed(2)}
                sub=">1 = polarized"
              />
            )}
            {ride.lr_balance && (
              <Metric
                label="L/R Balance"
                value={ride.lr_balance}
                sub={Math.abs(parseFloat(ride.lr_balance.split('/')[0]) - 50) <= 2 ? 'Balanced' : 'Asymmetry noted'}
                highlight={lrHighlight(ride.lr_balance)}
              />
            )}
          </div>

          {/* Inline explanations for key metrics */}
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            {ride.decoupling_pct !== null && (
              <div className={cn(
                'rounded-lg border p-3 text-xs',
                ride.decoupling_pct <= 5
                  ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  : ride.decoupling_pct <= 8
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              )}>
                <p className="font-semibold mb-0.5">Aerobic Decoupling: {ride.decoupling_pct.toFixed(1)}%</p>
                <p className="text-muted-foreground">
                  {ride.decoupling_pct <= 5
                    ? 'HR stayed proportional to power through the ride. Strong aerobic base holding up.'
                    : ride.decoupling_pct <= 8
                    ? 'Slight HR drift in second half. Acceptable for long rides in heat — watch fuelling and hydration.'
                    : 'Significant HR drift vs power. Could indicate fatigue, heat stress, or dehydration. Prioritise recovery.'}
                </p>
              </div>
            )}
            {ride.efficiency_factor !== null && (
              <div className={cn(
                'rounded-lg border p-3 text-xs',
                ride.efficiency_factor >= 1.35
                  ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
              )}>
                <p className="font-semibold mb-0.5">Efficiency Factor: {ride.efficiency_factor.toFixed(2)}</p>
                <p className="text-muted-foreground">
                  {ride.efficiency_factor >= 1.35
                    ? 'Good aerobic efficiency — producing solid power per heartbeat.'
                    : 'Room to grow. Track this over weeks: a rising EF means your aerobic system is adapting.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Environmental + Nutrition */}
      {hasEnv && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Environment & Nutrition</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ride.avg_temp_c !== null && (
              <Metric
                label="Avg Temp"
                value={`${ride.avg_temp_c.toFixed(1)}°C`}
                highlight={ride.avg_temp_c > 30 ? 'bad' : ride.avg_temp_c > 27 ? 'warn' : 'good'}
                sub={ride.avg_temp_c > 30 ? 'High heat' : ride.avg_temp_c > 27 ? 'Warm' : 'Manageable'}
              />
            )}
            {ride.max_temp_c !== null && (
              <Metric
                label="Max Temp"
                value={`${ride.max_temp_c}°C`}
                highlight={ride.max_temp_c > 33 ? 'bad' : 'warn'}
              />
            )}
            {ride.carbs_used_g !== null && (
              <>
                <Metric
                  label="Carbs Used"
                  value={`${ride.carbs_used_g}g`}
                  sub={`${Math.round(ride.carbs_used_g / (ride.duration_min / 60))}g/hr`}
                />
                <div className="rounded-xl border bg-muted/20 p-3 text-center">
                  <p className="text-base font-bold">
                    {Math.round(ride.carbs_used_g / (ride.duration_min / 60))} <span className="text-xs font-normal">g/hr</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Carb Rate</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {ride.carbs_used_g / (ride.duration_min / 60) < 60 ? 'Below target' : 'Good fuelling'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
