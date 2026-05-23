"use client"

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFlightStore } from '@/store/useFlightStore'
import { ArrowRight, Info, Check } from 'lucide-react'

interface Seat {
  id: string
  flight_id: string
  seat_number: string
  class: 'first' | 'business' | 'economy'
  is_available: boolean
  extra_fee: number
}

interface SeatMapClientProps {
  initialSeats: Seat[]
  flightId: string
  basePrice: number
}

export default function SeatMapClient({ initialSeats, flightId, basePrice }: SeatMapClientProps) {
  const router = useRouter()
  const [seats, setSeats] = useState<Seat[]>(initialSeats)
  const supabase = createClient()
  
  const selectedSeat = useFlightStore(state => state.selectedSeat)
  const setSelectedSeat = useFlightStore(state => state.setSelectedSeat)
  const passengerCount = useFlightStore(state => state.searchQuery?.passengerCount || 1)
  
  // Note: For simplicity if passengerCount > 1, the UI could support an array of seats.
  // The assignment says "selected seat" (singular in store) and "a visual aircraft seat map", 
  // but "passenger count" in search. I will enforce 1 seat selection for the primary user/passenger flow
  // to align with the provided `useFlightStore` which has `selectedSeat: any | null` and `passengerForm: PassengerData`.

  useEffect(() => {
    // Subscribe to realtime updates on the seats table for this specific flight
    const channel = supabase
      .channel(`seats-${flightId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flightId}`,
        },
        (payload) => {
          const updatedSeat = payload.new as Seat
          setSeats((currentSeats) =>
            currentSeats.map((seat) => (seat.id === updatedSeat.id ? updatedSeat : seat))
          )
          // If the selected seat becomes unavailable, deselect it
          if (selectedSeat && selectedSeat.id === updatedSeat.id && !updatedSeat.is_available) {
            setSelectedSeat(null)
            alert("Your selected seat is no longer available.")
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [flightId, supabase, selectedSeat, setSelectedSeat])

  const handleSeatClick = (seat: Seat) => {
    if (!seat.is_available) return
    
    if (selectedSeat?.id === seat.id) {
      setSelectedSeat(null)
    } else {
      setSelectedSeat(seat)
    }
  }

  const handleContinue = () => {
    if (!selectedSeat) return
    router.push(`/booking/details`)
  }

  // Group seats by row
  const rows = useMemo(() => {
    const rowMap = new Map<number, Seat[]>()
    seats.forEach(seat => {
      const rowNum = parseInt(seat.seat_number.replace(/\D/g, ''))
      if (!rowMap.has(rowNum)) rowMap.set(rowNum, [])
      rowMap.get(rowNum)?.push(seat)
    })
    
    // Sort columns within each row
    Array.from(rowMap.keys()).forEach(key => {
      rowMap.get(key)?.sort((a, b) => a.seat_number.localeCompare(b.seat_number))
    })
    
    return Array.from(rowMap.entries()).sort(([a], [b]) => a - b)
  }, [seats])

  const getSeatColor = (seat: Seat) => {
    if (selectedSeat?.id === seat.id) return 'bg-brand-500 border-brand-600 text-white shadow-md scale-105 z-10'
    if (!seat.is_available) return 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed'
    
    switch (seat.class) {
      case 'first': return 'bg-amber-100 border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-100 cursor-pointer'
      case 'business': return 'bg-purple-100 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/30 dark:border-purple-700 dark:hover:bg-purple-900/50 text-purple-900 dark:text-purple-100 cursor-pointer'
      case 'economy': return 'bg-white border-slate-300 hover:bg-slate-100 dark:bg-slate-800/50 dark:border-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer'
      default: return 'bg-white border-slate-300'
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Legend & Summary */}
      <div className="w-full lg:w-1/3 order-2 lg:order-1 sticky top-24 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cabin Classes</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-amber-100 border border-amber-300 dark:bg-amber-900/30 dark:border-amber-700"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">First Class</span>
              </div>
              <span className="text-xs text-slate-500">+$200</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-purple-100 border border-purple-300 dark:bg-purple-900/30 dark:border-purple-700"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Business</span>
              </div>
              <span className="text-xs text-slate-500">+$100</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-white border border-slate-300 dark:bg-slate-800/50 dark:border-slate-600"></div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Economy</span>
              </div>
              <span className="text-xs text-slate-500">Included</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-slate-200 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-slate-400 dark:bg-slate-600 rotate-45"></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Occupied</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-brand-500 border border-brand-600 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected</span>
              </div>
            </div>
          </div>
        </div>

        {selectedSeat && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-brand-200 dark:border-brand-900 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/20 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Selection Summary</h3>
            <div className="flex justify-between items-end mb-6">
              <div>
                <div className="text-4xl font-black text-brand-600 dark:text-brand-400">{selectedSeat.seat_number}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize mt-1">{selectedSeat.class} Class</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Total Price</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${(basePrice + Number(selectedSeat.extra_fee)).toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              Continue to Details
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Seat Map */}
      <div className="w-full lg:w-2/3 order-1 lg:order-2 flex justify-center overflow-x-auto pb-8">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border-[8px] border-slate-200 dark:border-slate-800 shadow-xl min-w-[320px]">
          {/* Cockpit Indicator */}
          <div className="w-full flex justify-center mb-12 relative">
            <div className="w-24 h-32 border-4 border-slate-200 dark:border-slate-800 rounded-t-full border-b-0 absolute -top-8 -translate-y-full opacity-50"></div>
            <div className="w-16 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
          </div>

          <div className="space-y-6">
            {rows.map(([rowNum, rowSeats], idx) => {
              // Add spacing between classes visually
              const prevRowClass = idx > 0 ? rows[idx - 1][1][0].class : null;
              const currentRowClass = rowSeats[0].class;
              const isClassChange = prevRowClass && prevRowClass !== currentRowClass;

              return (
                <div key={rowNum}>
                  {isClassChange && (
                    <div className="w-full h-8 flex items-center justify-center my-4">
                      <div className="w-full h-px bg-slate-200 dark:bg-slate-800"></div>
                      <div className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 absolute">
                        {currentRowClass} Class
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-6">
                    {/* Left seats (A, B) */}
                    <div className="flex gap-2">
                      {rowSeats.slice(0, 2).map((seat) => (
                        <SeatButton key={seat.id} seat={seat} onClick={() => handleSeatClick(seat)} getSeatColor={getSeatColor} />
                      ))}
                    </div>

                    {/* Aisle (Row Number) */}
                    <div className="w-8 text-center text-sm font-bold text-slate-400 dark:text-slate-500 select-none">
                      {rowNum}
                    </div>

                    {/* Right seats (C, D) */}
                    <div className="flex gap-2">
                      {rowSeats.slice(2, 4).map((seat) => (
                        <SeatButton key={seat.id} seat={seat} onClick={() => handleSeatClick(seat)} getSeatColor={getSeatColor} />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function SeatButton({ seat, onClick, getSeatColor }: { seat: Seat, onClick: () => void, getSeatColor: (seat: Seat) => string }) {
  const colorClass = getSeatColor(seat)
  
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        disabled={!seat.is_available}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-t-xl rounded-b-md border-2 flex items-center justify-center transition-all duration-200 ${colorClass}`}
        aria-label={`Seat ${seat.seat_number}`}
      >
        <span className="text-xs font-semibold opacity-60">{seat.seat_number.replace(/\d/g, '')}</span>
      </button>

      {/* Tooltip */}
      {seat.is_available && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none shadow-lg">
          <div className="font-bold">{seat.seat_number} • <span className="capitalize">{seat.class}</span></div>
          {Number(seat.extra_fee) > 0 && <div className="text-emerald-400">+${seat.extra_fee} fee</div>}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  )
}
