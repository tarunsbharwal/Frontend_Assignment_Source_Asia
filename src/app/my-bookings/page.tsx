import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MyBookingsClient from '@/components/MyBookingsClient'

export default async function MyBookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch all bookings for the user
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights(*),
      seat:seats(*),
      passenger:passengers(*)
    `)
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false })

  // Pre-fetch alternative flights for any active bookings
  // (In a real app, this might be fetched on-demand to save data, but for this assignment, 
  // we can fetch them on-demand in the client component or pass them down)
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Bookings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your upcoming flights and view past trips.
        </p>
      </div>

      <MyBookingsClient initialBookings={bookings || []} />
    </div>
  )
}
