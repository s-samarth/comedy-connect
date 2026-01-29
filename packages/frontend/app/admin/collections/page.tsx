'use client'

import CollectionManagement from "@/components/admin/CollectionManagement"
import { Wallet } from 'lucide-react'

export default function CollectionsAdminPage() {
    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <Wallet size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold uppercase italic tracking-tight text-white">Treasury Hub</h1>
                    <p className="text-sm text-meta-label font-medium uppercase tracking-widest">Lifetime revenue flows, active pools, and payouts</p>
                </div>
            </div>

            <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <CollectionManagement />
            </div>
        </div>
    )
}
