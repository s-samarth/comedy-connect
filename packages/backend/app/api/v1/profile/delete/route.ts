import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // 1. Admin restricted from deleting own account via this flow
        if (user.role === 'ADMIN') {
            return NextResponse.json(
                { error: 'Administrator accounts cannot be deleted via this endpoint.' },
                { status: 403 }
            )
        }

        // 2. Check for live active published shows for verified creators
        if (user.role === 'ORGANIZER_VERIFIED' || user.role === 'COMEDIAN_VERIFIED') {
            const activeShow = await prisma.show.findFirst({
                where: {
                    OR: [
                        { createdBy: user.id },
                        { 
                            showComedians: {
                                some: {
                                    comedian: {
                                        createdBy: user.id
                                    }
                                }
                            }
                        }
                    ],
                    isPublished: true,
                    date: { gte: new Date() }
                }
            })

            if (activeShow) {
                return NextResponse.json(
                    { error: "You have a live published show, you can't delete the profile." },
                    { status: 400 }
                )
            }
        }

        // 3. Perform Deletion in a Transaction
        await prisma.$transaction(async (tx) => {
            // Find shows created by the user to clean up their bookings
            const userShows = await tx.show.findMany({
                where: { createdBy: user.id },
                select: { id: true }
            })
            const showIds = userShows.map(s => s.id)

            // Delete bookings for shows created by the user
            if (showIds.length > 0) {
                await tx.booking.deleteMany({
                    where: { showId: { in: showIds } }
                })
            }

            // Delete bookings made by the user
            await tx.booking.deleteMany({
                where: { userId: user.id }
            })

            // Delete shows created by the user 
            // (cascades to TicketInventory and ShowComedian)
            await tx.show.deleteMany({
                where: { createdBy: user.id }
            })

            // Delete comedians created by the user
            // (cascades to ShowComedian associations)
            await tx.comedian.deleteMany({
                where: { createdBy: user.id }
            })

            // Delete the user record
            // (cascades to Account, Session, OrganizerProfile, ComedianProfile)
            await tx.user.delete({
                where: { id: user.id }
            })
        })

        return NextResponse.json({
            success: true,
            message: 'Account deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting account:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
