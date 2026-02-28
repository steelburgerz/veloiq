import { PeakPowerRecord } from '@/types'
import { cn } from '@/lib/utils'

const DURATION_LABELS: Record<number, string> = {
  5: '5s', 15: '15s', 30: '30s', 60: '1min',
  120: '2min', 300: '5min', 600: '10min',
  1200: '20min', 1800: '30min', 2400: '40min', 3600: '1hr', 10800: '3hr'
}

interface PeakPowerTableProps {
  records: PeakPowerRecord[]
}

export function PeakPowerTable({ records }: PeakPowerTableProps) {
  const sorted = [...records].sort((a, b) => a.duration_sec - b.duration_sec)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duration</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Watts</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">W/kg</th>
            <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Ride</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry, index) => {
            const label = DURATION_LABELS[entry.duration_sec] ?? `${entry.duration_sec}s`
            const isHighlight = entry.duration_sec >= 300 && entry.duration_sec <= 1200
            return (
              <tr key={`${entry.duration_sec}-${entry.date}-${entry.source}-${index}`} className={cn('border-b last:border-0', isHighlight && 'bg-indigo-50/50 dark:bg-indigo-950/20')}>
                <td className="py-2 px-2 font-medium">{label}</td>
                <td className="py-2 px-2 text-right font-bold">{entry.power_w}W</td>
                <td className="py-2 px-2 text-right text-muted-foreground">{entry.power_wkg.toFixed(2)}</td>
                <td className="py-2 px-2 text-left text-muted-foreground text-xs hidden sm:table-cell max-w-[180px] truncate">
                  {entry.activity_label ?? '—'}
                </td>
                <td className="py-2 px-2 text-right text-muted-foreground text-xs hidden sm:table-cell">
                  {new Date(entry.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
