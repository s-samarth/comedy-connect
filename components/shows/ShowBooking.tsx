"use client"

import { useState } from "react"
import PaymentComingSoon from "@/components/ui/PaymentComingSoon"

interface Show {
  id: string
  title: string
  date: Date | string
  venue: string
  ticketPrice: number
  totalTickets: number
  ticketInventory: Array<{
    id: string
    createdAt: Date
    updatedAt: Date
    showId: string
    available: number
    locked: number
  }>
  creator: {
    id: string
    name: string | null
    email: string
  }
  showComedians: any[]
}

interface ShowBookingProps {
  show: Show
}

export default function ShowBooking({ show }: ShowBookingProps) {
  const [quantity, setQuantity] = useState(1)
  const totalAmount = show.ticketPrice * quantity

  const isSoldOut = (show.ticketInventory[0]?.available || 0) === 0
  const isPastShow = new Date(show.date) <= new Date()
  const maxQuantity = Math.min(show.ticketInventory[0]?.available || 0, 10)

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
          <p className="text-red-800 text-sm">This show is sold out</p>
        </div>
      )}

      {!isSoldOut && !isPastShow && (
        <>
          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tickets
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Ticket' : 'Tickets'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {(show.ticketInventory[0]?.available || 0)} tickets available
            </p>
          </div>

          {/* Total Amount */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="text-2xl font-bold text-gray-900">₹{totalAmount}</span>
            </div>
          </div>

          {/* Payment Button */}
          <PaymentComingSoon
            showTitle={show.title}
            ticketPrice={show.ticketPrice}
            quantity={quantity}
            totalAmount={totalAmount}
          />

          {/* Additional Info */}
          <div className="mt-4 text-xs text-gray-500">
            <p>• Maximum 10 tickets per person</p>
            <p>• Booking closes 1 hour before show time</p>
            <p>• All sales are final</p>
          </div>
        </>
      )}
    </div>
  )
}
