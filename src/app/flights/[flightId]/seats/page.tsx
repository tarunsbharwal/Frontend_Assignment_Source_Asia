import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SeatMapClient from '@/components/SeatMapClient'

interface SeatsPageProps {
  params: Promise<{ flightId: string }>
}

export default async function SeatsPage({ params }: SeatsPageProps) {
  const supabase = await createClient()
  const { flightId } = await params

  // Fetch flight details
  const { data: flight, error: flightError } = await supabase
    .from('flights')
    .select('*')
    .eq('id', flightId)
    .single()

  if (flightError || !flight) {
    return notFound()
  }

  // Fetch initial seats
  const { data: seats, error: seatsError } = await supabase
    .from('seats')
    .select('*')
    .eq('flight_id', flightId)
    .order('seat_number', { ascending: true })

  if (seatsError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading seats: {seatsError.message}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Select your seat</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Flight {flight.flight_no} • {flight.origin} to {flight.destination}
        </p>
      </div>

      <SeatMapClient initialSeats={seats} flightId={flightId} basePrice={flight.base_price} />
    </div>
  )
}
