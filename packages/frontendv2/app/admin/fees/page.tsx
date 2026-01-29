'use client'

import FeeManagement from "@/components/admin/FeeManagement"
import { Settings } from 'lucide-react'

export default function FeesAdminPage() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold uppercase italic tracking-tight text-white">Revenue Config</h1>
                    <p className="text-sm text-meta-label font-medium uppercase tracking-widest">Global fee logic, platform percentage, and finance logic</p>
                </div>
            </div>

            <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <FeeManagement />
            </div>
        </div>
    )
}
