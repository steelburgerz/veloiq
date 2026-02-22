import { NextResponse } from 'next/server'
import { getPeakPower } from '@/lib/data'

export async function GET() {
  const records = getPeakPower()
  return NextResponse.json({ records })
}
