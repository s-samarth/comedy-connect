// Booking Types
export interface CreateBookingRequest {
    showId: string
    quantity: number
}

export interface BookingResponse {
    id: string
    show: {
        id: string
        title: string
        date: string
        venue: string
        ticketPrice: number
    }
    quantity: number
    totalAmount: number
    platformFee: number
    bookingFee: number
    status: 'PENDING' | 'CONFIRMED' | 'CONFIRMED_UNPAID' | 'CANCELLED' | 'FAILED'
}
