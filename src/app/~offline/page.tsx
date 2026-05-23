import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <WifiOff className="w-12 h-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">You're offline</h1>
        <p className="text-slate-500 dark:text-slate-400">
          It looks like you've lost your internet connection. 
          Your downloaded tickets and bookings are still available.
        </p>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/my-bookings"
            className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors"
          >
            View My Bookings
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
