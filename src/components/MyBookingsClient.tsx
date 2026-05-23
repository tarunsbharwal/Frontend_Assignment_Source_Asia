"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { Plane, Calendar, MapPin, XCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import RescheduleModal from './RescheduleModal'

export default function MyBookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rescheduleBooking, setRescheduleBooking] = useState<any | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return
    
    setLoading(bookingId)
    setError(null)

    try {
      const { error: rpcError } = await supabase.rpc('cancel_booking', { p_booking_id: bookingId })
      
      if (rpcError) throw new Error(rpcError.message)

      // Update local state
      setBookings(current => 
        current.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      )
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking.')
    } finally {
      setLoading(null)
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Plane className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No bookings found</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          You haven't booked any flights yet.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 inline-block px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors"
        >
          Search Flights
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {bookings.map(booking => {
        const isCancelled = booking.status === 'cancelled'
        const isPast = new Date(booking.flight.departs_at) < new Date()
        const canModify = !isCancelled && !isPast

        return (
          <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className={`p-4 flex items-center justify-between ${isCancelled ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">PNR</span>
                <span className="text-lg font-black tracking-widest text-slate-900 dark:text-white">{booking.pnr_code}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isCancelled ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                booking.status === 'rescheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
                'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
              }`}>
                {booking.status}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Flight</div>
                    <div className="font-semibold">{booking.flight.flight_no}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Route</div>
                    <div className="font-semibold">{booking.flight.origin} → {booking.flight.destination}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Departure</div>
                    <div className="font-semibold">{format(new Date(booking.flight.departs_at), 'MMM dd, yyyy HH:mm')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Passenger</div>
                    <div className="font-semibold">{booking.passenger[0]?.full_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Seat</div>
                    <div className="font-semibold">{booking.seat.seat_number} ({booking.seat.class})</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Price</div>
                    <div className="font-semibold">${booking.total_price}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center md:border-l border-slate-200 dark:border-slate-800 md:pl-6">
                  {canModify ? (
                    <>
                      <button
                        onClick={() => setRescheduleBooking(booking)}
                        className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-400 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={loading === booking.id}
                        className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading === booking.id ? 'Cancelling...' : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-sm text-slate-500 italic py-2">
                      {isCancelled ? 'Booking cancelled' : 'Past flight'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onSuccess={() => {
            setRescheduleBooking(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
