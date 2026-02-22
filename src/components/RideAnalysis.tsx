import { Ride } from '@/types'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from 'lucide-react'

interface Insight {
  type: 'good' | 'bad' | 'insight' | 'next'
  text: string
}

function analyseRide(ride: Ride): Insight[] {
  const insights: Insight[] = []
  const ftp = 270

  // Power execution
  if (ride.np_w && ride.avg_power_w) {
    const vi = ride.np_w / ride.avg_power_w
    if (ride.session_type === 'threshold' && ride.np_w >= ftp * 0.9) {
      insights.push({ type: 'good', text: `Hit threshold target — NP ${ride.np_w}W is ${Math.round((ride.np_w / ftp) * 100)}% of FTP.` })
    }
    if (vi > 1.12) {
      insights.push({ type: 'bad', text: `Variability Index ${vi.toFixed(2)} is high — lots of surging. More even pacing would improve endurance adaptation.` })
    } else if (vi <= 1.05) {
      insights.push({ type: 'good', text: `Clean pacing — Variability Index ${vi.toFixed(2)}. Consistent power delivery.` })
    }
  }

  // HR vs power
  if (ride.avg_hr_bpm && ride.np_w) {
    const hrPowerRatio = ride.avg_hr_bpm / ride.np_w
    if (ride.session_type === 'endurance' && ride.avg_hr_bpm > 155) {
      insights.push({ type: 'bad', text: `HR ${ride.avg_hr_bpm}bpm is elevated for an endurance ride. Could indicate heat, fatigue, or pacing too hard.` })
    }
    if (ride.session_type === 'long_ride' && ride.avg_hr_bpm <= 150) {
      insights.push({ type: 'good', text: `HR ${ride.avg_hr_bpm}bpm well controlled on a long ride — strong aerobic base showing.` })
    }
  }

  // Key blocks analysis
  if (ride.key_blocks && ride.key_blocks.length > 0) {
    const aboveFtp = ride.key_blocks.filter(b => b.power_pct_ftp && b.power_pct_ftp >= 1.0)
    const highHr = ride.key_blocks.filter(b => b.avg_hr_bpm && b.avg_hr_bpm >= 165)
    if (aboveFtp.length > 0) {
      insights.push({ type: 'good', text: `${aboveFtp.length} block${aboveFtp.length > 1 ? 's' : ''} above FTP — neuromuscular and VO2 stimulus achieved.` })
    }
    if (highHr.length > 0) {
      insights.push({ type: 'insight', text: `Peak HR reached ${Math.max(...ride.key_blocks.filter(b => b.avg_hr_bpm).map(b => b.avg_hr_bpm!))}bpm in hard blocks — cardiac stress in expected range for intensity.` })
    }
    // Cadence
    const lowCadence = ride.key_blocks.filter(b => b.avg_cadence_rpm && b.avg_cadence_rpm < 75 && b.zone && ['Z4','Z5','Z5-6'].includes(b.zone))
    if (lowCadence.length > 0) {
      insights.push({ type: 'insight', text: `Cadence dropped below 75rpm in ${lowCadence.length} hard block${lowCadence.length > 1 ? 's' : ''}. Aim for 80–90rpm in threshold+ efforts to spare legs on long rides.` })
    }
  }

  // Zone distribution
  if (ride.zones_power_sec) {
    const z = ride.zones_power_sec
    const totalSec = Object.values(z).reduce((s, v) => s + (v ?? 0), 0)
    const z2Pct = ((z.Z2 ?? 0) / totalSec) * 100
    const highPct = (((z.Z5 ?? 0) + (z.Z6 ?? 0) + (z.Z7 ?? 0)) / totalSec) * 100
    if (ride.session_type === 'long_ride' && z2Pct < 20) {
      insights.push({ type: 'bad', text: `Only ${z2Pct.toFixed(0)}% in Z2 for a long ride. More base time would improve fat oxidation and TiTi endurance.` })
    }
    if (ride.session_type === 'long_ride' && highPct > 8) {
      insights.push({ type: 'insight', text: `${highPct.toFixed(0)}% in Z5–Z7 on a long ride. Solid surging stimulus — good TiTi preparation.` })
    }
  }

  // Load context
  if (ride.tsb !== null && ride.tsb !== undefined) {
    if (ride.tsb < -20 && ride.session_type !== 'recovery') {
      insights.push({ type: 'bad', text: `TSB was ${ride.tsb.toFixed(1)} going in — deep fatigue hole. Recovery priority after this.` })
    } else if (ride.tsb > 15 && ['threshold','vo2'].includes(ride.session_type)) {
      insights.push({ type: 'good', text: `Fresh legs (TSB ${ride.tsb.toFixed(1)}) for a quality session — ideal conditions.` })
    }
  }

  // IF
  if (ride.if) {
    if (ride.session_type === 'threshold' && ride.if >= 0.9) {
      insights.push({ type: 'good', text: `IF ${ride.if.toFixed(2)} — solid threshold execution.` })
    }
    if (ride.session_type === 'long_ride' && ride.if > 0.8) {
      insights.push({ type: 'insight', text: `IF ${ride.if.toFixed(2)} for a long ride is quite high. Fine for race simulation, but watch recovery.` })
    }
  }

  // Next recommendation
  if (ride.session_type === 'long_ride') {
    insights.push({ type: 'next', text: 'Easy spin or rest tomorrow. Focus on nutrition and sleep to absorb the load.' })
  } else if (ride.session_type === 'threshold') {
    insights.push({ type: 'next', text: 'Allow 24–48h before next quality session. Endurance or recovery ride tomorrow is fine.' })
  } else if (ride.session_type === 'endurance') {
    insights.push({ type: 'next', text: 'Good base session. Can layer a quality session tomorrow if readiness is GREEN.' })
  }

  return insights
}

const iconMap = {
  good: { Icon: CheckCircle2, cls: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' },
  bad: { Icon: XCircle, cls: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
  insight: { Icon: Lightbulb, cls: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' },
  next: { Icon: ArrowRight, cls: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800' },
}

export function RideAnalysis({ ride }: { ride: Ride }) {
  const insights = analyseRide(ride)
  if (!insights.length) return null

  return (
    <div className="space-y-2">
      {insights.map((ins, i) => {
        const { Icon, cls, bg } = iconMap[ins.type]
        return (
          <div key={i} className={cn('flex items-start gap-3 rounded-xl border p-3', bg)}>
            <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', cls)} />
            <p className="text-sm">{ins.text}</p>
          </div>
        )
      })}
    </div>
  )
}
