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
            {/* RAW ENERGY - High Fidelity Homepage Glow Suite */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Primary Orange Gloom */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary blur-[160px] opacity-[0.08] rounded-full animate-pulse " />

                {/* Secondary Warm Glow */}
                <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[50%] bg-orange-600 blur-[130px] opacity-[0.07] rounded-full" />

                {/* Accent Depth */}
                <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-purple-600 blur-[180px] opacity-[0.03] rounded-full" />

                {/* Subtle Grain / Texture */}
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
            </div>

            {/* Premium Sticky Glass Navbar */}
            <header className="bg-background/40 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-16">
                        <Link href="/" className="flex items-center gap-4 group">
                            <span className="font-[900] text-3xl tracking-tighter text-white italic uppercase leading-none">
                                Comedy <span className="text-primary group-hover:text-white transition-all duration-500 underline decoration-white/5 decoration-4 underline-offset-4">Connect</span>
                            </span>
                            <Badge variant="secondary" className="bg-primary hover:bg-white text-black rounded-xl px-3 py-1 text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(255,100,0,0.4)]">
                                ADMIN
                            </Badge>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-2 ${pathname === link.href ? 'text-white' : 'text-muted-foreground/60 hover:text-primary'
                                        }`}
                                >
                                    {link.label}
                                    {pathname === link.href && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(255,100,0,0.5)] rounded-full" />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="hidden sm:flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-black text-white uppercase tracking-tight italic">{user.email?.split('@')[0]}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Admin Verified</span>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />
                        <Link href="/">
                            <button className="text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-white transition-all transform hover:scale-110 active:scale-90">
                                SIGN OUT
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 relative z-10">
                {children}
            </main>
        </div>
    )
}
