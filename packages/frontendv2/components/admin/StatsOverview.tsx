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
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-400/20',
            glow: 'shadow-[0_0_50px_rgba(52,211,153,0.15)]'
        },
        {
            label: 'ACTION ITEMS',
            value: stats?.pendingApprovals?.toString() || '0',
            change: 'Critical Priority',
            icon: ShieldCheck,
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20',
            glow: 'shadow-[0_0_50px_rgba(255,100,0,0.15)]'
        },
        {
            label: 'LIVE STATUS',
            value: stats?.activeShows?.toString() || '0',
            change: 'Scheduled Events',
            icon: Calendar,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            border: 'border-purple-400/20',
            glow: 'shadow-[0_0_50px_rgba(192,132,252,0.15)]'
        },
        {
            label: 'HUB CAPACITY',
            value: stats?.totalUsers?.toString() || '0',
            change: 'Unique Users',
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/20',
            glow: 'shadow-[0_0_50px_rgba(96,165,250,0.15)]'
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {statCards.map((stat) => (
                <div key={stat.label} className="group relative bg-white/[0.02] backdrop-blur-[40px] border border-white/5 rounded-[3.5rem] p-10 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-700 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className={`absolute -right-4 -bottom-4 w-28 h-28 ${stat.bg} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />

                    <div className="flex flex-col items-start gap-8 relative z-10">
                        <div className={`w-16 h-16 ${stat.bg} ${stat.border} ${stat.color} rounded-[1.5rem] flex items-center justify-center ${stat.glow} group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-2xl`}>
                            <stat.icon size={32} />
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.4em]">{stat.label}</p>
                            <div className="flex items-baseline gap-3">
                                <p className="text-5xl font-black tracking-tighter text-white italic drop-shadow-xl">{stat.value}</p>
                                <Zap size={14} className="text-primary animate-pulse" />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-tighter italic">{stat.change}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
