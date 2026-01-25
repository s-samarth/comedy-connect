import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const user = await requireAdmin()

    // Get current database stats
    const userCount = await prisma.user.count()
    const showCount = await prisma.show.count()
    const comedianCount = await prisma.comedian.count()
    const bookingCount = await prisma.booking.count()
    const organizerCount = await prisma.organizerProfile.count()

    // Delete in order of dependencies to avoid foreign key constraints
    await prisma.booking.deleteMany({})
    await prisma.ticketInventory.deleteMany({})
    await prisma.showComedian.deleteMany({})
    await prisma.show.deleteMany({})
    await prisma.comedian.deleteMany({})
    await prisma.organizerApproval.deleteMany({})
    await prisma.organizerProfile.deleteMany({})
    await prisma.session.deleteMany({})
    await prisma.account.deleteMany({})

    // Delete all users except admins
    const deleteResult = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    })

    // Get final stats
    const remainingUsers = await prisma.user.count()

    return NextResponse.json({
      message: `Database cleanup completed successfully! Deleted ${deleteResult.count} users, ${showCount} shows, ${comedianCount} comedians, ${bookingCount} bookings, and ${organizerCount} organizers. ${remainingUsers} admin users preserved.`,
      stats: {
        deletedUsers: deleteResult.count,
        deletedShows: showCount,
        deletedComedians: comedianCount,
        deletedBookings: bookingCount,
        deletedOrganizers: organizerCount,
        remainingAdmins: remainingUsers
      }
    })

  } catch (error) {
    console.error('Database cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup database: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
