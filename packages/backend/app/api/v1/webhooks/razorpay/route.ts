import { NextResponse } from "next/server"
import { verifyRazorpayPayment } from "@/lib/razorpay"
import { bookingService } from "@/services/bookings/booking.service"
import { mapErrorToResponse } from "@/errors"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature
    const isValid = await verifyRazorpayPayment(
      JSON.parse(body).payload.payment.order_id,
      JSON.parse(body).payload.payment.entity.id,
      signature
    )

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body).event

    if (event === 'payment.captured') {
      const payment = event.payload.payment.entity

      try {
        await bookingService.processPaymentSuccess(payment.order_id, payment.id)
        console.log(`Payment confirmed for order ${payment.order_id}`)
      } catch (e: any) {
        if (e.code === 'NOT_FOUND') {
          console.error('Booking not found for payment:', payment.order_id)
          return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }
        throw e
      }

    } else if (event === 'payment.failed') {
      const payment = event.payload.payment.entity
      await bookingService.processPaymentFailure(payment.order_id)
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error('Webhook processing failed:', error)
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
