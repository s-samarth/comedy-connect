'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

export default function Navbar() {
    const { data: session } = useSession()
    const user = session?.user as any
    const pathname = usePathname()

    // Hide public navbar on admin routes
    if (pathname?.startsWith('/admin')) {
        return null
    }

    return (
        <header className="bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-xl font-semibold text-zinc-900 dark:text-white">
                        Comedy Connect
                    </Link>

                    <nav className="flex items-center space-x-6">
                        <Link href="/" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                            Home
                        </Link>
                        <Link href="/shows" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                            Shows
                        </Link>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900 font-medium text-zinc-900 dark:text-white">
                                    {user.name || user.email}
                                </span>
                                <Link href="/bookings" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                                    My Bookings
                                </Link>
                                <Link href="/profile" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                                    Profile
                                </Link>
                                {user.role === "ADMIN" && (
                                    <Link href="/admin-secure" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                                        Admin
                                    </Link>
                                )}
                                {user.role?.startsWith("COMEDIAN") && (
                                    <Link href="/comedian" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                                        Dashboard
                                    </Link>
                                )}
                                {user.role?.startsWith("ORGANIZER") && (
                                    <Link href="/organizer" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                                        Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link href="/auth/signin" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium font-sans">
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}
