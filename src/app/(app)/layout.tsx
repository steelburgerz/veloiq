import {
  getRecentRides,
} from '@/lib/data'
import { getTitiDaysRemaining } from '@/lib/titi'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SidebarRideList } from '@/components/SidebarRideList'
import { UserMenu } from '@/components/UserMenu'
import { InstallPrompt } from '@/components/InstallPrompt'
import { Bike } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [rides, daysToTiti] = await Promise.all([
    getRecentRides(30),
    Promise.resolve(getTitiDaysRemaining()),
  ])

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top nav */}
      <nav className="border-b sticky top-0 bg-background/90 backdrop-blur z-20 shrink-0">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Bike className="h-5 w-5 text-indigo-500" />
            VeloIQ
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm text-indigo-500 font-semibold hidden sm:inline">{daysToTiti}d to TiTi</span>
            <span className="text-sm text-indigo-500 font-semibold sm:hidden">{daysToTiti}d</span>
            <ThemeToggle />
            <UserMenu />
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
          <div className="max-w-5xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      <InstallPrompt />
    </div>
  )
}
