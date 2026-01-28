'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks"
import { AdminPasswordPrompt } from "@/components/admin/AdminPasswordPrompt"
import StatsOverview from "@/components/admin/StatsOverview"
import OrganizerManagement from "@/components/admin/OrganizerManagement"
import ComedianManagement from "@/components/admin/ComedianManagement"
import { ShowManagement } from "@/components/admin/ShowManagement"
import FeeManagement from "@/components/admin/FeeManagement"
import CollectionManagement from "@/components/admin/CollectionManagement"
import { ShieldCheck, LayoutGrid, Users, Calendar, Wallet, Settings, RefreshCw, ChevronRight, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function AdminPage() {
    const [isVerified, setIsVerified] = useState(false)
    const [needsSetup, setNeedsSetup] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAdminPassword = async () => {
            try {
                const response = await fetch('/api/v1/admin/check-password-setup')
                const data = await response.json()
                setNeedsSetup(data.needsSetup)

                if (!data.needsSetup) {
                    const verifyResponse = await fetch('/api/v1/admin/verify-session')
                    if (verifyResponse.ok) {
                        setIsVerified(true)
                    }
                }
            } catch (error) {
                console.error('Password setup check failed:', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkAdminPassword()
    }, [])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10">
                <div className="relative">
                    <RefreshCw className="w-16 h-16 text-primary animate-spin" />
                    <div className="absolute inset-0 bg-primary blur-2xl opacity-20 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">SYNCING ASSETS</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 animate-pulse">Establishing Secure Stream...</p>
                </div>
            </div>
        )
    }

    if (!isVerified) {
        return <AdminPasswordPrompt onVerified={() => setIsVerified(true)} needsSetup={needsSetup} />
    }

    const managementConsoles = [
        { id: "comedians", title: "Artist Roster", desc: "Verify authentication, manage registry, and oversee performances.", icon: Users, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20", glow: "shadow-[0_0_40px_rgba(244,114,182,0.15)]", link: "#comedians-management" },
        { id: "organizers", title: "Organizer Guild", desc: "Credentialing, venue verification, and performance audits.", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-[0_0_40px_rgba(59,130,246,0.15)]", link: "#organizers-management" },
        { id: "shows", title: "Moderation Queue", desc: "Live show vetting, publishing logic, and event scheduling.", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-[0_0_40px_rgba(168,85,247,0.15)]", link: "#shows-management" },
        { id: "fees", title: "Revenue Config", desc: "Global fee logic, platform percentage, and finance logic.", icon: Settings, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]", link: "#fees-management" },
        { id: "collections", title: "Treasury Hub", desc: "Lifetime revenue flows, active pools, and payouts.", icon: Wallet, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", glow: "shadow-[0_0_40px_rgba(249,115,22,0.15)]", link: "#collections-management" },
    ]

    return (
        <div className="space-y-24 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* High-Fidelity Hero Header */}
            <div className="relative py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                            <Zap size={14} className="fill-primary" />
                            Live Ecosystem Governance
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase italic leading-[0.8] drop-shadow-2xl">
                            COMMAND <br />
                            <span className="text-primary underline decoration-white/5 decoration-8 underline-offset-[12px]">CENTER.</span>
                        </h1>
                    </div>
                    <Button variant="outline" className="h-20 px-12 rounded-[2rem] border-white/5 bg-white/5 backdrop-blur-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white/10 text-primary hover:text-white transition-all gap-4 group shadow-2xl">
                        <RefreshCw size={20} className="text-primary group-hover:rotate-180 transition-transform duration-700" />
                        Refresh Hub
                    </Button>
                </div>
            </div>

            {/* Stats Ecosystem */}
            <div className="relative pt-4">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <StatsOverview />
            </div>

            {/* Management Matrix */}
            <div className="space-y-16">
                <div className="flex items-center gap-6">
                    <div className="w-2 h-10 bg-primary rounded-full" />
                    <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">
                        MANAGEMENT MATRIX
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {managementConsoles.map((console) => (
                        <div key={console.id} className="group relative bg-white/[0.02] backdrop-blur-[60px] border border-white/5 rounded-[4rem] p-12 space-y-10 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-700 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                            {/* Individual Glow */}
                            <div className={`absolute -right-20 -top-20 w-48 h-48 ${console.bg} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />

                            <div className={`w-24 h-24 ${console.bg} ${console.border} rounded-[2.5rem] flex items-center justify-center ${console.color} ${console.glow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-700`}>
                                <console.icon size={44} />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{console.title}</h3>
                                <p className="text-sm text-muted-foreground/60 leading-relaxed font-bold tracking-tight">
                                    {console.desc}
                                </p>
                            </div>

                            <a href={console.link} className="inline-flex items-center gap-4 text-[10px] font-black text-primary uppercase tracking-[0.4em] group-hover:gap-6 transition-all pt-4">
                                INITIALIZE CONSOLE <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sub-System Modules */}
            <div className="space-y-60 pt-40 border-t border-white/5">
                <div id="comedians-management" className="scroll-mt-32">
                    <div className="mb-16 space-y-4">
                        <div className="flex items-center gap-6">
                            <Users className="text-pink-500" size={56} />
                            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white">Artist Registry</h2>
                        </div>
                        <div className="w-full h-[1px] bg-gradient-to-r from-pink-500/50 via-pink-500/5 to-transparent" />
                    </div>
                    <ComedianManagement />
                </div>

                <div id="organizers-management" className="scroll-mt-32">
                    <div className="mb-16 space-y-4">
                        <div className="flex items-center gap-6">
                            <ShieldCheck className="text-blue-500" size={56} />
                            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white">Organizer Guild</h2>
                        </div>
                        <div className="w-full h-[1px] bg-gradient-to-r from-blue-500/50 via-blue-500/5 to-transparent" />
                    </div>
                    <OrganizerManagement />
                </div>

                <div id="shows-management" className="scroll-mt-32">
                    <div className="mb-16 space-y-4">
                        <div className="flex items-center gap-6">
                            <Calendar className="text-purple-500" size={56} />
                            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white">Show Moderation</h2>
                        </div>
                        <div className="w-full h-[1px] bg-gradient-to-r from-purple-500/50 via-purple-500/5 to-transparent" />
                    </div>
                    <ShowManagement />
                </div>

                <div id="collections-management" className="scroll-mt-32">
                    <div className="mb-16 space-y-4">
                        <div className="flex items-center gap-6">
                            <Wallet className="text-orange-500" size={56} />
                            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white">Treasury Board</h2>
                        </div>
                        <div className="w-full h-[1px] bg-gradient-to-r from-orange-500/50 via-orange-500/5 to-transparent" />
                    </div>
                    <CollectionManagement />
                </div>

                <div id="fees-management" className="scroll-mt-32">
                    <div className="mb-16 space-y-4">
                        <div className="flex items-center gap-6">
                            <Settings className="text-emerald-500" size={56} />
                            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white">Internal Economics</h2>
                        </div>
                        <div className="w-full h-[1px] bg-gradient-to-r from-emerald-500/50 via-emerald-500/5 to-transparent" />
                    </div>
                    <FeeManagement />
                </div>
            </div>

            {/* Signature Brand Footprint */}
            <div className="text-center py-60 opacity-[0.05] relative overflow-hidden">
                <div className="absolute inset-0 bg-primary blur-[180px] opacity-10 rounded-full" />
                <h2 className="text-9xl md:text-[18rem] font-black uppercase italic tracking-tighter select-none leading-none relative z-10">
                    COMEDY <br /> CONNECT
                </h2>
            </div>
        </div>
    )
}
