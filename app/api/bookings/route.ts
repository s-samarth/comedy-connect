import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createRazorpayOrder } from "@/lib/razorpay"
import { NextResponse } from "next/server"
import { BookingStatus } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { showId, quantity } = await request.json()

    // Validation
    if (!showId || !quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: "Show ID and quantity are required" 
      }, { status: 400 })
    }

    // Get show details
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        ticketInventory: true,
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!show) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    // Check if show is in the future
    if (new Date(show.date) <= new Date()) {
      return NextResponse.json({ 
        error: "Cannot book past shows" 
      }, { status: 400 })
    }

    // Check available tickets
    if (show.ticketInventory.available < quantity) {
      return NextResponse.json({ 
        error: "Not enough tickets available" 
      }, { status: 400 })
    }

    // Calculate total amount
    const totalAmount = show.ticketPrice * quantity

    // Create Razorpay order
    const order = await createRazorpayOrder(
      totalAmount,
      showId,
      user.id,
      quantity
    )

    // Create pending booking
    const booking = await prisma.booking.create({
      data: {
        showId,
        userId: user.id,
        quantity,
        totalAmount,
        platformFee: totalAmount * 0.08, // Will be updated after payment
        status: BookingStatus.PENDING,
        paymentId: order.id
      }
    })

    // Lock tickets (reduce available count)
    await prisma.ticketInventory.update({
      where: { showId },
      data: {
        available: show.ticketInventory.available - quantity,
        locked: show.ticketInventory.locked + quantity
      }
    })

    return NextResponse.json({
      booking: {
        id: booking.id,
        show: {
          id: show.id,
          title: show.title,
          date: show.date,
          venue: show.venue
        },
        quantity,
        totalAmount,
        razorpayOrder: order
      }
    })
  } catch (error) {
    console.error('Booking creation failed:', error)
    return NextResponse.json({ 
      error: "Failed to create booking" 
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const showId = searchParams.get('showId')

    if (!showId) {
      return NextResponse.json({ error: "Show ID required" }, { status: 400 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        showId
      },
      include: {
        show: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to fetch bookings" 
    }, { status: 500 })
  }
}
