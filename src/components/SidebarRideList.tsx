'use client'

import { usePathname } from 'next/navigation'
import { Ride } from '@/types'
import { RideRow } from '@/components/RideRow'

interface Props {
  rides: Ride[]
}

export function SidebarRideList({ rides }: Props) {
  const pathname = usePathname()

  return (
    <>
      {rides.length > 0 ? (
        rides.map((ride) => (
          <RideRow
            key={`${ride.date}-${ride.strava_id}`}
            ride={ride}
            isActive={pathname === `/ride/${ride.strava_id}`}
          />
        ))
      ) : (
        <div className="py-12 text-center text-muted-foreground text-sm px-4">
          No rides logged yet
        </div>
      )}
    </>
  )
}
