interface UserBookingsProps {
  bookings: Array<{
    id: string
    createdAt: Date
    show: {
      id: string
      title: string
      date: Date
      venue: string
      ticketPrice: number
    }
  }>
}

export default function UserBookings({ bookings }: UserBookingsProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const getStatusBadge = (showDate: Date) => {
    const now = new Date()
    const showDateTime = new Date(showDate)
    
    if (showDateTime < now) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Past Event</span>
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Upcoming</span>
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
          <p className="text-gray-500 mb-4">
            You haven't booked any comedy shows yet. Start exploring and book your first show!
          </p>
          <a
            href="/shows"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Shows
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Booking History</h3>
        <p className="text-sm text-gray-500">Your recent comedy show bookings</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{booking.show.title}</h4>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(booking.show.date)}
                      </div>
                      <div className="flex items-center">
                        <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {booking.show.venue}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(booking.show.date)}
                    <span className="text-sm text-gray-500">
                      Booked on {formatDate(booking.createdAt)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(booking.show.ticketPrice)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {bookings.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <a
            href="/shows"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Book More Shows →
          </a>
        </div>
      )}
    </div>
  )
}
