import BookingDetailsClient from '@/components/BookingDetailsClient'

export default function BookingDetailsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Passenger Details</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Please enter the details for all passengers.
        </p>
      </div>

      <BookingDetailsClient />
    </div>
  )
}
