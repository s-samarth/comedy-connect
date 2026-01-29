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
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-meta-label animate-pulse">Establishing Secure Stream...</p>
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
        <div className="space-y-16 animate-in fade-in duration-700">
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
                        <p className="text-sm text-meta-label font-medium uppercase tracking-widest">System Version 2.4.0 • Secure Connection</p>
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
                        <div key={console.id} className="group relative bg-white/[0.01] border border-white/[0.03] rounded-3xl p-8 space-y-6 hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 overflow-hidden">
                            <div className={`w-12 h-12 ${console.bg} ${console.border} rounded-xl flex items-center justify-center ${console.color} transition-all duration-300`}>
                                <console.icon size={24} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white uppercase italic tracking-tight leading-none">{console.title}</h3>
                                <p className="text-sm text-body-standard leading-relaxed">
                                    {console.desc}
                                </p>
                            </div>:

                            <a href={console.link} className="inline-flex items-center gap-3 text-[11px] font-bold text-primary uppercase tracking-widest transition-all pt-2 group-hover:gap-4">
                                OPEN CONSOLE <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sub-System Modules */}
            <div className="space-y-32 pt-16 border-t border-white/[0.03]">
                <div id="comedians-management" className="scroll-mt-24">
                    <div className="mb-10 flex items-center gap-4">
                        <Users className="text-pink-500" size={32} />
                        <h2 className="text-3xl font-bold uppercase italic tracking-tight text-white">Artist Registry</h2>
                    </div>
                    <ComedianManagement />
                </div>

                <div id="organizers-management" className="scroll-mt-24">
                    <div className="mb-10 flex items-center gap-4">
                        <ShieldCheck className="text-blue-500" size={32} />
                        <h2 className="text-3xl font-bold uppercase italic tracking-tight text-white">Organizer Guild</h2>
                    </div>
                    <OrganizerManagement />
                </div>

                <div id="shows-management" className="scroll-mt-24">
                    <div className="mb-10 flex items-center gap-4">
                        <Calendar className="text-purple-500" size={32} />
                        <h2 className="text-3xl font-bold uppercase italic tracking-tight text-white">Show Moderation</h2>
                    </div>
                    <ShowManagement />
                </div>

                <div id="collections-management" className="scroll-mt-24">
                    <div className="mb-10 flex items-center gap-4">
                        <Wallet className="text-orange-500" size={32} />
                        <h2 className="text-3xl font-bold uppercase italic tracking-tight text-white">Treasury Board</h2>
                    </div>
                    <CollectionManagement />
                </div>

                <div id="fees-management" className="scroll-mt-24">
                    <div className="mb-10 flex items-center gap-4">
                        <Settings className="text-emerald-500" size={32} />
                        <h2 className="text-3xl font-bold uppercase italic tracking-tight text-white">Internal Economics</h2>
                    </div>
                    <FeeManagement />
                </div>
            </div>

            {/* Signature Brand Footprint */}
            <div className="text-center py-32">
                <h2 className="text-7xl font-black uppercase italic tracking-tighter select-none leading-none opacity-[0.03] text-white">
                    Comedy <br /> Connect
                </h2>
            </div>
        </div>
    )
}
