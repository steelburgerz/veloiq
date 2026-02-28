"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { LogOut, User, ChevronDown } from "lucide-react"

export function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  
  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
  }
  
  if (!session?.user) {
    return null
  }
  
  const user = session.user
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="flex items-center gap-2 focus:outline-none"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-slate-200 hover:border-indigo-400 transition-colors"
          />
        ) : (
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-200 hover:border-indigo-400 transition-colors">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
          </div>
        )}
        <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 py-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border opacity-100 visible transition-all z-50">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
