"use client"

import { format, differenceInMinutes } from 'date-fns'
import { Clock, PlaneTakeoff, PlaneLanding, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'

interface Flight {
  id: string
  flight_no: string
  origin: string
  destination: string
  departs_at: string
  arrives_at: string
  aircraft_type: string
  status: string
  base_price: number
}

function formatDuration(start: string, end: string) {
  const diffMins = differenceInMinutes(new Date(end), new Date(start))
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
}

export default function FlightListClient({ flights }: { flights: Flight[] }) {
  const router = useRouter()
  const setSelectedFlight = useFlightStore(state => state.setSelectedFlight)
  const setCurrentStep = useFlightStore(state => state.setCurrentStep)
  const passengerCount = useFlightStore(state => state.searchQuery?.passengerCount || 1)

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight)
    setCurrentStep(2) // Move to seat selection
    router.push(`/flights/${flight.id}/seats`)
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <div
          key={flight.id}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Flight Info */}
          <div className="flex-1 w-full grid grid-cols-3 gap-4 items-center">
            {/* Origin */}
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {format(new Date(flight.departs_at), 'HH:mm')}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {flight.origin}
              </div>
            </div>

            {/* Duration & Stops */}
            <div className="text-center flex flex-col items-center">
              <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3" />
                {formatDuration(flight.departs_at, flight.arrives_at)}
              </div>
              <div className="w-full flex items-center relative">
                <div className="w-full h-px bg-slate-300 dark:bg-slate-700"></div>
                <PlaneTakeoff className="w-4 h-4 text-brand-500 absolute left-0 -translate-x-1/2 bg-white dark:bg-slate-900" />
                <PlaneLanding className="w-4 h-4 text-brand-500 absolute right-0 translate-x-1/2 bg-white dark:bg-slate-900" />
              </div>
              <div className="text-xs text-brand-500 font-medium mt-1">Direct</div>
            </div>

            {/* Destination */}
            <div className="text-left">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {format(new Date(flight.arrives_at), 'HH:mm')}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {flight.destination}
              </div>
            </div>
          </div>

          {/* Pricing and Action */}
          <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-between md:items-end gap-4 md:border-l border-slate-200 dark:border-slate-800 md:pl-6">
            <div className="text-left md:text-right">
              <div className="text-sm text-slate-500 dark:text-slate-400">from</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ${flight.base_price.toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => handleSelectFlight(flight)}
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-2 active:scale-95"
            >
              Select
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
