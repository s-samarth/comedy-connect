'use client'

import { ShowManagement } from "@/components/admin/ShowManagement"
import { Calendar } from 'lucide-react'

export default function ShowsAdminPage() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-500">
                    <Calendar size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold uppercase italic tracking-tight text-white">Moderation Queue</h1>
                    <p className="text-sm text-meta-label font-medium uppercase tracking-widest">Live show vetting, publishing logic, and event scheduling</p>
                </div>
            </div>

            <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <ShowManagement />
            </div>
        </div>
    )
}
