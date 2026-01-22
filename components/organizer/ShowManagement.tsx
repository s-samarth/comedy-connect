"use client"

import { useState, useEffect } from "react"
import ImageUpload from "@/components/ui/ImageUpload"

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
  creator: {
    email: string
  }
  showComedians: Array<{
    comedian: {
      id: string
      name: string
    }
  }>
  ticketInventory: {
    available: number
  }
  _count: {
    bookings: number
  }
}

interface Comedian {
  id: string
  name: string
}

interface ShowManagementProps {
  userId: string
  isVerified: boolean
}

export default function ShowManagement({ userId, isVerified }: ShowManagementProps) {
  const [shows, setShows] = useState<Show[]>([])
  const [comedians, setComedians] = useState<Comedian[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    ticketPrice: "",
    totalTickets: "",
    comedianIds: [] as string[],
    posterImageUrl: ""
  })

  useEffect(() => {
    Promise.all([fetchShows(), fetchComedians()])
  }, [])

  const fetchShows = async () => {
    try {
      const response = await fetch("/api/shows")
      if (response.ok) {
        const data = await response.json()
        setShows(data.shows)
      }
    } catch (error) {
      console.error("Failed to fetch shows:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComedians = async () => {
    try {
      const response = await fetch("/api/comedians")
      if (response.ok) {
        const data = await response.json()
        setComedians(data.comedians)
      }
    } catch (error) {
      console.error("Failed to fetch comedians:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingShow ? `/api/shows/${editingShow.id}` : "/api/shows"
      const method = editingShow ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          posterImageUrl: formData.posterImageUrl || undefined,
          ticketPrice: parseFloat(formData.ticketPrice),
          totalTickets: parseInt(formData.totalTickets)
        })
      })

      if (response.ok) {
        await fetchShows()
        setShowForm(false)
        setEditingShow(null)
        setFormData({
          title: "",
          description: "",
          date: "",
          venue: "",
          ticketPrice: "",
          totalTickets: "",
          comedianIds: []
        })
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save show")
      }
    } catch (error) {
      alert("An error occurred while saving the show")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (show: Show) => {
    setEditingShow(show)
    setFormData({
      title: show.title,
      description: show.description || "",
      date: new Date(show.date).toISOString().slice(0, 16),
      venue: show.venue,
      ticketPrice: show.ticketPrice.toString(),
      totalTickets: show.totalTickets.toString(),
      comedianIds: show.showComedians.map(sc => sc.comedian.id),
      posterImageUrl: show.posterImageUrl || ""
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this show?")) return

    try {
      const response = await fetch(`/api/shows/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchShows()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete show")
      }
    } catch (error) {
      alert("An error occurred while deleting the show")
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
    return <div className="text-center py-8">Loading shows...</div>
  }

  return (
    <div className="space-y-6">
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Account Verification Required</h3>
          <p className="text-sm text-yellow-700">
            You need to be a verified organizer to manage shows.
          </p>
        </div>
      )}

      {isVerified && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Shows</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Show
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingShow ? "Edit Show" : "Create New Show"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Show Poster
              </label>
              <ImageUpload
                type="show"
                currentImage={formData.posterImageUrl}
                onUpload={(url, publicId) => {
                  setFormData(prev => ({ ...prev, posterImageUrl: url }))
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Venue * (Must include "Hyderabad")
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="e.g., Comedy Club, Hyderabad"
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Ticket Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Total Tickets *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.totalTickets}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalTickets: e.target.value }))}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Comedians
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-zinc-300 rounded-md p-2">
                {comedians.map((comedian) => (
                  <label key={comedian.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.comedianIds.includes(comedian.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            comedianIds: [...prev.comedianIds, comedian.id]
                          }))
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            comedianIds: prev.comedianIds.filter(id => id !== comedian.id)
                          }))
                        }
                      }}
                      className="rounded border-zinc-300"
                    />
                    <span className="text-sm">{comedian.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingShow ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingShow(null)
                  setFormData({
                    title: "",
                    description: "",
                    date: "",
                    venue: "",
                    ticketPrice: "",
                    totalTickets: "",
                    comedianIds: [],
                    posterImageUrl: ""
                  })
                }}
                className="px-4 py-2 bg-zinc-300 text-zinc-700 rounded hover:bg-zinc-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {shows.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-zinc-600">
            {isVerified ? "No shows created yet." : "Verify your account to start creating shows."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {shows.map((show) => (
            <div key={show.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg flex-1">{show.title}</h3>
                {show._count.bookings > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {show._count.bookings} booking{show._count.bookings > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-zinc-600 mb-4">
                <div>{formatDate(show.date)}</div>
                <div>📍 {show.venue}</div>
                <div>🎫 {formatPrice(show.ticketPrice)}</div>
                <div>
                  {show.ticketInventory.available} of {show.totalTickets} tickets available
                </div>
              </div>

              {show.showComedians.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-zinc-700 mb-1">
                    Featuring: {show.showComedians.map(sc => sc.comedian.name).join(", ")}
                  </p>
                </div>
              )}

              {isVerified && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(show)}
                    disabled={show._count.bookings > 0}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(show.id)}
                    disabled={show._count.bookings > 0}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              )}

              {show._count.bookings > 0 && (
                <p className="text-xs text-zinc-500 mt-2">
                  Cannot edit/delete shows with bookings
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
