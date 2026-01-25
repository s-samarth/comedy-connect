import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { bookingService } from "@/services/bookings/booking.service"
import { mapErrorToResponse } from "@/errors"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { showId, quantity } = await request.json()

    // Call service
    const booking = await bookingService.createBooking(user.id, showId, quantity)

    return NextResponse.json({
      success: true,
      booking: {
        id: (booking as any).id,
        show: (booking as any).show,
        quantity: (booking as any).quantity,
        totalAmount: (booking as any).totalAmount,
        bookingFee: (booking as any).bookingFee,
        platformFee: (booking as any).platformFee,
        status: (booking as any).status
      }
    })
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const showId = searchParams.get('showId') || undefined

    const bookings = await bookingService.getUserBookings(user.id, showId)

    return NextResponse.json({ bookings })
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
