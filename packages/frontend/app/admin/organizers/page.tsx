'use client'

import OrganizerManagement from "@/components/admin/OrganizerManagement"
import { ShieldCheck } from 'lucide-react'

export default function OrganizersAdminPage() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold uppercase italic tracking-tight text-white">Organizers</h1>
                    <p className="text-sm text-meta-label font-medium uppercase tracking-widest">Credentialing, venue verification, and performance audits</p>
                </div>
            </div>

            <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <OrganizerManagement />
            </div>
        </div>
    )
}
