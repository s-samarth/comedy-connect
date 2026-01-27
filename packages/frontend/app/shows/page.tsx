import { getCurrentUser } from "@/lib/auth"
import ShowDiscovery from "@/components/shows/ShowDiscovery"
import Link from "next/link"

export default async function ShowsPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              All Comedy Shows
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Browse upcoming comedy shows in Hyderabad
            </p>
          </div>

          {user && (
            <Link
              href="/onboarding/role-selection"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
            >
              🎭 List a Show
            </Link>
          )}
        </div>

        <ShowDiscovery user={user} />
      </main>
    </div>
  )
}
