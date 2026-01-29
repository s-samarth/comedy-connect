
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Show {
    id: string
    title: string
    date: string
    venue: string
    isDisbursed: boolean
    creator: {
        email: string
        name?: string
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
            const res = await fetch(`/api/v1/admin/collections?t=${Date.now()}`, { cache: 'no-store' })
            if (res.ok) {
                const json = await res.json()
                setData(json)
            }
        } catch (e) {
            console.error("Failed to fetch collections")
        } finally {
            setLoading(false)
        }
    }

    const handleDisburse = async (showId: string) => {
        if (!confirm("Mark this show as disbursed? This will move its collections to the 'Booked' category.")) return

        setActionLoading(showId)
        try {
            const res = await fetch("/api/v1/admin/collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ showId, action: "DISBURSE" })
            })
            if (res.ok) {
                await fetchCollections()
            }
        } catch (e) {
            console.error("Disbursement failed")
        } finally {
            setActionLoading(null)
        }
    }

    if (loading && !data) return (
        <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Aggregating platform collections...</p>
        </div>
    )

    if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>

    const current = data[activeTab]

    // Calculate metrics for cards
    // Using new definitions:
    // Consolidated Intake -> Platform Revenue (Total User Pay)
    // Platform Revenue -> Platform Profits (Net Earnings)

    return (
        <div className="p-1 md:p-6 space-y-8">
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-slate-200">
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
                        className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id
                            ? 'text-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                        Platform Revenue
                    </p>
                    <h4 className="text-3xl font-black text-slate-900">₹{current.platformRevenue.toLocaleString('en-IN')}</h4>
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                        Show Revenue + Booking Fee
                    </p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a.997.997 0 00-.1-.47c.31-.19.62-.41.92-.66V18h-1z" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 mb-1 uppercase tracking-wider">Show Revenue</p>
                    <h4 className="text-3xl font-black text-emerald-900">₹{current.showRevenue.toLocaleString('en-IN')}</h4>
                    <p className="text-xs text-emerald-600 mt-2 font-medium">Ticket Sales (Excl. Fees)</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.4503-.309l-8 5a1 1 0 00-.5 1.7077V13a2 2 0 002 2h1a1 1 0 100-2H6a2 2 0 002-2V8.5527l4.3945 2.747a1 1 0 001.0312-1.7148l-1.0312-.6445z" clipRule="evenodd" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-blue-700 mb-1 uppercase tracking-wider">Platform Earnings</p>
                    <h4 className="text-3xl font-black text-blue-900">₹{current.platformEarnings.toLocaleString('en-IN')}</h4>
                    <p className="text-xs text-blue-600 mt-2 font-medium">Platform Fee + Booking Fee</p>
                </div>
            </div>

            {/* Explainer */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex gap-3">
                    <div className="text-slate-400 mt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-sm text-slate-600 italic font-medium">
                        {activeTab === 'lifetime' && "All successful transactions since platform launch."}
                        {activeTab === 'active' && "Shows currently listed or upcoming. Funds are held in escrow."}
                        {activeTab === 'pending' && "Completed shows awaiting payout verification and disbursement."}
                        {activeTab === 'booked' && "Successfully disbursed funds associated with archived shows."}
                        {activeTab === 'unpublished' && "Shows with revenue that are currently unpublished/hidden."}
                    </div>
                </div>
            </div>

            {/* Show Breakdown Table */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Detailed Financial Breakdown
                    </h3>
                </div>

                {current.shows.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                        <p className="text-slate-400 font-medium">No shows found for this collection type.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="sticky left-0 bg-slate-50 px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest z-10 border-r border-slate-100">Show / Artist</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Show Revenue</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest bg-blue-50/10">Booking Fee</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest bg-blue-50/30">Platform Revenue</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Fee</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50/30">Show Earnings</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-blue-600 uppercase tracking-widest">Platform Earnings</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {current.shows.map((show) => (
                                    <tr key={show.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="sticky left-0 bg-white group-hover:bg-slate-50/50 px-6 py-4 border-r border-slate-100 transition-colors z-10">
                                            <div className="font-bold text-slate-900">{show.title}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-tight">
                                                By {show.creator.organizerProfile?.name || show.creator.comedianProfile?.stageName || show.creator.name || 'Unknown'} • {show.stats.ticketsSold} Sold
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                                            ₹{show.stats.showRevenue.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-500 bg-blue-50/10">
                                            ₹{show.stats.bookingFee.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-800 bg-blue-50/30">
                                            ₹{show.stats.platformRevenue.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-500">
                                            ₹{show.stats.platformFee.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-black text-emerald-600 bg-emerald-50/20">
                                            ₹{show.stats.showEarnings.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-black text-blue-600">
                                            ₹{show.stats.platformEarnings.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {activeTab === 'pending' && (
                                                <button
                                                    onClick={() => handleDisburse(show.id)}
                                                    disabled={actionLoading === show.id}
                                                    className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition-all disabled:opacity-50"
                                                >
                                                    {actionLoading === show.id ? '...' : 'Disburse'}
                                                </button>
                                            )}
                                            {activeTab !== 'pending' && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${show.isDisbursed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {show.isDisbursed ? 'Disbursed' : 'To Be Disbursed'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
