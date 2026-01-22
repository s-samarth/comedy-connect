import { getCurrentUser } from "@/lib/auth"
import ShowDiscovery from "@/components/shows/ShowDiscovery"
import Link from "next/link"

export default async function ShowsPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Comedy Shows in Hyderabad</h1>
            <p className="text-lg text-zinc-600">
              Discover and book tickets for live comedy events
            </p>
          </div>
          
          <div className="flex gap-4">
            {user ? (
              <>
                <Link 
                  href="/organizer/shows"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  List a Show
                </Link>
                <Link 
                  href="/"
                  className="text-zinc-600 hover:text-zinc-900"
                >
                  Home
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Sign In to List Show
                </Link>
                <Link 
                  href="/"
                  className="text-zinc-600 hover:text-zinc-900"
                >
                  Home
                </Link>
              </>
            )}
          </div>
        </div>

        <ShowDiscovery user={user} />
      </div>
    </div>
  )
}
