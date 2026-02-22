import { NextResponse } from 'next/server'
import { getTodayReadiness, getReadinessHistory, getLoadChartData } from '@/lib/data'

export async function GET() {
  const today = getTodayReadiness()
  const history = getReadinessHistory(60)
  const chartData = getLoadChartData(60)
  return NextResponse.json({ today, history, chartData })
}
