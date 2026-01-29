'use client'

import { ShieldCheck, Users, Calendar, Wallet, Settings, ChevronRight, Zap } from 'lucide-react'
import Link from "next/link"
import StatsOverview from "@/components/admin/StatsOverview"

export default function AdminPage() {
    const managementConsoles = [
        { id: "comedians", title: "Artist Roster", desc: "Verify authentication, manage registry, and oversee performances.", icon: Users, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20", glow: "shadow-[0_0_40px_rgba(244,114,182,0.15)]", link: "/admin/comedians" },
        { id: "organizers", title: "Organizer Guild", desc: "Credentialing, venue verification, and performance audits.", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-[0_0_40px_rgba(59,130,246,0.15)]", link: "/admin/organizers" },
        { id: "shows", title: "Moderation Queue", desc: "Live show vetting, publishing logic, and event scheduling.", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-[0_0_40px_rgba(168,85,247,0.15)]", link: "/admin/shows" },
        { id: "fees", title: "Revenue Config", desc: "Global fee logic, platform percentage, and finance logic.", icon: Settings, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]", link: "/admin/fees" },
        { id: "collections", title: "Treasury Hub", desc: "Lifetime revenue flows, active pools, and payouts.", icon: Wallet, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", glow: "shadow-[0_0_40px_rgba(245,166,35,0.15)]", link: "/admin/collections" },
    ]

    return (
        <div className="space-y-16 animate-in fade-in duration-700 pb-20">
            {/* Minimalist Hero Header */}
            <div className="pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                            <Zap size={14} className="fill-primary" />
                            Live Ecosystem Governance
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
                            Admin <span className="text-primary">Dashboard</span>
                        </h1>
                        <p className="text-sm text-meta-label font-medium uppercase tracking-widest">System Version 2.5.0 • Secure Connection</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="pt-4">
                <StatsOverview />
            </div>

            {/* Management Matrix */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-1 h-6 bg-primary rounded-full" />
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">
                        Management Matrix
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {managementConsoles.map((console) => (
                        <div key={console.id} className="group relative bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6 hover:bg-zinc-950/60 transition-all duration-500 overflow-hidden shadow-2xl">
                            {/* Animated Background Glow */}
                            <div className={`absolute -inset-px bg-gradient-to-br ${console.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative z-10 flex flex-col h-full space-y-6">
                                <div className={`w-12 h-12 ${console.bg} ${console.border} rounded-xl flex items-center justify-center ${console.color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
                                    <console.icon size={24} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white uppercase italic tracking-tight leading-none group-hover:text-primary transition-colors duration-300">{console.title}</h3>
                                    <p className="text-sm text-body-standard leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                        {console.desc}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <Link href={console.link} className="inline-flex items-center gap-3 text-[11px] font-bold text-primary uppercase tracking-widest transition-all pt-2 group-hover:gap-5">
                                        OPEN CONSOLE <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                <div className={`w-2 h-2 rounded-full ${console.color.replace('text-', 'bg-')}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Signature Brand Footprint */}
            <div className="text-center py-24 border-t border-white/[0.03]">
                <h2 className="text-7xl font-black uppercase italic tracking-tighter select-none leading-none opacity-[0.03] text-white">
                    Comedy <br /> Connect
                </h2>
            </div>
        </div>
    )
}
