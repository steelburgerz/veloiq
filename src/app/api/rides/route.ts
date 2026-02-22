import { NextResponse } from 'next/server'
import { getRecentRides } from '@/lib/data'

export async function GET() {
  const rides = getRecentRides(20)
  return NextResponse.json({ rides })
}
