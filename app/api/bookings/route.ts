import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

    if (quantity > 10) {
      return NextResponse.json({
        error: "Maximum 10 tickets per booking"
      }, { status: 400 })
    }

    // Use transaction to ensure atomic inventory update
    const result = await prisma.$transaction(async (tx) => {
      // Get show with ticket inventory using pessimistic locking
      const show = await tx.show.findUnique({
        where: { id: showId },
        include: {
          ticketInventory: true,
          showComedians: true
        }
      })

      if (!show) {
        throw new Error("Show not found")
      }

      // Check if show has comedians
      if (show.showComedians.length === 0) {
        throw new Error("This show is not yet available for booking")
      }

      // Check if show is in the future
      if (new Date(show.date) <= new Date()) {
        throw new Error("Cannot book past shows")
      }

      // Check available tickets - handled as potentially single or array from types
      const inventory = (show as any).ticketInventory
      const available = Array.isArray(inventory) ? inventory[0]?.available : inventory?.available

      if (!available || available < quantity) {
        throw new Error("Not enough tickets available")
      }

      // Check for existing pending/confirmed booking from same user for this show
      const existingBooking = await tx.booking.findFirst({
        where: {
          userId: user.id,
          showId,
          status: {
            in: [BookingStatus.CONFIRMED_UNPAID, BookingStatus.CONFIRMED, BookingStatus.PENDING]
          }
        }
      })

      if (existingBooking) {
        throw new Error("You already have a booking for this show")
      }

      // Calculate total amount
      const totalAmount = show.ticketPrice * quantity
      const platformFee = totalAmount * 0.08

      // Atomically update inventory
      const updatedInventory = await tx.ticketInventory.update({
        where: {
          showId,
          available: { gte: quantity } // Optimistic concurrency check
        },
        data: {
          available: { decrement: quantity }
        }
      })

      if (!updatedInventory) {
        throw new Error("Failed to reserve tickets - please try again")
      }

      // Create confirmed booking (without payment)
      const booking = await tx.booking.create({
        data: {
          showId,
          userId: user.id,
          quantity,
          totalAmount,
          platformFee,
          status: BookingStatus.CONFIRMED_UNPAID
        },
        include: {
          show: {
            select: {
              id: true,
              title: true,
              date: true,
              venue: true,
              ticketPrice: true
            }
          }
        }
      })

      return booking
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: result.id,
        show: result.show,
        quantity: result.quantity,
        totalAmount: result.totalAmount,
        status: result.status
      }
    })
  } catch (error) {
    console.error('Booking creation failed:', error)
    const message = error instanceof Error ? error.message : "Failed to create booking"
    return NextResponse.json({
      error: message
    }, { status: 400 })
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

    // If showId is provided, filter by showId; otherwise return all user bookings
    const whereClause = showId
      ? { userId: user.id, showId }
      : { userId: user.id }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        show: {
          select: {
            id: true,
            title: true,
            date: true,
            venue: true,
            ticketPrice: true,
            posterImageUrl: true
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
