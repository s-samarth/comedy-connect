"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import ShowCard from "./ShowCard"

interface Show {
  id: string
  title: string
  description?: string
  date: string
  venue: string
  ticketPrice: number
  totalTickets: number
  posterImageUrl?: string
  durationMinutes?: number
  createdAt: string
  creator: {
    email: string
  }
  showComedians: Array<{
    comedian: {
      id: string
      name: string
      bio?: string
      profileImageUrl?: string
    }
  }>
  ticketInventory: {
    available: number
  }
  _count: {
    bookings: number
  }
}

interface ShowDiscoveryProps {
  user?: any
}

export default function ShowDiscovery({ user }: ShowDiscoveryProps) {
  const [shows, setShows] = useState<Show[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateFilter: "all",
    priceFilter: "all",
    venueFilter: ""
  })

  useEffect(() => {
    fetchShows()
  }, [])

  const fetchShows = async () => {
    try {
      const response = await fetch("/api/v1/shows?mode=discovery")
      if (response.ok) {
        const data = await response.json()
        setShows(data.shows)
        if (data.isMockData) {
          console.log('Showing mock comedy shows data')
        }
      }
    } catch (error) {
      console.error("Failed to fetch shows:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredShows = shows.filter(show => {
    const showDate = new Date(show.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Date filter
    if (filters.dateFilter === "today") {
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)
      if (showDate < today || showDate > todayEnd) return false
    } else if (filters.dateFilter === "week") {
      const weekFromNow = new Date(today)
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      if (showDate > weekFromNow) return false
    } else if (filters.dateFilter === "month") {
      const monthFromNow = new Date(today)
      monthFromNow.setMonth(monthFromNow.getMonth() + 1)
      if (showDate > monthFromNow) return false
    }

    // Price filter
    if (filters.priceFilter === "under200" && show.ticketPrice >= 200) return false
    if (filters.priceFilter === "200to400" && (show.ticketPrice < 200 || show.ticketPrice > 400)) return false
    if (filters.priceFilter === "over400" && show.ticketPrice <= 400) return false

    // Venue filter
    if (filters.venueFilter && !show.venue.toLowerCase().includes(filters.venueFilter.toLowerCase())) {
      return false
    }

    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-zinc-600">Loading shows...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Filter Shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Date
            </label>
            <select
              value={filters.dateFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFilter: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shows</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Price Range
            </label>
            <select
              value={filters.priceFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, priceFilter: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="under200">Under ₹200</option>
              <option value="200to400">₹200 - ₹400</option>
              <option value="over400">Over ₹400</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Venue
            </label>
            <input
              type="text"
              placeholder="Search venue..."
              value={filters.venueFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, venueFilter: e.target.value }))}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Shows Grid */}
      {filteredShows.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">No Shows Found</h3>
          <p className="text-zinc-600">
            {shows.length === 0
              ? "No comedy shows scheduled yet. Check back soon!"
              : "Try adjusting your filters to see more shows."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShows.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              href={`/shows/${show.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
