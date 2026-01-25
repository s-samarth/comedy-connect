"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  initialData?: any
  isVerified: boolean
  userId: string
}

export default function ComedianProfileForm({ initialData, isVerified, userId }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    stageName: initialData?.stageName || "",
    contact: initialData?.contact || "",
    bio: initialData?.bio || "",
    youtubeUrls: initialData?.youtubeUrls || [],
    instagramUrls: initialData?.instagramUrls || []
  })

  const [newYoutubeUrl, setNewYoutubeUrl] = useState("")
  const [newInstagramUrl, setNewInstagramUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/v1/comedian/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save profile")
      }
    } catch (error) {
      alert("An error occurred while saving your profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const addYoutubeUrl = () => {
    if (newYoutubeUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        youtubeUrls: [...prev.youtubeUrls, newYoutubeUrl.trim()]
      }))
      setNewYoutubeUrl("")
    }
  }

  const removeYoutubeUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      youtubeUrls: prev.youtubeUrls.filter((_: string, i: number) => i !== index)
    }))
  }

  const addInstagramUrl = () => {
    if (newInstagramUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        instagramUrls: [...prev.instagramUrls, newInstagramUrl.trim()]
      }))
      setNewInstagramUrl("")
    }
  }

  const removeInstagramUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instagramUrls: prev.instagramUrls.filter((_: string, i: number) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="stageName" className="block text-sm font-medium text-zinc-700 mb-2">
          Stage Name *
        </label>
        <input
          type="text"
          id="stageName"
          name="stageName"
          required
          value={formData.stageName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your performance name"
        />
      </div>

      <div>
        <label htmlFor="contact" className="block text-sm font-medium text-zinc-700 mb-2">
          Contact Information
        </label>
        <input
          type="text"
          id="contact"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Phone number or email"
        />
      </div>



      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about yourself and your style"
        />
      </div>

      {/* Media Library Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Media Library (Optional)</h3>
        <p className="text-sm text-zinc-600 mb-4">
          Add YouTube videos and Instagram reels to showcase your venue and past events
        </p>

        {/* YouTube URLs */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            YouTube Videos
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={newYoutubeUrl}
              onChange={(e) => setNewYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addYoutubeUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {formData.youtubeUrls.length > 0 && (
            <div className="space-y-2">
              {formData.youtubeUrls.map((url: string, index: number) => (
                <div key={index} className="flex items-center gap-2 bg-zinc-50 p-2 rounded">
                  <span className="flex-1 text-sm text-zinc-700 truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeYoutubeUrl(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
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
              className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addInstagramUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {formData.instagramUrls.length > 0 && (
            <div className="space-y-2">
              {formData.instagramUrls.map((url: string, index: number) => (
                <div key={index} className="flex items-center gap-2 bg-zinc-50 p-2 rounded">
                  <span className="flex-1 text-sm text-zinc-700 truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeInstagramUrl(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : isVerified ? "Update Profile" : "Submit for Verification"}
        </button>
      </div>
    </form>
  )
}
