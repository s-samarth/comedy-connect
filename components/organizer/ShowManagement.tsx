"use client"

import { useState, useEffect } from "react"
import ImageUpload from "@/components/ui/ImageUpload"

interface Show {
  id: string
  title: string
  description?: string
  date: string
  venue: string
  googleMapsLink: string
  ticketPrice: number
  totalTickets: number
  posterImageUrl?: string
  youtubeUrls?: string[]
  instagramUrls?: string[]
  createdAt: string
  creator: {
    email: string
  }
  showComedians: Array<{
    comedian: {
      id: string
      name: string
      youtubeUrls?: string[]
      instagramUrls?: string[]
    }
  }>
  ticketInventory: {
    available: number
  }
  isPublished: boolean
  _count: {
    bookings: number
  }
  stats?: {
    ticketsSold: number
    revenue: number
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
    googleMapsLink: "",
    ticketPrice: "",
    totalTickets: "",
    posterImageUrl: "",
    youtubeUrls: [] as string[],
    instagramUrls: [] as string[]
  })
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all")

  const filteredShows = shows.filter(show => {
    const showDate = new Date(show.date)
    const now = new Date()
    if (filter === "upcoming") return showDate >= now
    if (filter === "past") return showDate < now
    return true
  })

  useEffect(() => {
    Promise.all([fetchShows(), fetchComedians()])
  }, [])

  const fetchShows = async () => {
    try {
      // Fetch only shows created by the current user (manage mode)
      const response = await fetch("/api/shows?mode=manage")
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
      // Capture any pending URLs in the inputs
      const ytInput = document.getElementById('newYoutubeUrl') as HTMLInputElement;
      const igInput = document.getElementById('newInstagramUrl') as HTMLInputElement;

      let currentYoutubeUrls = [...formData.youtubeUrls];
      let currentInstagramUrls = [...formData.instagramUrls];

      if (ytInput && ytInput.value.trim()) {
        currentYoutubeUrls.push(ytInput.value.trim());
        ytInput.value = ""; // Clear input after capturing
      }

      if (igInput && igInput.value.trim()) {
        currentInstagramUrls.push(igInput.value.trim());
        igInput.value = ""; // Clear input after capturing
      }

      const url = editingShow ? `/api/shows/${editingShow.id}` : "/api/shows"
      const method = editingShow ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          youtubeUrls: currentYoutubeUrls,
          instagramUrls: currentInstagramUrls,
          posterImageUrl: formData.posterImageUrl || undefined,
          ticketPrice: parseInt(formData.ticketPrice),
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
          googleMapsLink: "",
          ticketPrice: "",
          totalTickets: "",
          posterImageUrl: "",
          youtubeUrls: [],
          instagramUrls: []
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
      googleMapsLink: (show as any).googleMapsLink || "",
      ticketPrice: show.ticketPrice.toString(),
      totalTickets: show.totalTickets.toString(),
      posterImageUrl: show.posterImageUrl || "",
      youtubeUrls: show.youtubeUrls || [],
      instagramUrls: show.instagramUrls || []
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

  const handlePublish = async (id: string) => {
    if (!confirm("Are you sure you want to publish this show? It will become visible to the audience.")) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/shows/${id}/publish`, {
        method: "POST"
      })

      if (response.ok) {
        await fetchShows()
        alert("Show published successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to publish show")
      }
    } catch (error) {
      alert("An error occurred while publishing the show")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnpublish = async (id: string) => {
    if (!confirm("Are you sure you want to unpublish this show? It will be hidden from the audience.")) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/shows/${id}/unpublish`, {
        method: "POST"
      })

      if (response.ok) {
        await fetchShows()
        alert("Show unpublished successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to unpublish show")
      }
    } catch (error) {
      alert("An error occurred while unpublishing the show")
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
                Venue *
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

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Google Maps Link *
              </label>
              <input
                type="url"
                required
                value={formData.googleMapsLink}
                onChange={(e) => setFormData(prev => ({ ...prev, googleMapsLink: e.target.value }))}
                placeholder="https://maps.app.goo.gl/..."
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
                  step="1"
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

            {/* Comedians Checkbox Removed as per requirement */}

            {/* Social Media Links */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-zinc-900 mb-4">Show Social Media (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    YouTube Video URL
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      id="newYoutubeUrl"
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('newYoutubeUrl') as HTMLInputElement;
                        if (input.value.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            youtubeUrls: [...prev.youtubeUrls, input.value.trim()]
                          }));
                          input.value = "";
                        }
                      }}
                      className="px-3 py-1 bg-zinc-600 text-white rounded hover:bg-zinc-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.youtubeUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between bg-zinc-50 p-2 rounded text-xs">
                        <span className="truncate flex-1">{url}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            youtubeUrls: prev.youtubeUrls.filter((_, i) => i !== index)
                          }))}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Instagram Reel URL
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      id="newInstagramUrl"
                      placeholder="https://instagram.com/reel/..."
                      className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('newInstagramUrl') as HTMLInputElement;
                        if (input.value.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            instagramUrls: [...prev.instagramUrls, input.value.trim()]
                          }));
                          input.value = "";
                        }
                      }}
                      className="px-3 py-1 bg-zinc-600 text-white rounded hover:bg-zinc-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.instagramUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between bg-zinc-50 p-2 rounded text-xs">
                        <span className="truncate flex-1">{url}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            instagramUrls: prev.instagramUrls.filter((_, i) => i !== index)
                          }))}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
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
                    googleMapsLink: "",
                    ticketPrice: "",
                    totalTickets: "",
                    posterImageUrl: "",
                    youtubeUrls: [],
                    instagramUrls: []
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
        <>
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-full ${filter === "all" ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-700"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1 text-sm rounded-full ${filter === "upcoming" ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-700"
                }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-3 py-1 text-sm rounded-full ${filter === "past" ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-700"
                }`}
            >
              Past
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredShows.map((show) => (
              <div key={show.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{show.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${show.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}>
                        {show.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  {show._count.bookings > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {show._count.bookings} booking{show._count.bookings > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-zinc-600 mb-4">
                  <div>📅 {formatDate(show.date)}</div>
                  <div>📍 {show.venue}</div>
                  <div>🎫 {formatPrice(show.ticketPrice)}</div>
                  <div>
                    🎟️ {show.ticketInventory.available} of {show.totalTickets} tickets available
                  </div>
                  {show.stats && (
                    <div className="flex justify-between items-center bg-zinc-50 p-2 rounded text-zinc-800 border border-zinc-200 mt-2">
                      <div>
                        <span className="font-bold text-lg">{show.stats.ticketsSold}</span>{' '}
                        <span className="text-xs text-zinc-500 uppercase">Sold</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg text-green-600">{formatPrice(show.stats.revenue)}</span>{' '}
                        <span className="text-xs text-zinc-500 uppercase">Rev</span>
                      </div>
                    </div>
                  )}
                  {((show.youtubeUrls && show.youtubeUrls.length > 0) || (show.instagramUrls && show.instagramUrls.length > 0)) && (
                    <div className="flex gap-3 pt-2 text-xs font-medium">
                      {show.youtubeUrls && show.youtubeUrls.length > 0 && (
                        <span className="text-red-600">📹 {show.youtubeUrls.length} Video{show.youtubeUrls.length > 1 ? 's' : ''}</span>
                      )}
                      {show.instagramUrls && show.instagramUrls.length > 0 && (
                        <span className="text-pink-600">📱 {show.instagramUrls.length} Reel{show.instagramUrls.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  )}
                </div>

                {
                  show.showComedians.length > 0 && (
                    <div className="mb-4 border-t pt-2">
                      <p className="text-sm font-medium text-zinc-700 mb-2">Comedian Lineup:</p>
                      <div className="space-y-2">
                        {show.showComedians.map(sc => (
                          <div key={sc.comedian.id} className="bg-zinc-50 p-2 rounded">
                            <p className="font-medium text-sm">{sc.comedian.name}</p>
                            {((sc.comedian.youtubeUrls && sc.comedian.youtubeUrls.length > 0) ||
                              (sc.comedian.instagramUrls && sc.comedian.instagramUrls.length > 0)) && (
                                <div className="mt-1 flex gap-2 text-xs">
                                  {sc.comedian.youtubeUrls && sc.comedian.youtubeUrls.length > 0 && (
                                    <span className="text-red-600 flex items-center gap-1">
                                      📹 {sc.comedian.youtubeUrls.length} Video{sc.comedian.youtubeUrls.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {sc.comedian.instagramUrls && sc.comedian.instagramUrls.length > 0 && (
                                    <span className="text-pink-600 flex items-center gap-1">
                                      📱 {sc.comedian.instagramUrls.length} Reel{sc.comedian.instagramUrls.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                  <a href={`/comedians/${sc.comedian.id}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-600 hover:underline">
                                    View Profile
                                  </a>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                {isVerified && (
                  <div className="flex gap-2 mt-4 pt-4 border-t flex-wrap items-center">
                    {!show.isPublished ? (
                      <>
                        <button
                          onClick={() => handlePublish(show.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => handleEdit(show)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(show.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-zinc-500 italic flex items-center gap-1">
                        🔒 Published - Actions disabled
                      </span>
                    )}
                    {show._count.bookings > 0 && !show.isPublished && (
                      <span className="ml-auto text-xs text-zinc-500 self-center">
                        Locked (has bookings)
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )
      }
    </div >
  )
}
