'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import { X, Loader2 } from 'lucide-react'

interface ShowFinanceData {
    id: string
    title: string
    date: string
    venue: string
    isDisbursed: boolean
    isPublished: boolean
    creator: {
        email: string
        organizerProfile?: {
            name: string
        }
    }
    stats: {
        showRevenue: number
        platformFee: number
        bookingFee: number
        platformRevenue: number
        platformEarnings: number
        showEarnings: number
        ticketsSold: number
    }
}

interface ShowFinanceViewProps {
    showId: string
    onClose: () => void
}

export default function ShowFinanceView({ showId, onClose }: ShowFinanceViewProps) {
    const [data, setData] = useState<ShowFinanceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get<any>(`/api/v1/admin/collections?showId=${showId}`)
                // The API returns { lifetime: { shows: [...] }, ... }
                // Since we filtered by showId, it should be in lifetime.shows[0]
                const showData = res.lifetime.shows[0]
                if (!showData) throw new Error('Show financial data not found')
                setData(showData)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [showId])

    if (loading) return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#111] p-8 rounded-2xl border border-white/10 flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-white/60">Loading Financial Report...</p>
            </div>
        </div>
    )

    if (error || !data) return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#111] p-8 rounded-2xl border border-white/10 text-center">
                <p className="text-red-400 mb-4">{error || 'Data unavailable'}</p>
                <button onClick={onClose} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">Close</button>
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#0a0a0a] w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold text-white tracking-tight">{data.title}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${data.isDisbursed ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                {data.isDisbursed ? 'DISBURSED' : 'TO BE DISBURSED'}
                            </span>
                        </div>
                        <p className="text-white/40 flex items-center gap-2">
                            {new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {data.venue}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <LocalStatsCard
                            title="Show Revenue"
                            value={`₹${data.stats.showRevenue?.toLocaleString()}`}
                            subtitle="Total Ticket Sales (Raw)"
                            color="indigo"
                        />
                        <LocalStatsCard
                            title="Platform Revenue"
                            value={`₹${data.stats.platformRevenue?.toLocaleString()}`}
                            subtitle="Show Revenue + Booking Fees"
                            color="purple"
                        />
                        <LocalStatsCard
                            title="Platform Earnings"
                            value={`₹${data.stats.platformEarnings?.toLocaleString()}`}
                            subtitle="Platform Fees + Booking Fees"
                            color="emerald"
                        />
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Detailed Breakdown</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <BreakdownRow label="Tickets Sold" value={(data.stats?.ticketsSold ?? 0).toString()} />
                            <BreakdownRow label="Platform Revenue" value={`₹${data.stats.platformRevenue?.toLocaleString()}`} isHighlight />
                            <BreakdownRow label="Total Booking Fees" value={`- ₹${data.stats.bookingFee?.toLocaleString()}`} isNegative />
                            <div className="pt-2 pb-2 border-t border-white/5">
                                <BreakdownRow label="Show Revenue" value={`₹${data.stats.showRevenue?.toLocaleString()}`} />
                            </div>
                            <BreakdownRow label="Platform Fee" value={`- ₹${data.stats.platformFee?.toLocaleString()}`} isNegative />
                            <div className="pt-4 border-t border-white/5">
                                <BreakdownRow label="Show Earnings (Profit)" value={`₹${data.stats.showEarnings?.toLocaleString()}`} isHighlight />
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <BreakdownRow label="Platform Earnings (Net)" value={`₹${data.stats.platformEarnings?.toLocaleString()}`} isHighlight color="text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div>
                            <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-1">Creator</p>
                            <p className="text-white font-medium">{data.creator.organizerProfile?.name || 'Unknown'}</p>
                            <p className="text-white/40 text-sm">{data.creator.email}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LocalStatsCard({ title, value, subtitle, color }: { title: string, value: string, subtitle: string, color: 'indigo' | 'purple' | 'emerald' }) {
    const colors = {
        indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
        purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20',
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20'
    }

    return (
        <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-2xl border`}>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
            <p className="text-3xl font-black text-white mb-1 tracking-tight">{value}</p>
            <p className="text-white/30 text-[10px] font-medium leading-tight">{subtitle}</p>
        </div>
    )
}

function BreakdownRow({ label, value, isNegative, isHighlight, color }: { label: string, value: string, isNegative?: boolean, isHighlight?: boolean, color?: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className={`text-sm ${isHighlight ? 'text-white font-semibold' : 'text-white/50'}`}>{label}</span>
            <span className={`text-sm font-mono ${isNegative ? 'text-red-400' : isHighlight ? (color || 'text-emerald-400') + ' text-lg font-bold' : 'text-white'}`}>
                {value}
            </span>
        </div>
    )
}
