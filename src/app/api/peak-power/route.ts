import { NextResponse } from 'next/server'
import { getPeakPower } from '@/lib/data'

export async function GET() {
  const data = getPeakPower()
  return NextResponse.json({ data })
}
