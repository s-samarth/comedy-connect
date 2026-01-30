import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { bookingService } from "@/services/bookings/booking.service"
import { mapErrorToResponse } from "@/errors"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Call service
        const booking = await bookingService.getBookingById(id, user.id)

        return NextResponse.json({ booking })
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
