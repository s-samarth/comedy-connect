"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface DashboardStats {
    totalShows: number
    upcomingShows: number
    ticketsSold: number
    upcomingShowsList: Array<{
        id: string
        title: string
        date: string
        venue: string
        ticketPrice: number
        ticketsAvailable: number
        totalTickets: number
        bookingsCount: number
    }>
}

export default function DashboardOverview() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch("/api/organizer/dashboard")
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            } else {
                setError("Failed to load dashboard statistics")
            }
        } catch (err) {
            setError("An error occurred while loading dashboard")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price)
    }

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-zinc-600">Loading dashboard...</p>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800">{error || "Failed to load dashboard"}</p>
                <button
                    onClick={fetchDashboardStats}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                    <h3 className="text-sm font-medium text-zinc-600 uppercase tracking-wide">
                        Total Shows
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-zinc-900">{stats.totalShows}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
                    <h3 className="text-sm font-medium text-zinc-600 uppercase tracking-wide">
                        Upcoming Shows
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-zinc-900">{stats.upcomingShows}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
                    <h3 className="text-sm font-medium text-zinc-600 uppercase tracking-wide">
                        Tickets Sold
                    </h3>
                    <p className="mt-2 text-3xl font-bold text-zinc-900">{stats.ticketsSold}</p>
                </div>
            </div>

            {/* Upcoming Shows List */}
            {stats.upcomingShowsList.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-zinc-200">
                        <h3 className="text-lg font-semibold text-zinc-900">Upcoming Shows</h3>
                        <p className="text-sm text-zinc-600 mt-1">Next {stats.upcomingShowsList.length} shows scheduled</p>
                    </div>
                    <div className="divide-y divide-zinc-200">
                        {stats.upcomingShowsList.map((show) => (
                            <div key={show.id} className="p-6 hover:bg-zinc-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-zinc-900">{show.title}</h4>
                                        <div className="mt-2 space-y-1 text-sm text-zinc-600">
                                            <div>📅 {formatDate(show.date)}</div>
                                            <div>📍 {show.venue}</div>
                                            <div>🎫 {formatPrice(show.ticketPrice)}</div>
                                        </div>
                                    </div>
                                    <div className="ml-4 text-right">
                                        <div className="text-sm text-zinc-600">
                                            <div className="font-medium">
                                                {show.ticketsAvailable} / {show.totalTickets} available
                                            </div>
                                            {show.bookingsCount > 0 && (
                                                <div className="mt-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs inline-block">
                                                    {show.bookingsCount} booking{show.bookingsCount > 1 ? 's' : ''}
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            href={`/organizer/shows`}
                                            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Manage →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats.upcomingShowsList.length === 0 && stats.totalShows > 0 && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 text-center">
                    <p className="text-zinc-600">No upcoming shows. All your shows have passed.</p>
                    <Link
                        href="/organizer/shows"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Create New Show
                    </Link>
                </div>
            )}

            {stats.totalShows === 0 && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">🎭</div>
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">No shows yet</h3>
                    <p className="text-zinc-600 mb-6">Get started by creating your first comedy show</p>
                    <Link
                        href="/organizer/shows"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Create Your First Show
                    </Link>
                </div>
            )}
        </div>
    )
}
