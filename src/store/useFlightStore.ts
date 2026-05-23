import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SearchQuery {
  origin: string
  destination: string
  date: string
  passengerCount: number
}

export interface PassengerData {
  fullName: string
  passportNo: string
  nationality: string
  dob: string
}

interface FlightState {
  searchQuery: SearchQuery | null
  selectedFlight: any | null
  selectedSeat: any | null
  currentStep: number // 1: search, 2: seat selection, 3: details, 4: confirmation
  passengerForm: PassengerData
  setSearchQuery: (query: SearchQuery) => void
  setSelectedFlight: (flight: any | null) => void
  setSelectedSeat: (seat: any | null) => void
  setCurrentStep: (step: number) => void
  setPassengerForm: (data: Partial<PassengerData>) => void
  reset: () => void
}

const initialPassengerForm: PassengerData = {
  fullName: '',
  passportNo: '',
  nationality: '',
  dob: '',
}

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      searchQuery: null,
      selectedFlight: null,
      selectedSeat: null,
      currentStep: 1,
      passengerForm: initialPassengerForm,
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setPassengerForm: (data) =>
        set((state) => ({
          passengerForm: { ...state.passengerForm, ...data },
        })),
      reset: () =>
        set({
          searchQuery: null,
          selectedFlight: null,
          selectedSeat: null,
          currentStep: 1,
          passengerForm: initialPassengerForm,
        }),
    }),
    {
      name: 'flight-storage',
      partialize: (state) => {
        const { passportNo, ...restPassengerForm } = state.passengerForm
        return {
          searchQuery: state.searchQuery,
          selectedFlight: state.selectedFlight,
          selectedSeat: state.selectedSeat,
          currentStep: state.currentStep,
          passengerForm: {
            ...restPassengerForm,
            passportNo: '', // exclude passport number from persistence
          },
        }
      },
    }
  )
)
