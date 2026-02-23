import {
  getRecentRides,
  getTitiDaysRemaining,
} from '@/lib/data'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SidebarRideList } from '@/components/SidebarRideList'
import { Bike } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const rides = getRecentRides(30)
  const daysToTiti = getTitiDaysRemaining()

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top nav */}
      <nav className="border-b sticky top-0 bg-background/90 backdrop-blur z-20 shrink-0">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Bike className="h-5 w-5 text-indigo-500" />
            WheelMate
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Ralph</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-indigo-500 font-semibold">{daysToTiti}d to TiTi</span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Two-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 border-r bg-muted/20 overflow-y-auto">
          <div className="sticky top-0 bg-muted/20 backdrop-blur border-b px-4 py-3 z-10">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Rides</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{rides.length} activities</p>
          </div>
          <div className="flex-1 px-2 py-2">
            <SidebarRideList rides={rides} />
          </div>
        </aside>

        {/* Right panel */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
