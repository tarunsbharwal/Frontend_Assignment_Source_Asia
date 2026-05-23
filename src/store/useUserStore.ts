import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Session } from '@supabase/supabase-js'

interface UserState {
  session: Session | null
  cachedBookings: any[]
  setSession: (session: Session | null) => void
  setCachedBookings: (bookings: any[]) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      session: null,
      cachedBookings: [],
      setSession: (session) => set({ session }),
      setCachedBookings: (cachedBookings) => set({ cachedBookings }),
      reset: () => set({ session: null, cachedBookings: [] }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ session: state.session }), // persist only the session token
    }
  )
)
