import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Comedy Connect
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Discover and book tickets for live comedy shows in Hyderabad.
          </p>
          
          {user ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-zinc-600">
                Logged in as: {user.email} ({user.role})
              </p>
              <div className="flex gap-2">
                <Link href="/shows" className="text-blue-600 hover:underline">
                  Browse Shows
                </Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="text-blue-600 hover:underline">
                    Admin Dashboard
                  </Link>
                )}
                {user.role.startsWith("ORGANIZER") && (
                  <Link href="/organizer" className="text-green-600 hover:underline">
                    Organizer Dashboard
                  </Link>
                )}
                <form action="/api/auth/signout" method="POST">
                  <button type="submit" className="text-red-600 hover:underline">
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Link href="/auth/signin" className="text-blue-600 hover:underline">
                  Sign In
                </Link>
                <Link href="/auth/signin?signup=true" className="text-green-600 hover:underline">
                  Sign Up
                </Link>
              </div>
              <Link href="/shows" className="text-purple-600 hover:underline">
                Browse Shows as Guest
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
