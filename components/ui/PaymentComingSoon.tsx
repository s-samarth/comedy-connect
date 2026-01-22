"use client"

import { useState } from "react"

interface PaymentComingSoonProps {
  showTitle: string
  ticketPrice: number
  quantity: number
  totalAmount: number
}

export default function PaymentComingSoon({ 
  showTitle, 
  ticketPrice, 
  quantity, 
  totalAmount 
}: PaymentComingSoonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Proceed to Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Payments Coming Soon!
                </h3>
                <p className="text-gray-600 mb-6">
                  We're working hard to bring you secure online payments. For now, please contact us directly to book tickets for "{showTitle}".
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Show:</span>
                    <span className="font-medium">{showTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket Price:</span>
                    <span className="font-medium">₹{ticketPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-blue-600">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">How to Book Now:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>📞 Call us at +91-XXXXXXXXXX</li>
                  <li>📧 Email us at bookings@comedyconnect.com</li>
                  <li>💬 WhatsApp us at +91-XXXXXXXXXX</li>
                </ul>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
