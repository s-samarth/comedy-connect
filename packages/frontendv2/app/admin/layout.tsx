'use client'

import { useAuth } from '@/lib/hooks'
import { useRouter, usePathname } from 'next/navigation'
import Link from "next/link"
import { LayoutGrid, Users, Calendar, Settings, ShieldCheck, Zap } from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push('/')
        }
    }, [isAuthenticated, isLoading, user, router])

    if (isLoading || !user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-80 h-80 bg-primary blur-[120px] opacity-10 rounded-full animate-pulse" />
                </div>
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_30px_rgba(255,100,0,0.3)]" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Command Core</span>
                    <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">Initializing Handshake...</span>
                </div>
            </div>
        )
    }

    const navLinks = [
        { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
        { href: '#organizers', label: 'Organizers', icon: Users },
        { href: '#shows', label: 'Shows', icon: Calendar },
        { href: '#fees', label: 'Economics', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/40 relative overflow-x-hidden">
            {/* MINIMALIST BACKGROUND - Subtle Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Primary Orange Gloom - Toned Down */}
                <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary blur-[120px] opacity-[0.03] rounded-full" />

                {/* Secondary Warm Glow - Toned Down */}
                <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[40%] bg-orange-600 blur-[100px] opacity-[0.03] rounded-full" />

                {/* Subtle Grain / Texture */}
                <div className="absolute inset-0 opacity-[0.01] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
            </div>

            {/* Minimalist Glass Navbar */}
            <header className="bg-background/60 backdrop-blur-md border-b border-white/[0.03] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-3 group">
                            <span className="font-black text-2xl tracking-tighter text-white uppercase italic leading-none">
                                Comedy <span className="text-primary">Connect</span>
                            </span>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 rounded-md px-2 py-0 text-[9px] font-bold tracking-widest uppercase">
                                ADMIN
                            </Badge>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative py-1 ${pathname === link.href ? 'text-white' : 'text-muted-foreground/40 hover:text-white'
                                        }`}
                                >
                                    {link.label}
                                    {pathname === link.href && (
                                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden sm:flex flex-col items-end">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                <span className="text-[11px] font-bold text-white uppercase tracking-tight">{user.email?.split('@')[0]}</span>
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">Verified</span>
                        </div>
                        <div className="h-4 w-[1px] bg-white/5 hidden sm:block" />
                        <Link href="/">
                            <button className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                                SIGN OUT
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {children}
            </main>
        </div>
    )
}
