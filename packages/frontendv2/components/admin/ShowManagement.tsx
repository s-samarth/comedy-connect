'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
import ShowFinanceView from './ShowFinanceView'
import { AlertCircle, Image as ImageIcon } from 'lucide-react'

interface Show {
    id: string
    title: string
    description?: string
    date: string
    venue: string
    ticketPrice: number
    totalTickets: number
    posterImageUrl?: string
    createdAt: string
    isPublished: boolean
    isDisbursed: boolean
    customPlatformFee?: number
    creator: {
        email: string
        organizerProfile?: {
            name: string
        }
    }
    _count: {
        bookings: number
    }
    stats?: {
        revenue: number
        ticketsSold: number
    }
}

export function ShowManagement() {
    const [shows, setShows] = useState<Show[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'COMPLETED'>('ALL')
    const [selectedShowFinanceId, setSelectedShowFinanceId] = useState<string | null>(null)

    useEffect(() => {
        fetchShows()
    }, [])

    const fetchShows = async () => {
        try {
            const data = await api.get<any>('/api/v1/admin/shows')
            setShows(data.shows || [])
        } catch (error: any) {
            setError(error.message?.replace('API Error:', '').trim() || 'Failed to load shows')
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (showId: string, action: 'PUBLISH' | 'UNPUBLISH' | 'DELETE') => {
        if (action === 'DELETE' && !confirm('Are you sure you want to delete this show? This cannot be undone.')) {
            return
        }

        setActionLoading(showId)

        try {
            await api.post('/api/v1/admin/shows', { showId, action })
            await fetchShows() // Refresh list
        } catch (error: any) {
            setError(error.message?.replace('API Error:', '').trim() || 'Failed to update show')
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateShowFee = async (showId: string, customPlatformFee: number | null) => {
        setActionLoading(showId + '-fee')
        try {
            await api.post('/api/v1/admin/shows', {
                showId,
                action: 'UPDATE_FEE',
                customPlatformFee: customPlatformFee === null ? null : customPlatformFee
            })
            await fetchShows()
        } catch (error: any) {
            setError(error.message?.replace('API Error:', '').trim() || 'Failed to update fee')
        } finally {
            setActionLoading(null)
        }
    }
    const handleSetDisbursed = async (showId: string, isDisbursed: boolean) => {
        setActionLoading(showId + '-payment')
        try {
            await api.post('/api/v1/admin/shows', {
                showId,
                action: 'SET_DISBURSED',
                isDisbursed
            })
            await fetchShows()
        } catch (error: any) {
            setError(error.message?.replace('API Error:', '').trim() || 'Failed to update payment status')
        } finally {
            setActionLoading(null)
        }
    }

    const filteredShows = shows.filter(show => {
        const isCompleted = new Date(show.date).getTime() < Date.now() || show.isDisbursed

        if (filter === 'ALL') return true
        if (filter === 'COMPLETED') return isCompleted
        if (filter === 'PUBLISHED') return show.isPublished && !isCompleted
        if (filter === 'DRAFT') return !show.isPublished && !isCompleted
        return true
    })

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 animate-pulse flex gap-4">
                    <div className="w-24 h-24 bg-white/[0.05] rounded-lg"></div>
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-white/[0.05] rounded w-1/3"></div>
                        <div className="h-4 bg-white/[0.05] rounded w-1/4"></div>
                    </div>
                </div>
            ))}
        </div>
    )

    if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Error: {error}</div>

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold italic uppercase tracking-tight">Show Moderation</h2>
                    <p className="text-body-standard text-xs">Monitor content and manage live events.</p>
                </div>
                <div className="flex bg-white/[0.03] border border-white/[0.05] p-1 rounded-xl self-start">
                    {(['ALL', 'PUBLISHED', 'DRAFT', 'COMPLETED'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${filter === f
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-meta-label hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filteredShows.length === 0 ? (
                <div className="bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl p-16 text-center">
                    <p className="text-meta-label font-bold uppercase tracking-widest text-xs">No shows found</p>
                </div>
            ) : (
                <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/[0.05]" style={{ minWidth: '1100px' }}>
                            <thead className="bg-white/[0.02]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-meta-label uppercase tracking-widest border-b border-white/[0.05]">
                                        Event
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-meta-label uppercase tracking-widest border-b border-white/[0.05]">
                                        Organizer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-meta-label uppercase tracking-widest border-b border-white/[0.05]">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-meta-label uppercase tracking-widest border-b border-white/[0.05]">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-meta-label uppercase tracking-widest border-b border-white/[0.05]">
                                        Payment
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-meta-label uppercase tracking-widest border-b border-white/[0.05]">
                                        Platform Fee
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-meta-label uppercase tracking-widest border-b border-white/[0.05]">
                                        Finance
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-meta-label uppercase tracking-widest border-b border-white/[0.05]">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-white/[0.05]">
                                {filteredShows.map((show) => (
                                    <tr key={show.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <a href={`/shows/${show.id}`} target="_blank" rel="noopener noreferrer" className="block w-12 h-16 bg-white/[0.05] rounded-md overflow-hidden flex-shrink-0 relative hover:opacity-80 transition-opacity">
                                                    {show.posterImageUrl ? (
                                                        <img src={show.posterImageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-white/10">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </a>
                                                <div>
                                                    <a href={`/shows/${show.id}`} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-white line-clamp-1 hover:text-primary transition-colors">
                                                        {show.title}
                                                    </a>
                                                    <div className="text-[11px] text-meta-label mt-0.5 flex flex-col gap-0.5">
                                                        <span className="font-medium text-emerald-400">
                                                            ₹{show.stats?.revenue?.toLocaleString('en-IN') || 0} Revenue
                                                        </span>
                                                        <span>
                                                            {show.stats?.ticketsSold || 0} / {show.totalTickets} tickets sold ({Math.round(((show.stats?.ticketsSold || 0) / show.totalTickets) * 100)}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-base text-white font-medium">
                                                {show.creator.organizerProfile?.name || "Unknown"}
                                            </div>
                                            <div className="text-[11px] text-meta-label">
                                                {show.creator.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white">
                                                {new Date(show.date).toLocaleDateString()}
                                            </div>
                                            <div className="text-[11px] text-meta-label truncate max-w-[150px]">
                                                {show.venue}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(show.date).getTime() < Date.now() || show.isDisbursed ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-blue-500"></span>
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${show.isPublished
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${show.isPublished ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                                                    {show.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={show.isDisbursed ? 'DISBURSED' : 'TO_BE_DISBURSED'}
                                                onChange={(e) => handleSetDisbursed(show.id, e.target.value === 'DISBURSED')}
                                                disabled={actionLoading === show.id + '-payment'}
                                                className={`text-xs font-black uppercase tracking-tight rounded-md px-2 py-1 border transition-colors ${show.isDisbursed
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                                    } focus:outline-none focus:ring-1 focus:ring-primary shadow-sm outline-none`}
                                            >
                                                <option value="TO_BE_DISBURSED" className="bg-zinc-950">To Be Disbursed</option>
                                                <option value="DISBURSED" className="bg-zinc-950">Disbursed</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {show.isDisbursed ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-black text-white">
                                                        {show.customPlatformFee ?? 8}%
                                                    </span>
                                                    <span className="text-[10px] bg-white/[0.05] text-meta-label px-1 py-0.5 rounded font-black border border-white/[0.05] uppercase tracking-tighter">FIXED</span>
                                                </div>
                                            ) : (
                                                <ShowFeeEditor
                                                    showId={show.id}
                                                    initialFee={show.customPlatformFee}
                                                    onUpdate={handleUpdateShowFee}
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedShowFinanceId(show.id)}
                                                className="inline-flex items-center gap-1 text-xs font-black text-primary hover:bg-primary/10 px-2 py-1 rounded-md border border-primary/20 transition-all uppercase tracking-tight"
                                            >
                                                View
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {!(new Date(show.date).getTime() < Date.now() || show.isDisbursed) ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(show.id, show.isPublished ? 'UNPUBLISH' : 'PUBLISH')}
                                                            disabled={actionLoading === show.id}
                                                            className={`px-2 py-1 rounded-md text-xs font-black uppercase tracking-tight transition-colors border shadow-sm ${show.isPublished
                                                                ? 'text-orange-400 bg-orange-400/10 border-orange-400/20 hover:bg-orange-400/20'
                                                                : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 hover:bg-emerald-400/20'
                                                                } disabled:opacity-50`}
                                                        >
                                                            {actionLoading === show.id
                                                                ? '...'
                                                                : show.isPublished
                                                                    ? 'Unpublish'
                                                                    : 'Publish'
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(show.id, 'DELETE')}
                                                            disabled={actionLoading === show.id}
                                                            className="px-2 py-1 bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20 rounded-md text-xs font-black uppercase tracking-tight transition-colors disabled:opacity-50 shadow-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-bold text-meta-label uppercase tracking-tighter px-2">No Actions</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {selectedShowFinanceId && (
                <ShowFinanceView
                    showId={selectedShowFinanceId}
                    onClose={() => setSelectedShowFinanceId(null)}
                />
            )}
        </div>
    )
}

function ShowFeeEditor({ showId, initialFee, onUpdate }: {
    showId: string,
    initialFee?: number,
    onUpdate: (id: string, val: number | null) => Promise<void>
}) {
    const [value, setValue] = useState(initialFee ?? 8)
    const [isDirty, setIsDirty] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Reset state when prop changes (e.g. after successful save)
    useEffect(() => {
        setValue(initialFee ?? 8)
        setIsDirty(false)
    }, [initialFee])

    const handleSave = async () => {
        setIsSaving(true)
        await onUpdate(showId, value)
        setIsSaving(false)
    }

    const handleReset = async () => {
        setIsSaving(true)
        await onUpdate(showId, null)
        setIsSaving(false)
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={value}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            setValue(isNaN(val) ? 0 : val)
                            setIsDirty(true)
                        }}
                        disabled={isSaving}
                        className="w-16 px-2 py-1 text-sm bg-black border border-white/[0.05] rounded focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50 text-white"
                    />
                    <span className="text-xs text-meta-label">%</span>
                </div>
                {isDirty && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-[11px] bg-primary text-black font-bold px-2 py-0.5 rounded shadow-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isSaving ? '...' : 'Save'}
                    </button>
                )}
            </div>

            {initialFee !== null && initialFee !== undefined && !isDirty && (
                <div className="flex flex-col">
                    <span className="text-[11px] bg-primary/10 text-primary px-1 rounded font-bold uppercase tracking-tighter text-center">Override</span>
                    <button
                        onClick={handleReset}
                        disabled={isSaving}
                        className="text-[10px] text-meta-label hover:text-red-400 underline mt-1 text-left"
                    >
                        {isSaving ? '...' : 'Reset'}
                    </button>
                </div>
            )}
        </div>
    )
}
