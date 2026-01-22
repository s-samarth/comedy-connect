import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyRazorpayPayment } from "@/lib/razorpay"
import { BookingStatus } from "@prisma/client"

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

      // Find the pending booking
      const booking = await prisma.booking.findFirst({
        where: {
          paymentId: payment.order_id,
          status: BookingStatus.PENDING
        }
      })

      if (!booking) {
        console.error('Booking not found for payment:', payment.order_id)
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      // Get show details
      const show = await prisma.show.findUnique({
        where: { id: booking.showId },
        include: { ticketInventory: true }
      })

      if (!show) {
        return NextResponse.json({ error: "Show not found" }, { status: 404 })
      }

      // Calculate platform fee
      const platformFee = booking.totalAmount * 0.08 // 8% for > ₹400

      // Update booking status
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentId: payment.id,
          platformFee
        }
      })

      // Update ticket inventory
      await prisma.ticketInventory.update({
        where: { showId: booking.showId },
        data: {
          available: show.ticketInventory.available - booking.quantity,
          locked: show.ticketInventory.locked - booking.quantity
        }
      })

      console.log(`Payment confirmed for booking ${booking.id}`)
    } else if (event === 'payment.failed') {
      // Handle failed payment
      const payment = event.payload.payment.entity

      const booking = await prisma.booking.findFirst({
        where: {
          paymentId: payment.order_id,
          status: BookingStatus.PENDING
        }
      })

      if (booking) {
        // Update booking status
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.FAILED
          }
        })

        // Release locked tickets
        const show = await prisma.show.findUnique({
          where: { id: booking.showId },
          include: { ticketInventory: true }
        })

        if (show) {
          await prisma.ticketInventory.update({
            where: { showId: booking.showId },
            data: {
              available: show.ticketInventory.available + booking.quantity,
              locked: show.ticketInventory.locked - booking.quantity
            }
          })
        }
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error('Webhook processing failed:', error)
    return NextResponse.json({ 
      error: "Webhook processing failed" 
    }, { status: 500 })
  }
}
