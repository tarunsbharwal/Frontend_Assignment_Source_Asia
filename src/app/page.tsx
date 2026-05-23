"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlaneTakeoff, PlaneLanding, Calendar, Users, Search } from 'lucide-react'
import { useFlightStore } from '@/store/useFlightStore'

export default function Home() {
  const router = useRouter()
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery)
  
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery({ origin, destination, date, passengerCount })
    router.push(`/flights?origin=${origin}&destination=${destination}&date=${date}`)
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0">
        {/* High-quality background image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-105"></div>
        
        {/* Elegant gradient overlays for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80"></div>
        <div className="absolute inset-0 bg-brand-900/20 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
            Where to next?
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
            Experience premium flight bookings with real-time seat selection and effortless rescheduling.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Origin */}
            <div className="lg:col-span-1 flex flex-col space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1">From</label>
              <div className="relative">
                <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  required
                  placeholder="City or Airport" 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-400 rounded-xl py-3 pl-10 pr-4 transition-all outline-none uppercase"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="lg:col-span-1 flex flex-col space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1">To</label>
              <div className="relative">
                <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  required
                  placeholder="City or Airport" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-400 rounded-xl py-3 pl-10 pr-4 transition-all outline-none uppercase"
                />
              </div>
            </div>

            {/* Date */}
            <div className="lg:col-span-1 flex flex-col space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1">Departure</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-400 rounded-xl py-3 pl-10 pr-4 transition-all outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="lg:col-span-1 flex flex-col space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 ml-1">Passengers</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="number" 
                  min="1"
                  max="9"
                  required
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-slate-400 rounded-xl py-3 pl-10 pr-4 transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="lg:col-span-1 flex items-end">
              <button 
                type="submit"
                className="w-full h-[50px] bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  )
}
