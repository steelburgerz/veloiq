import { NextResponse } from 'next/server'
import { getTodayReadiness, getReadinessHistory, getLoadChartData } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [today, history, loadChart] = await Promise.all([
    getTodayReadiness(),
    getReadinessHistory(30),
    getLoadChartData(30),
  ])
  return NextResponse.json({ today, history, loadChart })
}
