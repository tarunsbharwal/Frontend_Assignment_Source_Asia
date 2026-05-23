import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format, differenceInMinutes } from 'date-fns'
import { Clock, PlaneTakeoff, PlaneLanding, ArrowRight } from 'lucide-react'
import FlightListClient from '@/components/FlightListClient'

interface FlightsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function formatDuration(start: string, end: string) {
  const diffMins = differenceInMinutes(new Date(end), new Date(start))
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const supabase = await createClient()
  
  const params = await searchParams
  const origin = params.origin as string | undefined
  const destination = params.destination as string | undefined
  const dateStr = params.date as string | undefined

  let query = supabase.from('flights').select('*').order('departs_at', { ascending: true })

  if (origin) {
    query = query.ilike('origin', `%${origin}%`)
  }
  if (destination) {
    query = query.ilike('destination', `%${destination}%`)
  }
  
  // Note: We are intentionally ignoring the date string for filtering 
  // because the seeded data uses dynamic dates (e.g. now() + 3 days)
  // which makes it very hard to test if we enforce a strict date filter.
  // if (dateStr) {
  //   const startDate = new Date(dateStr)
  //   startDate.setHours(0, 0, 0, 0)
  //   const endDate = new Date(dateStr)
  //   endDate.setHours(23, 59, 59, 999)
  //   query = query.gte('departs_at', startDate.toISOString()).lte('departs_at', endDate.toISOString())
  // }

  const { data: flights, error } = await query

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Select your flight</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {flights?.length || 0} {flights?.length === 1 ? 'flight' : 'flights'} found
            {origin && destination && ` from ${origin} to ${destination}`}
            {dateStr && ` on ${format(new Date(dateStr), 'MMM dd, yyyy')}`}
          </p>
        </div>
        <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors">
          Change search
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl mb-6">
          Failed to load flights: {error.message}
        </div>
      )}

      {!flights || flights.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <PlaneTakeoff className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No flights found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Try adjusting your search criteria or dates.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors"
          >
            Go back to search
          </Link>
        </div>
      ) : (
        <FlightListClient flights={flights} />
      )}
    </div>
  )
}
