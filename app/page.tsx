import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import ShowDiscovery from "@/components/shows/ShowDiscovery"

export default async function Home() {
  const user = await getCurrentUser()

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

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {user.email}
                  </span>
                  <Link href="/profile" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    Profile
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link href="/admin-secure/login" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
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
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/signin" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    Sign In
                  </Link>
                  <Link href="/auth/signin?signup=true" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Discover Live Comedy in Hyderabad
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Find and book tickets for the best comedy shows in the city
          </p>

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-blue-800 text-sm">
                <span className="font-medium">New here?</span> You can browse shows as a guest, or sign up to book tickets and manage your bookings.
              </p>
            </div>
          )}
        </section>

        {/* Shows Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Upcoming Shows
            </h2>
            <Link
              href="/shows"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Shows →
            </Link>
          </div>

          <ShowDiscovery user={user} />
        </section>
      </main>
    </div>
  )
}
