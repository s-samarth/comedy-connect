import { getCurrentUser } from "@/lib/auth"
import ShowDiscovery from "@/components/shows/ShowDiscovery"
import Link from "next/link"

export default async function ShowsPage() {
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
              <Link href="/shows" className="text-zinc-900 dark:text-white font-medium">
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              All Comedy Shows
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Browse upcoming comedy shows in Hyderabad
            </p>
          </div>
          
          {user && user.role.startsWith("ORGANIZER") && (
            <Link 
              href="/organizer/shows"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              List a Show
            </Link>
          )}
        </div>
        
        <ShowDiscovery user={user} />
      </main>
    </div>
  )
}
