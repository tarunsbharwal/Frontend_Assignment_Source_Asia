"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plane, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'

export default function NavBar() {
  const router = useRouter()
  const session = useUserStore((state) => state.session)
  const setSession = useUserStore((state) => state.setSession)
  const resetUserStore = useUserStore((state) => state.reset)
  const supabase = createClient()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase, setSession])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    resetUserStore()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="w-full h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Plane className="w-6 h-6 text-brand-600 group-hover:text-brand-500 transition-colors" />
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            FlightApp
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/my-bookings"
                className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors"
              >
                My Bookings
              </Link>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-all active:scale-95 shadow-sm shadow-brand-500/20"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
