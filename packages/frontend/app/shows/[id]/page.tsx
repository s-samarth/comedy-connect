import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { cookies } from "next/headers"
import ShowDetail from "@/components/shows/ShowDetail"

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ShowPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  const show = await prisma.show.findUnique({
    where: { id },
    include: {
      ticketInventory: true,
      showComedians: {
        include: {
          comedian: true
        }
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  })

  if (!show) {
    notFound()
  }

  // Fetch bookings for stats if user is admin or creator
  // Check for admin status via session OR explicitly via admin cookie for robust admin identification
  const cookieStore = await cookies()
  const hasAdminCookie = cookieStore.get('admin-secure-session')
  const isAdmin = user?.role === 'ADMIN' || !!hasAdminCookie
  const isCreator = user?.id === show.createdBy

  let stats = null
  if (isAdmin || isCreator) {
    const bookings = await prisma.booking.findMany({
      where: {
        showId: id,
        status: { in: ['CONFIRMED', 'CONFIRMED_UNPAID'] }
      }
    })

    const ticketsSold = bookings.reduce((sum, b) => sum + b.quantity, 0)
    const revenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0)

    stats = {
      ticketsSold,
      revenue,
      count: bookings.length
    }
  }

  return (
    <ShowDetail
      show={show}
      stats={stats}
      user={user}
      isAdmin={isAdmin}
    />
  )
}
