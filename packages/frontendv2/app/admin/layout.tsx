'use client'

import { useAuth } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { ShieldCheck, Calendar, Users, Settings } from 'lucide-react'
import { useEffect } from 'react'

const navItems = [
    { href: "/admin", label: "Admin Home", icon: ShieldCheck },
    { href: "#organizers", label: "Organizers", icon: Users },
    { href: "#shows", label: "Shows", icon: Calendar },
    { href: "#fees", label: "Platform Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/')
        }
    }, [isAuthenticated, isLoading, user, router])

    if (isLoading || !user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div>Loading Admin Panel...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-slate-900" />
                            <span className="text-2xl font-semibold text-slate-900">Admin Panel</span>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
                                Restricted Access
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Managed By: {user.email}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/">
                            <button className="text-sm text-slate-600 hover:text-slate-900">Exit Admin</button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">{children}</div>
            </main>
        </div>
    )
}
