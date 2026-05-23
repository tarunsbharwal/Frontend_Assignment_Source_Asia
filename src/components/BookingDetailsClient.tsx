"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/useFlightStore'
import { useUserStore } from '@/store/useUserStore'
import { User, CreditCard, ShieldCheck, PlaneLanding } from 'lucide-react'

// Helper to generate a 6-character PNR code
function generatePNR() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let pnr = ''
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pnr
}

export default function BookingDetailsClient() {
  const router = useRouter()
  const supabase = createClient()
  
  const selectedFlight = useFlightStore(state => state.selectedFlight)
  const selectedSeat = useFlightStore(state => state.selectedSeat)
  const passengerForm = useFlightStore(state => state.passengerForm)
  const setPassengerForm = useFlightStore(state => state.setPassengerForm)
  const setCurrentStep = useFlightStore(state => state.setCurrentStep)
  const resetStore = useFlightStore(state => state.reset)
  
  const session = useUserStore(state => state.session)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If they came here without selecting a flight and seat, redirect back
    if (!selectedFlight || !selectedSeat) {
      router.push('/')
    } else {
      setCurrentStep(3)
    }
  }, [selectedFlight, selectedSeat, router, setCurrentStep])

  if (!selectedFlight || !selectedSeat) return null

  const totalPrice = Number(selectedFlight.base_price) + Number(selectedSeat.extra_fee)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      // Must be logged in to book
      router.push('/auth/login?redirect=/booking/details')
      return
    }

    setLoading(true)
    setError(null)

    const pnrCode = generatePNR()

    try {
      // Call the RPC function to book atomically
      const { data: bookingId, error: rpcError } = await supabase.rpc('book_flight_seat', {
        p_flight_id: selectedFlight.id,
        p_seat_id: selectedSeat.id,
        p_total_price: totalPrice,
        p_pnr_code: pnrCode
      })

      if (rpcError) throw new Error(rpcError.message)

      // Insert passenger details
      const { error: passengerError } = await supabase
        .from('passengers')
        .insert({
          booking_id: bookingId,
          full_name: passengerForm.fullName,
          passport_no: passengerForm.passportNo,
          nationality: passengerForm.nationality,
          dob: passengerForm.dob
        })

      if (passengerError) throw new Error(passengerError.message)

      // Success
      setCurrentStep(4)
      router.push(`/booking/confirmation/${pnrCode}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred during booking. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name (as on Passport)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors dark:text-white"
                value={passengerForm.fullName}
                onChange={(e) => setPassengerForm({ fullName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Passport Number</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors dark:text-white"
                value={passengerForm.passportNo}
                onChange={(e) => setPassengerForm({ passportNo: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nationality</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors dark:text-white"
                value={passengerForm.nationality}
                onChange={(e) => setPassengerForm({ nationality: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors dark:text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                value={passengerForm.dob}
                onChange={(e) => setPassengerForm({ dob: e.target.value })}
              />
            </div>
          </div>

          {!session && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
              <User className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You need to sign in to complete this booking. You will be prompted to login when you confirm.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Processing...' : 'Confirm & Pay'}
              {!loading && <ShieldCheck className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PlaneLanding className="w-32 h-32" />
          </div>
          
          <h3 className="text-lg font-bold mb-6 relative z-10">Booking Summary</h3>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-slate-400">Flight</span>
              <span className="font-semibold">{selectedFlight.flight_no}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-slate-400">Route</span>
              <span className="font-semibold">{selectedFlight.origin} → {selectedFlight.destination}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-slate-400">Seat</span>
              <span className="font-semibold">{selectedSeat.seat_number} ({selectedSeat.class})</span>
            </div>
            
            <div className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Base Price</span>
                <span>${selectedFlight.base_price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Seat Selection</span>
                <span>${selectedSeat.extra_fee}</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black text-brand-400">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
