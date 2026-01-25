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
      // Get show with ticket inventory and creator profiles
      const show = await tx.show.findUnique({
        where: { id: showId },
        include: {
          ticketInventory: true,
          showComedians: true,
          creator: {
            include: {
              organizerProfile: true,
              comedianProfile: true
            }
          }
        }
      })

      if (!show) {
        throw new Error("Show not found")
      }

      // Check if show is in the future
      if (new Date(show.date) <= new Date()) {
        throw new Error("Cannot book past shows")
      }

      // Check available tickets
      const inventory = (show as any).ticketInventory
      const available = Array.isArray(inventory) ? inventory[0]?.available : inventory?.available

      if (!available || available < quantity) {
        throw new Error("Not enough tickets available")
      }

      // Calculate total amount
      const totalAmount = show.ticketPrice * quantity

      // 1. Calculate platformFee (Commission - taken from payout)
      // Hierarchy: Show override > Creator override > 8% default
      let commPercentage = 0.08
      if ((show as any).customPlatformFee !== null && (show as any).customPlatformFee !== undefined) {
        commPercentage = (show as any).customPlatformFee / 100
      } else {
        const creator = (show as any).creator
        const userFee = creator.organizerProfile?.customPlatformFee ?? creator.comedianProfile?.customPlatformFee
        if (userFee !== null && userFee !== undefined) {
          commPercentage = userFee / 100
        }
      }
      const platformFee = totalAmount * commPercentage

      // 2. Calculate bookingFee (Convenience Fee - added on top)
      // Fetch slabs from config
      const slabsConfig = await tx.platformConfig.findUnique({
        where: { key: 'booking_fee_slabs' }
      })
      const slabs = (slabsConfig?.value as any[]) || [
        { minPrice: 0, maxPrice: 199, fee: 7 },
        { minPrice: 200, maxPrice: 400, fee: 8 },
        { minPrice: 401, maxPrice: 1000000, fee: 9 }
      ]

      const matchedSlab = slabs.find(s => show.ticketPrice >= s.minPrice && show.ticketPrice <= s.maxPrice)
      const bookingFeePercentage = (matchedSlab ? matchedSlab.fee : 8) / 100
      const bookingFee = totalAmount * bookingFeePercentage

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

      // Create confirmed booking
      const booking = await (tx as any).booking.create({
        data: {
          showId,
          userId: user.id,
          quantity,
          totalAmount,
          platformFee,
          bookingFee,
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
        id: (result as any).id,
        show: (result as any).show,
        quantity: (result as any).quantity,
        totalAmount: (result as any).totalAmount,
        bookingFee: (result as any).bookingFee,
        platformFee: (result as any).platformFee,
        status: (result as any).status
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
