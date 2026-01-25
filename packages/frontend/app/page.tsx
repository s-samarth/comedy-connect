import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import ShowDiscovery from "@/components/shows/ShowDiscovery"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
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

          {user && (
            <Link
              href="/onboarding/role-selection"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl mb-8"
            >
              🎭 List a Show
            </Link>
          )}

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-blue-800 text-sm">
                <span className="font-medium">New here?</span> You can browse shows as a guest, or sign in to book tickets and manage your bookings.
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
