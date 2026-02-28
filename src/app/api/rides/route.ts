import { NextResponse } from 'next/server'
import { getRecentRides } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rides = await getRecentRides(50)
  return NextResponse.json(rides)
}
