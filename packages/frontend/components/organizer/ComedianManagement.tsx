"use client"

import { useState, useEffect } from "react"
import ImageUpload from "@/components/ui/ImageUpload"

interface Comedian {
  id: string
  name: string
  bio?: string
  profileImageUrl?: string
  socialLinks?: any
  promoVideoUrl?: string
  youtubeUrls?: string[]
  instagramUrls?: string[]
  createdAt: string
  creator: {
    email: string
  }
  showComedians?: Array<{
    show: {
      id: string
      title: string
      date: string
    }
  }>
}

interface ComedianManagementProps {
  userId: string
  isVerified: boolean
}

export default function ComedianManagement({ userId, isVerified }: ComedianManagementProps) {
  const [comedians, setComedians] = useState<Comedian[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingComedian, setEditingComedian] = useState<Comedian | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    socialLinks: { instagram: "", twitter: "", youtube: "" },
    promoVideoUrl: "",
    profileImageUrl: "",
    youtubeUrls: [] as string[],
    instagramUrls: [] as string[]
  })

  const [newYoutubeUrl, setNewYoutubeUrl] = useState("")
  const [newInstagramUrl, setNewInstagramUrl] = useState("")

  useEffect(() => {
    fetchComedians()
  }, [])

  const fetchComedians = async () => {
    try {
      const response = await fetch("/api/v1/comedians")
      if (response.ok) {
        const data = await response.json()
        setComedians(data.comedians)
      }
    } catch (error) {
      console.error("Failed to fetch comedians:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingComedian ? `/api/v1/comedians/${editingComedian.id}` : "/api/v1/comedians"
      const method = editingComedian ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchComedians()
        setShowForm(false)
        setEditingComedian(null)
        setFormData({
          name: "",
          bio: "",
          socialLinks: { instagram: "", twitter: "", youtube: "" },
          promoVideoUrl: "",
          profileImageUrl: "",
          youtubeUrls: [],
          instagramUrls: []
        })
        setNewYoutubeUrl("")
        setNewInstagramUrl("")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save comedian")
      }
    } catch (error) {
      alert("An error occurred while saving the comedian")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (comedian: Comedian) => {
    setEditingComedian(comedian)
    setFormData({
      name: comedian.name,
      bio: comedian.bio || "",
      socialLinks: comedian.socialLinks || { instagram: "", twitter: "", youtube: "" },
      promoVideoUrl: comedian.promoVideoUrl || "",
      profileImageUrl: comedian.profileImageUrl || "",
      youtubeUrls: comedian.youtubeUrls || [],
      instagramUrls: comedian.instagramUrls || []
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comedian?")) return

    try {
      const response = await fetch(`/api/v1/comedians/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchComedians()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete comedian")
      }
    } catch (error) {
      alert("An error occurred while deleting the comedian")
    }
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading comedians...</div>
  }

  return (
    <div className="space-y-6">
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Account Verification Required</h3>
          <p className="text-sm text-yellow-700">
            You need to be a verified organizer to manage comedians.
          </p>
        </div>
      )}

      {isVerified && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Comedians</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Comedian
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingComedian ? "Edit Comedian" : "Add New Comedian"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Profile Image
              </label>
              <ImageUpload
                type="comedian"
                currentImage={formData.profileImageUrl}
                onUpload={(url, publicId) => {
                  setFormData(prev => ({ ...prev, profileImageUrl: url }))
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Social Links
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="Instagram URL"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder="Twitter URL"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder="YouTube URL"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => handleSocialLinkChange("youtube", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Promo Video URL
              </label>
              <input
                type="url"
                placeholder="External video URL (YouTube, Vimeo, etc.)"
                value={formData.promoVideoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, promoVideoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Media Library Section */}
            <div className="border-t pt-4">
              <h4 className="text-md font-semibold text-zinc-900 mb-3">Performance Videos (Optional)</h4>
              <p className="text-sm text-zinc-600 mb-3">Add clips of this comedian's performances</p>

              {/* YouTube URLs */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  YouTube Videos
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={newYoutubeUrl}
                    onChange={(e) => setNewYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newYoutubeUrl.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          youtubeUrls: [...prev.youtubeUrls, newYoutubeUrl.trim()]
                        }))
                        setNewYoutubeUrl("")
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
                {formData.youtubeUrls.length > 0 && (
                  <div className="space-y-1">
                    {formData.youtubeUrls.map((url: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-zinc-50 p-2 rounded text-sm">
                        <span className="flex-1 text-zinc-700 truncate">{url}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              youtubeUrls: prev.youtubeUrls.filter((_: string, i: number) => i !== index)
                            }))
                          }}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instagram URLs */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Instagram Reels
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={newInstagramUrl}
                    onChange={(e) => setNewInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/p/... or /reel/..."
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newInstagramUrl.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          instagramUrls: [...prev.instagramUrls, newInstagramUrl.trim()]
                        }))
                        setNewInstagramUrl("")
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
                {formData.instagramUrls.length > 0 && (
                  <div className="space-y-1">
                    {formData.instagramUrls.map((url: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-zinc-50 p-2 rounded text-sm">
                        <span className="flex-1 text-zinc-700 truncate">{url}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              instagramUrls: prev.instagramUrls.filter((_: string, i: number) => i !== index)
                            }))
                          }}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingComedian ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingComedian(null)
                  setFormData({
                    name: "",
                    bio: "",
                    socialLinks: { instagram: "", twitter: "", youtube: "" },
                    promoVideoUrl: "",
                    profileImageUrl: "",
                    youtubeUrls: [],
                    instagramUrls: []
                  })
                  setNewYoutubeUrl("")
                  setNewInstagramUrl("")
                }}
                className="px-4 py-2 bg-zinc-300 text-zinc-700 rounded hover:bg-zinc-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {comedians.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-zinc-600">
            {isVerified ? "No comedians added yet." : "Verify your account to start adding comedians."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comedians.map((comedian) => (
            <div key={comedian.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">{comedian.name}</h3>
              {comedian.bio && (
                <p className="text-zinc-600 text-sm mb-4 line-clamp-3">{comedian.bio}</p>
              )}

              {comedian.showComedians && comedian.showComedians.length > 0 && (
                <p className="text-xs text-zinc-500 mb-4">
                  Featured in {comedian.showComedians.length} show{comedian.showComedians.length > 1 ? 's' : ''}
                </p>
              )}

              {isVerified && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(comedian)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comedian.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
