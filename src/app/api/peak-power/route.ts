import { NextResponse } from 'next/server'
import { getPeakPower } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const peakPower = await getPeakPower()
  return NextResponse.json(peakPower)
}
