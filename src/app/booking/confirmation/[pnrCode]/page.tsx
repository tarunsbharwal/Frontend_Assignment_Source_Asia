import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CheckCircle, Calendar, MapPin, Plane, User } from 'lucide-react'
import { format } from 'date-fns'
import ResetStoreClient from '@/components/ResetStoreClient'

export default async function BookingConfirmationPage({
  params
}: {
  params: Promise<{ pnrCode: string }>
}) {
  const supabase = await createClient()
  const { pnrCode } = await params

  // Fetch booking details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      flight:flights(*),
      seat:seats(*),
      passenger:passengers(*)
    `)
    .eq('pnr_code', pnrCode)
    .single()

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Booking not found</h1>
        <Link href="/" className="text-brand-600 hover:underline">Return Home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <ResetStoreClient />
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Booking Confirmed!</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Your flight has been successfully booked. Have a great trip!
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-brand-600 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Plane className="w-48 h-48 -rotate-45" />
          </div>
          
          <div className="relative z-10 text-center sm:text-left">
            <div className="text-brand-100 text-sm font-semibold uppercase tracking-wider mb-1">PNR Code</div>
            <div className="text-4xl md:text-5xl font-black tracking-widest">{booking.pnr_code}</div>
          </div>
          <div className="relative z-10 text-center sm:text-right">
            <div className="text-brand-100 text-sm font-semibold uppercase tracking-wider mb-1">Status</div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-500/50 backdrop-blur-sm border border-brand-400/30 text-sm font-bold uppercase tracking-wider">
              {booking.status}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" /> Flight Details
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-3 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Flight No</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{booking.flight.flight_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Route</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{booking.flight.origin} → {booking.flight.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Departure</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{format(new Date(booking.flight.departs_at), 'MMM dd, HH:mm')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-brand-500" /> Passenger & Seat
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-3 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{booking.passenger[0]?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seat</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{booking.seat.seat_number} ({booking.seat.class})</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Total Price</span>
                  <span className="text-xl font-bold text-brand-600 dark:text-brand-400">${booking.total_price}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <Link
              href="/my-bookings"
              className="inline-block px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
