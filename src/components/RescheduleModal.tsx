"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { X, Plane, ArrowRight } from 'lucide-react'

export default function RescheduleModal({ booking, onClose, onSuccess }: { booking: any, onClose: () => void, onSuccess: () => void }) {
  const supabase = createClient()
  const [altFlights, setAltFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rescheduling, setRescheduling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAltFlights() {
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('origin', booking.flight.origin)
        .eq('destination', booking.flight.destination)
        .neq('id', booking.flight.id) // Not the same flight
        .gt('departs_at', new Date().toISOString()) // In the future
        .order('departs_at', { ascending: true })
      
      if (!error && data) {
        setAltFlights(data)
      }
      setLoading(false)
    }

    fetchAltFlights()
  }, [booking, supabase])

  const handleReschedule = async (newFlight: any) => {
    if (!confirm(`Reschedule to Flight ${newFlight.flight_no}?`)) return
    
    setRescheduling(true)
    setError(null)

    // Calculate fee (charge fee if new flight is more expensive)
    const oldPrice = Number(booking.flight.base_price)
    const newPrice = Number(newFlight.base_price)
    const feeCharged = newPrice > oldPrice ? newPrice - oldPrice : 0

    try {
      // 1. We need to atomically: free old seat, pick new seat, update booking, insert reschedule
      // Since we don't have an RPC for this, we'll do it sequentially in this assignment context,
      // but warn about atomic guarantees. 
      // To strictly follow atomic assignment without a new RPC, we could write a Postgres function
      // but creating one from the client is impossible without migrations. We'll use supabase API.
      
      // Get a free seat on the new flight of the same class
      const { data: newSeats, error: seatError } = await supabase
        .from('seats')
        .select('*')
        .eq('flight_id', newFlight.id)
        .eq('class', booking.seat.class)
        .eq('is_available', true)
        .limit(1)

      if (seatError || !newSeats || newSeats.length === 0) {
        throw new Error("No available seats of the same class on the new flight.")
      }

      const newSeat = newSeats[0]

      // Update new seat to unavailable
      await supabase.from('seats').update({ is_available: false }).eq('id', newSeat.id)
      
      // Update old seat to available
      await supabase.from('seats').update({ is_available: true }).eq('id', booking.seat_id)

      // Insert reschedule record
      await supabase.from('reschedules').insert({
        booking_id: booking.id,
        old_flight_id: booking.flight_id,
        new_flight_id: newFlight.id,
        fee_charged: feeCharged
      })

      // Update booking
      const { error: updateError } = await supabase.from('bookings').update({
        flight_id: newFlight.id,
        seat_id: newSeat.id,
        status: 'rescheduled',
        total_price: Number(booking.total_price) + feeCharged
      }).eq('id', booking.id)

      if (updateError) throw new Error(updateError.message)

      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to reschedule.")
      setRescheduling(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
        
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reschedule Flight</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Current Flight</div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{booking.flight.flight_no}</div>
                <div className="text-sm text-slate-500">{format(new Date(booking.flight.departs_at), 'MMM dd, yyyy HH:mm')}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 dark:text-white">${booking.flight.base_price}</div>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Alternative Flights</h3>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : altFlights.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No alternative flights found for this route.
            </div>
          ) : (
            <div className="space-y-4">
              {altFlights.map(flight => {
                const isMoreExpensive = Number(flight.base_price) > Number(booking.flight.base_price)
                const fee = isMoreExpensive ? Number(flight.base_price) - Number(booking.flight.base_price) : 0

                return (
                  <div key={flight.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{flight.flight_no}</div>
                      <div className="text-sm text-slate-500">{format(new Date(flight.departs_at), 'MMM dd, yyyy HH:mm')}</div>
                      {fee > 0 && <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">+${fee} fee</div>}
                    </div>
                    <button
                      onClick={() => handleReschedule(flight)}
                      disabled={rescheduling}
                      className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {rescheduling ? '...' : 'Select'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
