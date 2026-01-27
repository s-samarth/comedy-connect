"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Show {
  id: string
  title: string
  date: Date | string
  venue: string
  ticketPrice: number
  totalTickets: number
  ticketInventory: {
    id: string
    createdAt: Date
    updatedAt: Date
    showId: string
    available: number
    locked: number
  } | null
  creator: {
    id: string
    name: string | null
    email: string
  }
  showComedians: any[]
}

interface ShowBookingProps {
  show: Show
  user: any
}

export default function ShowBooking({ show, user }: ShowBookingProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const totalAmount = show.ticketPrice * quantity

  const isSoldOut = (show.ticketInventory?.available || 0) === 0
  const isPastShow = new Date(show.date) <= new Date()
  const hasNoComedians = !show.showComedians || show.showComedians.length === 0
  const maxQuantity = Math.min(show.ticketInventory?.available || 0, 10)
  const isBookable = !isSoldOut && !isPastShow

  const handleBooking = async () => {
    if (!user) {
      // Redirect to sign in with callbackUrl to this page
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          showId: show.id,
          quantity
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed')
      }

      // Redirect to success page
      router.push(`/shows/${show.id}/success?bookingId=${data.booking.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
      <h3 className="text-xl font-semibold mb-4">Book Tickets</h3>

      {/* Price Display */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-blue-600">₹{show.ticketPrice}</div>
        <div className="text-sm text-gray-600">per ticket</div>
      </div>

      {/* Status Messages */}
      {isPastShow && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">This show has already ended</p>
        </div>
      )}

      {isSoldOut && !isPastShow && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-semibold">🎫 Sold Out</p>
          <p className="text-red-700 text-xs mt-1">All tickets have been booked for this show</p>
        </div>
      )}



      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isBookable && (
        <>
          {user ? (
            <>
              {/* Quantity Selector - Only for Logged In Users */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Ticket' : 'Tickets'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {(show.ticketInventory?.available || 0)} tickets available
                </p>
              </div>

              {/* Total Amount - Only for Logged In Users */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Subtotal ({quantity} tickets):</span>
                  <span>₹{show.ticketPrice * quantity}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Booking Fee (8%):</span>
                  <span>₹{(show.ticketPrice * quantity * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{(show.ticketPrice * quantity * 1.08).toFixed(2)}</span>
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={handleBooking}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </>
          ) : (
            /* Guest View */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  <span className="font-semibold">Login Required</span>
                </p>
                <p className="text-sm text-blue-700">
                  Please sign in to book tickets for this show.
                </p>
              </div>

              <button
                onClick={handleBooking}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In to Book
              </button>
            </div>
          )}

        </>
      )}
    </div>
  )
}
