import { cn } from '@/lib/utils'
import { Activity, Zap, TrendingUp, TrendingDown, Weight } from 'lucide-react'

interface AthleteStatBarProps {
  vo2max: number | null
  eftp: number | null
  rollingFtp: number | null
  wPrime: number | null
  weight: number | null
  rampRate: number | null
}

export function AthleteStatBar({ vo2max, eftp, rollingFtp, wPrime, weight, rampRate }: AthleteStatBarProps) {
  const wkg = eftp && weight ? (eftp / weight).toFixed(2) : null
  const wPrimeKj = wPrime ? (wPrime / 1000).toFixed(1) : null
  const rampOk = rampRate !== null && Math.abs(rampRate) <= 5
  const rampHigh = rampRate !== null && Math.abs(rampRate) > 8

  const stats = [
    {
      icon: Activity,
      label: 'VO₂max',
      value: vo2max ? `${vo2max}` : '—',
      sub: 'ml/kg/min',
      color: vo2max && vo2max >= 55 ? 'text-green-600 dark:text-green-400' : 'text-foreground',
    },
    {
      icon: Zap,
      label: 'eFTP',
      value: eftp ? `${eftp}W` : '—',
      sub: wkg ? `${wkg} W/kg` : '',
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: Zap,
      label: 'Rolling FTP',
      value: rollingFtp ? `${rollingFtp}W` : '—',
      sub: 'Recent 30d',
      color: 'text-indigo-500',
    },
    {
      icon: Zap,
      label: "W' Reserve",
      value: wPrimeKj ? `${wPrimeKj}kJ` : '—',
      sub: 'Anaerobic capacity',
      color: 'text-orange-500',
    },
    {
      icon: rampRate !== null && rampRate >= 0 ? TrendingUp : TrendingDown,
      label: 'Ramp Rate',
      value: rampRate !== null ? `${rampRate > 0 ? '+' : ''}${rampRate.toFixed(1)}` : '—',
      sub: rampRate !== null ? (rampHigh ? 'Too aggressive' : rampOk ? 'Optimal' : 'Heavy load') : '',
      color: rampRate === null ? 'text-foreground'
        : rampHigh ? 'text-red-500'
        : rampOk ? 'text-green-600 dark:text-green-400'
        : 'text-amber-500',
    },
    {
      icon: Weight,
      label: 'Weight',
      value: weight ? `${weight}kg` : '—',
      sub: '',
      color: 'text-foreground',
    },
  ]

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {stats.map(({ icon: Icon, label, value, sub, color }) => (
        <div key={label} className="rounded-xl border bg-muted/20 p-3 text-center">
          <Icon className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
          <p className={cn('text-base font-bold', color)}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
      ))}
    </div>
  )
}
