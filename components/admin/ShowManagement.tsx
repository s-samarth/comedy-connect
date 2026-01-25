'use client'

import { useState, useEffect } from 'react'
import ShowFinanceView from './ShowFinanceView'

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
      const response = await fetch('/api/admin/shows', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch shows')

      const data = await response.json()
      setShows(data.shows || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load shows')
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
      const response = await fetch('/api/admin/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId, action })
      })

      if (!response.ok) throw new Error('Failed to update show')

      await fetchShows() // Refresh list
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update show')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateShowFee = async (showId: string, customPlatformFee: number | null) => {
    setActionLoading(showId + '-fee')
    try {
      const response = await fetch('/api/admin/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId, action: 'UPDATE_FEE', customPlatformFee: customPlatformFee === null ? null : customPlatformFee })
      })

      if (!response.ok) throw new Error('Failed to update fee')
      await fetchShows()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update fee')
    } finally {
      setActionLoading(null)
    }
  }
  const handleSetDisbursed = async (showId: string, isDisbursed: boolean) => {
    setActionLoading(showId + '-payment')
    try {
      const response = await fetch('/api/admin/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId, action: 'SET_DISBURSED', isDisbursed })
      })

      if (!response.ok) throw new Error('Failed to update payment status')
      await fetchShows()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update payment status')
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
        <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 animate-pulse flex gap-4">
          <div className="w-24 h-24 bg-slate-200 rounded-lg"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  )

  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">Error: {error}</div>

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-slate-900">Show Moderation</h2>
          <p className="text-slate-500 text-sm">Monitor content and manage live events.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'COMPLETED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredShows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-100">
          <p className="text-slate-600 font-medium">No shows found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" style={{ minWidth: '1100px' }}>
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-200">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-200">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-200">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-200">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-200">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-200">
                    Fee
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-200">
                    Finance
                  </th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 border-b border-slate-200">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredShows.map((show) => (
                  <tr key={show.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <a href={`/shows/${show.id}`} target="_blank" rel="noopener noreferrer" className="block w-12 h-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 relative hover:opacity-80 transition-opacity">
                          {show.posterImageUrl ? (
                            <img src={show.posterImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                        </a>
                        <div>
                          <a href={`/shows/${show.id}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors">
                            {show.title}
                          </a>
                          <div className="text-xs text-slate-500 mt-0.5 flex flex-col gap-0.5">
                            <span className="font-medium text-slate-700">
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
                      <div className="text-sm text-slate-900 font-medium">
                        {show.creator.organizerProfile?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {show.creator.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {new Date(show.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">
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
                        className={`text-[10px] font-black uppercase tracking-tight rounded-md px-2 py-1 border transition-colors ${show.isDisbursed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          } focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm`}
                      >
                        <option value="TO_BE_DISBURSED">To Be Disbursed</option>
                        <option value="DISBURSED">Disbursed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {show.isDisbursed ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-slate-700">
                            {show.customPlatformFee ?? 8}%
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded font-black border border-slate-200 uppercase tracking-tighter">FIXED</span>
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
                        className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md border border-blue-100 transition-all uppercase tracking-tight"
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
                              className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight transition-colors border shadow-sm ${show.isPublished
                                ? 'text-orange-600 bg-orange-50 border-orange-100 hover:bg-orange-100'
                                : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
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
                              className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-md text-[10px] font-black uppercase tracking-tight transition-colors disabled:opacity-50 shadow-sm"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter px-2">No Actions</span>
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
            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
          />
          <span className="text-xs text-slate-400">%</span>
        </div>
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? '...' : 'Save'}
          </button>
        )}
      </div>

      {initialFee !== null && initialFee !== undefined && !isDirty && (
        <div className="flex flex-col">
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded font-bold uppercase tracking-tighter">Override</span>
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="text-[9px] text-slate-400 hover:text-red-500 underline mt-0.5 text-left"
          >
            {isSaving ? '...' : 'Reset'}
          </button>
        </div>
      )}
    </div>
  )
}
