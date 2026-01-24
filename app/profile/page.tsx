import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileCard from "@/components/profile/ProfileCard"
import UserBookings from "@/components/profile/UserBookings"
import Link from "next/link"

async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          }
        },
        organizerProfile: true,
        comedianProfile: true,
        bookings: {
          include: {
            show: {
              select: {
                id: true,
                title: true,
                date: true,
                venue: true,
                ticketPrice: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        } as any
      } as any
    })
    return user as any
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user?.id) {
    redirect("/auth/signin")
  }

  const userProfile = await getUserProfile(user.id)

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">My Profile</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">Manage your account and view your booking history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <ProfileCard user={userProfile} />
          </div>

          {/* User Bookings */}
          <div className="lg:col-span-2">
            <UserBookings bookings={userProfile.bookings || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
