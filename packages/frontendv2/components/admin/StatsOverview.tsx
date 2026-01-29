'use client'

import { useAuth } from '@/lib/hooks'
import { api } from '@/lib/api/client'
import { useEffect, useState } from 'react'
import { Users, Calendar, Banknote, ShieldCheck, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Stats {
    totalUsers: number
    activeShows: number
    totalRevenue: number
    pendingApprovals: number
}

export default function StatsOverview() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get<Stats>('/api/v1/admin/stats')
                setStats(data)
            } catch (error) {
                console.error('Failed to fetch admin stats:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            label: 'LIQUID REVENUE',
            value: `₹${stats?.totalRevenue?.toLocaleString() || '0'}`,
            change: '+18.4% MOM',
            icon: Banknote,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/5',
            border: 'border-emerald-400/10',
        },
        {
            label: 'ACTION ITEMS',
            value: stats?.pendingApprovals?.toString() || '0',
            change: 'Critical Priority',
            icon: ShieldCheck,
            color: 'text-primary',
            bg: 'bg-primary/5',
            border: 'border-primary/10',
        },
        {
            label: 'LIVE STATUS',
            value: stats?.activeShows?.toString() || '0',
            change: 'Scheduled Events',
            icon: Calendar,
            color: 'text-purple-400',
            bg: 'bg-purple-400/5',
            border: 'border-purple-400/10',
        },
        {
            label: 'HUB CAPACITY',
            value: stats?.totalUsers?.toString() || '0',
            change: 'Unique Users',
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-400/5',
            border: 'border-blue-400/10',
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
                <div key={stat.label} className={`group relative bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-zinc-950/60 transition-all duration-500 overflow-hidden`}>
                    {/* Hover Glow Effect */}
                    <div className={`absolute -inset-px bg-gradient-to-r ${stat.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="flex flex-col items-start gap-6 relative z-10">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.border} ${stat.color} rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)]`}>
                            <stat.icon size={24} />
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-meta-label uppercase tracking-widest opacity-70">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black tracking-tighter text-white italic transition-transform duration-300 group-hover:translate-x-1">{stat.value}</p>
                            </div>
                            <div className="flex items-center gap-2 pt-1 font-bold italic">
                                <div className={`w-1.5 h-1.5 rounded-full ${stat.color} animate-pulse`} />
                                <p className="text-[11px] text-meta-label uppercase tracking-tight">{stat.change}</p>
                            </div>
                        </div>
                    </div>

                    {/* Subtle Border Glow on Hover */}
                    <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-${stat.color.split('-')[1]}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>
            ))}
        </div>
    )
}
