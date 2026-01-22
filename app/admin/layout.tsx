import { ReactNode } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"

const navItems = [
  { href: "/admin", label: "Admin Home" },
  { href: "/admin/organizers", label: "Organizers" },
  { href: "/admin/shows", label: "Shows" },
  { href: "/admin/fees", label: "Platform Settings" },
]

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-slate-900">Admin Panel</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
                Internal / Restricted Access
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">Restricted tools for administrators only</p>
          </div>
          {user && (
            <div className="text-right text-sm">
              <div className="font-medium text-slate-900">{user.email}</div>
              <div className="text-slate-600">Role: {user.role}</div>
            </div>
          )}
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-4 text-sm font-medium text-slate-700">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="px-3 py-2 rounded-md hover:bg-white border border-transparent hover:border-slate-200">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">{children}</div>
      </main>
    </div>
  )
}
