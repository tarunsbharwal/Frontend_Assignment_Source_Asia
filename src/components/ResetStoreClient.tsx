"use client"

import { useEffect } from 'react'
import { useFlightStore } from '@/store/useFlightStore'

export default function ResetStoreClient() {
  const reset = useFlightStore(state => state.reset)
  
  useEffect(() => {
    // Reset the store when the confirmation page mounts
    reset()
  }, [reset])
  
  return null
}
