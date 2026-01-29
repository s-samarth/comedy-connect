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
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tight">Financial Collections</h2>
                <p className="text-body-standard text-base">Monitor revenue stream and platform earnings</p>
            </div>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-muted/30 border-border shadow-xl rounded-3xl overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={120} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Platform Revenue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic tracking-tighter">₹{current.platformRevenue.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-meta-label mt-2 uppercase tracking-widest">Show Revenue + Booking Fees</p>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={120} className="text-emerald-500" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 text-[11px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Show Revenue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic tracking-tighter text-emerald-700">₹{current.showRevenue.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-emerald-600/60 mt-2 font-bold uppercase tracking-widest">Base Ticket Sales</p>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20 shadow-xl rounded-3xl overflow-hidden relative group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet size={120} className="text-primary" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 text-[11px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Platform Earnings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black italic tracking-tighter text-primary">₹{current.platformEarnings.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-primary/60 mt-2 font-bold uppercase tracking-widest">Commision + Booking Fees</p>
                    </CardContent>
                </Card>
            </div>

            {/* Explainer */}
            <div className="bg-muted/20 border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-background/80 p-2 rounded-xl border border-border">
                    <Info size={18} className="text-primary" />
                </div>
                <p className="text-sm text-body-standard italic">
                    {activeTab === 'lifetime' && "Reflecting total commerce processed since platform inception."}
                    {activeTab === 'active' && "Escrowed funds for shows currently listed or upcoming."}
                    {activeTab === 'pending' && "Completed events awaiting final audit and disbursement."}
                    {activeTab === 'booked' && "Settled accounts for archived and closed events."}
                    {activeTab === 'unpublished' && "Financial records for content currently restricted from public view."}
                </p>
            </div>

            {/* Tabs & Table Container */}
            <Card className="border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="bg-muted/30 border-b border-border p-4 overflow-x-auto">
                    <div className="flex bg-background/50 p-1 rounded-2xl border border-border w-max min-w-full md:min-w-0">
                        {([
                            { id: 'lifetime', label: 'Lifetime' },
                            { id: 'active', label: 'Active' },
                            { id: 'pending', label: 'To Disburse' },
                            { id: 'booked', label: 'Settled' },
                            { id: 'unpublished', label: 'Hidden/Unpub' }
                        ] as const).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-xl ${activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'hover:bg-muted text-meta-label'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <CardContent className="p-0 overflow-x-auto">
                    {current.shows.length === 0 ? (
                        <div className="py-24 text-center space-y-4">
                            <Clock size={40} className="mx-auto text-meta-label" />
                            <p className="text-meta-label font-black uppercase tracking-widest text-xs">No historical data found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse" style={{ minWidth: '1100px' }}>
                            <thead className="bg-muted/10 border-b border-border">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black text-meta-label uppercase tracking-widest">Show Details</th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-meta-label uppercase tracking-widest">Ticket Sales</th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-meta-label uppercase tracking-widest">Fees & Platform</th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-emerald-600 uppercase tracking-widest">Net Payout</th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-primary uppercase tracking-widest">Profit</th>
                                    <th className="px-8 py-5 text-right text-xs font-black text-meta-label uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {current.shows.map((show) => (
                                    <tr key={show.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-black italic uppercase tracking-tighter text-lg group-hover:text-primary transition-colors">{show.title}</div>
                                            <div className="text-[11px] font-bold text-meta-label mt-1 uppercase tracking-tight">
                                                {show.creator.organizerProfile?.name || show.creator.comedianProfile?.stageName || show.creator.email} • {show.stats.ticketsSold} Sold
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="font-bold text-base">₹{show.stats.showRevenue.toLocaleString('en-IN')}</div>
                                            <div className="text-[11px] text-meta-label uppercase mt-0.5">₹{show.stats.bookingFee.toLocaleString('en-IN')} user fees</div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="font-bold text-base">₹{show.stats.platformRevenue.toLocaleString('en-IN')}</div>
                                            <div className="text-[11px] text-meta-label uppercase mt-0.5">₹{show.stats.platformFee.toLocaleString('en-IN')} comm</div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="font-black text-emerald-400 text-lg">₹{show.stats.showEarnings.toLocaleString('en-IN')}</div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="font-black text-primary text-lg">₹{show.stats.platformEarnings.toLocaleString('en-IN')}</div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {activeTab === 'pending' ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDisburse(show.id)}
                                                    disabled={actionLoading === show.id}
                                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs h-8 rounded-lg"
                                                >
                                                    {actionLoading === show.id ? '...' : 'Disburse'}
                                                </Button>
                                            ) : (
                                                <Badge className={show.isDisbursed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black uppercase tracking-widest text-xs" : "bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-xs"}>
                                                    {show.isDisbursed ? 'Settled' : 'In Hold'}
                                                </Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
