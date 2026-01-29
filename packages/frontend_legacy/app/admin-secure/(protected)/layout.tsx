import { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { validateAdminSession } from "@/lib/admin-password"

const navItems = [
    { href: "/admin-secure", label: "Dashboard" },
    { href: "/admin-secure/organizers", label: "Organizers" },
    { href: "/admin-secure/shows", label: "Shows" },
    { href: "/admin-secure/fees", label: "Platform Settings" },
]

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
    // Read session cookie
    const headersList = await headers()
    // Note: We can't use request.cookies here directly in layout usually, but we use headers or cookies() function
    // Next.js 15 cookies() is async. Previous versions sync. Let's try importing cookies
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin-secure-session')

    const { valid, email } = await validateAdminSession(sessionCookie?.value)

    if (!valid) {
        redirect('/admin-secure/login')
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin-secure" className="flex items-center gap-3">
                            <span className="text-xl font-bold text-slate-900">Comedy Connect</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-xs font-medium tracking-wide">
                                ADMIN
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-700 hidden sm:block">
                                {email}
                            </span>
                            <form action="/api/admin-secure/logout" method="POST">
                                {/* 
                   Note: Using a form submit to route handler will work but client side navigation is smoother.
                   Ideally we use a client component for logout button.
                   For now, simple form submission is robust.
                 */}
                                <button
                                    type="submit"
                                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    )
}
