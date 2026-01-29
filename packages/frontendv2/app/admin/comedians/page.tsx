'use client'

import ComedianManagement from "@/components/admin/ComedianManagement"
import { Users } from 'lucide-react'

export default function ComediansAdminPage() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-500">
                    <Users size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold uppercase italic tracking-tight text-white">Artist Registry</h1>
                    <p className="text-sm text-meta-label font-medium uppercase tracking-widest">Manage comedians, verify accounts, and oversee profiles</p>
                </div>
            </div>

            <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <ComedianManagement />
            </div>
        </div>
    )
}
