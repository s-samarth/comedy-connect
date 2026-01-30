"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { toast } from "sonner"

interface Show {
    id: string
    title: string
    date: string
    venue: string
    isPublished: boolean
    isDisbursed: boolean
    creator: {
        email: string
        organizerProfile?: { name: string }
        comedianProfile?: { stageName: string }
    }
    stats: {
        showRevenue: number      // Ticket price * Qty
        bookingFee: number       // From slabs (Convenience Fee)
        platformFee: number       // Platform commission
        platformRevenue: number   // Show Revenue + Booking Fee
        platformEarnings: number   // Platform Fee + Booking Fee
        showEarnings: number       // showRevenue - platformFee
        ticketsSold: number
    }
}

interface CollectionData {
    showRevenue: number
    bookingFee: number
    platformFee: number
    platformRevenue: number
    platformEarnings: number
    showEarnings: number
    shows: Show[]
}

interface CollectionsResponse {
    lifetime: CollectionData
    active: CollectionData
    pending: CollectionData
    booked: CollectionData
    unpublished: CollectionData
}

type TabType = 'lifetime' | 'active' | 'pending' | 'booked' | 'unpublished'

export default function CollectionManagement() {
    const [data, setData] = useState<CollectionsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabType>('lifetime')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchCollections()
    }, [])

    const fetchCollections = async () => {
        try {
            setLoading(true)
            const json = await api.get<CollectionsResponse>(`/api/v1/admin/collections?t=${Date.now()}`)
            setData(json)
        } catch (e) {
            console.error("Failed to fetch collections:", e)
            toast.error("Failed to load collections data")
        } finally {
            setLoading(false)
        }
    }

    const handleDisburse = async (showId: string) => {
        if (!confirm("Mark this show as disbursed? This will move its collections to the 'Booked' category.")) return

        setActionLoading(showId)
        try {
            await api.post("/api/v1/admin/collections", { showId, action: "DISBURSE" })
            toast.success("Funds marked as disbursed")
            await fetchCollections()
        } catch (e) {
            console.error("Disbursement failed:", e)
            toast.error("Disbursement operation failed")
        } finally {
            setActionLoading(null)
        }
    }

    if (loading && !data) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                </div>
                <Skeleton className="h-[400px] rounded-3xl" />
            </div>
        )
    }

    if (!data) return (
        <div className="p-12 text-center bg-destructive/10 rounded-3xl border border-destructive/20 border-border">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-bold">Failed to load financial data</h3>
            <Button variant="outline" onClick={fetchCollections} className="mt-4">Retry</Button>
        </div>
    )

    const current = data[activeTab]

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="border-b border-border">
                <div className="flex gap-8">
                    {([
                        { id: 'lifetime', label: 'Lifetime' },
                        { id: 'active', label: 'Active' },
                        { id: 'pending', label: 'To be Disbursed' },
                        { id: 'booked', label: 'Booked' },
                        { id: 'unpublished', label: 'Unpublished' }
                    ] as const).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`pb-4 text-[13px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id
                                ? 'text-primary'
                                : 'text-meta-label hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-left-2" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <Card className="bg-zinc-900/40 border-white/5 shadow-2xl rounded-2xl overflow-hidden relative group">
                    <CardHeader className="pb-1">
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                            Platform Revenue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black italic tracking-tighter text-white">₹{current.platformRevenue.toLocaleString('en-IN')}</div>
                        <p className="text-[11px] text-white/20 mt-2 font-bold uppercase tracking-widest">Show Revenue + Booking Fee</p>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-2xl rounded-2xl overflow-hidden relative group font-sans">
                    <CardHeader className="pb-1">
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60">
                            Show Revenue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black italic tracking-tighter text-emerald-400">₹{current.showRevenue.toLocaleString('en-IN')}</div>
                        <p className="text-[11px] text-emerald-400/20 mt-2 font-bold uppercase tracking-widest">Ticket Sales (Excl. Fees)</p>
                    </CardContent>
                </Card>

                <Card className="bg-blue-500/5 border-blue-500/20 shadow-2xl rounded-2xl overflow-hidden relative group font-sans">
                    <CardHeader className="pb-1">
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/60">
                            Platform Earnings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-black italic tracking-tighter text-blue-400">₹{current.platformEarnings.toLocaleString('en-IN')}</div>
                        <p className="text-[11px] text-blue-400/20 mt-2 font-bold uppercase tracking-widest">Platform Fee + Booking Fee</p>
                    </CardContent>
                </Card>
            </div>

            {/* Explanation Alert */}
            <div className="bg-muted/20 border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="bg-background/50 p-1.5 rounded-lg border border-border">
                    <Info size={16} className="text-meta-label/60" />
                </div>
                <p className="text-[13px] text-body-standard font-medium italic opacity-60">
                    All successful transactions since platform launch.
                </p>
            </div>

            {/* Detailed Table Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 pt-4">
                    <div className="bg-muted/50 p-2 rounded-xl border border-border">
                        <Wallet className="text-meta-label/70" size={18} />
                    </div>
                    <h2 className="text-xl font-black uppercase italic tracking-tight opacity-80">Detailed Financial Breakdown</h2>
                </div>

                <Card className="border-border shadow-2xl rounded-2xl overflow-hidden">
                    <CardContent className="p-0 overflow-x-auto">
                        {current.shows.length === 0 ? (
                            <div className="py-24 text-center space-y-4">
                                <Clock size={40} className="mx-auto text-meta-label" />
                                <p className="text-meta-label font-black uppercase tracking-widest text-xs">No historical data found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse" style={{ minWidth: '1200px' }}>
                                <thead className="bg-muted/10 border-b border-border">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-meta-label uppercase tracking-widest w-64">Show / Artist</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-meta-label uppercase tracking-widest">Show Revenue</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-meta-label uppercase tracking-widest">Booking Fee</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-meta-label uppercase tracking-widest">Platform Revenue</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-meta-label uppercase tracking-widest">Platform Fee</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-emerald-400 uppercase tracking-[0.1em]">Show Earnings</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-blue-400 uppercase tracking-[0.1em]">Platform Earnings</th>
                                        <th className="px-6 py-5 text-right text-[10px] font-black text-meta-label uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-meta-label uppercase tracking-widest">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {current.shows.map((show) => (
                                        <tr key={show.id} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-black italic uppercase tracking-tighter text-lg leading-tight group-hover:text-primary transition-colors">{show.title}</div>
                                                <div className="text-[10px] font-bold text-meta-label mt-1 uppercase tracking-tight">
                                                    BY {show.creator.organizerProfile?.name || show.creator.comedianProfile?.stageName || show.creator.email} • {show.stats.ticketsSold} SOLD
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right font-bold text-base">₹{show.stats.showRevenue?.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-6 text-right font-bold text-base text-meta-label opacity-60">₹{show.stats.bookingFee?.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-6 text-right font-bold text-base">₹{show.stats.platformRevenue?.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-6 text-right font-bold text-base text-meta-label opacity-60">₹{show.stats.platformFee?.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-6 text-right font-black text-emerald-500 text-lg">₹{show.stats.showEarnings?.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-6 text-right font-black text-blue-500 text-lg">₹{show.stats.platformEarnings?.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex justify-end">
                                                    {new Date(show.date).getTime() < Date.now() || show.isDisbursed ? (
                                                        <Badge className="bg-blue-500/10 text-blue-400 border-none font-black uppercase tracking-widest text-[9px] px-3 py-1 shadow-sm">
                                                            Completed
                                                        </Badge>
                                                    ) : (
                                                        <Badge className={`font-black uppercase tracking-widest text-[9px] px-3 py-1 border-none shadow-sm ${show.isPublished
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : "bg-zinc-500/10 text-zinc-400"}`}>
                                                            {show.isPublished ? 'Published' : 'Draft'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end">
                                                    {activeTab === 'pending' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleDisburse(show.id)}
                                                            disabled={actionLoading === show.id}
                                                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[9px] h-7 px-4 rounded-md shadow-lg shadow-primary/20"
                                                        >
                                                            {actionLoading === show.id ? '...' : 'Disburse'}
                                                        </Button>
                                                    ) : (
                                                        <Badge className={`font-black uppercase tracking-widest text-[9px] px-3 py-1 border-none shadow-sm ${show.isDisbursed
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : "bg-blue-500/10 text-blue-500"}`}>
                                                            {show.isDisbursed ? 'DISBURSED' : 'TO BE DISBURSED'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
