'use client'

import { useState, useEffect } from 'react'

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
  status?: 'ACTIVE' | 'DISABLED' // Optional since not in DB schema
  creator: {
    email: string
    organizerProfile?: {
      name: string
    }
  }
  _count: {
    bookings: number
  }
}

export function ShowManagement() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchShows()
  }, [])

  const fetchShows = async () => {
    try {
      const response = await fetch('/api/admin/shows')
      if (!response.ok) throw new Error('Failed to fetch shows')
      
      const data = await response.json()
      setShows(data.shows || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load shows')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (showId: string, currentStatus?: string) => {
    setActionLoading(showId)
    
    try {
      const newStatus = currentStatus === 'DISABLED' ? 'ACTIVE' : 'DISABLED'
      const response = await fetch('/api/admin/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId, action: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update show status')
      
      await fetchShows() // Refresh list
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update show status')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div className="text-center py-8">Loading shows...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div className="space-y-6">
      {shows.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-zinc-600">No shows have been created yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Show Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Date & Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {shows.map((show) => (
                <tr key={show.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-zinc-900">
                        {show.title}
                      </div>
                      <div className="text-sm text-zinc-500">
                        ₹{show.ticketPrice} • {show.totalTickets} tickets • {show._count.bookings} booked
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-900">
                      {show.creator.organizerProfile?.name || show.creator.email}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {show.creator.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-900">
                      {new Date(show.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {show.venue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      show.status !== 'DISABLED' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {show.status === 'DISABLED' ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleToggleStatus(show.id, show.status)}
                      disabled={actionLoading === show.id}
                      className={`px-3 py-1 rounded text-white text-sm ${
                        show.status !== 'DISABLED'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      } disabled:opacity-50`}
                    >
                      {actionLoading === show.id 
                        ? 'Processing...' 
                        : show.status !== 'DISABLED' 
                          ? 'Disable' 
                          : 'Enable'
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
