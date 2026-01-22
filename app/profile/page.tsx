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
        }
      }
    })
    return user
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
      {/* Simple Header */}
      <header className="bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-semibold text-zinc-900 dark:text-white">
              Comedy Connect
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link href="/shows" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                Shows
              </Link>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user.email}
                </span>
                <Link href="/profile" className="text-zinc-900 dark:text-white font-medium">
                  Profile
                </Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    Admin
                  </Link>
                )}
                {user.role.startsWith("ORGANIZER") && (
                  <Link href="/organizer" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    Organizer
                  </Link>
                )}
                <form action="/api/auth/signout" method="POST">
                  <button type="submit" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    Sign Out
                  </button>
                </form>
              </div>
            </nav>
          </div>
        </div>
      </header>

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
