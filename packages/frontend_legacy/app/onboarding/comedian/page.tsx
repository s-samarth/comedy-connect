"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"

export default function ComedianOnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        stageName: "",
        bio: "",
        contact: "",
        instagram: "",
        twitter: "",
        youtube: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await apiClient.post("/api/v1/comedian/profile", {
                stageName: formData.stageName,
                bio: formData.bio,
                contact: formData.contact,
                socialLinks: {
                    instagram: formData.instagram,
                    twitter: formData.twitter,
                    youtube: formData.youtube
                }
            })

            // Redirect to pending verification page
            router.push("/comedian/pending-verification")
        } catch (error: any) {
            alert(error.message?.replace('API Error:', '').trim() || "Failed to create profile")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                            🎤 Create Your Comedian Profile
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Tell us about yourself! Your profile will be submitted for admin verification before you can list shows.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Stage Name */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Stage Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.stageName}
                                onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                                placeholder="Your performance name"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-zinc-700 dark:text-white"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Bio
                            </label>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Tell us about your comedy style, experience, and what makes you unique..."
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-zinc-700 dark:text-white"
                            />
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Contact Number * (10 digits)
                            </label>
                            <div className="flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 sm:text-sm">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    required
                                    value={formData.contact}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '')
                                        if (val.length <= 10) setFormData(prev => ({ ...prev, contact: val }))
                                    }}
                                    pattern="[0-9]{10}"
                                    maxLength={10}
                                    placeholder="9876543210"
                                    className="flex-1 w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg rounded-l-none focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-zinc-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                                Social Media (Optional)
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                        Instagram
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.instagram}
                                        onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                                        placeholder="@yourhandle"
                                        className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-zinc-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                        Twitter/X
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.twitter}
                                        onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                                        placeholder="@yourhandle"
                                        className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-zinc-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                        YouTube
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.youtube}
                                        onChange={(e) => setFormData(prev => ({ ...prev, youtube: e.target.value }))}
                                        placeholder="Channel URL or @handle"
                                        className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-zinc-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading || !formData.stageName}
                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Submitting..." : "Submit for Verification"}
                            </button>
                        </div>

                        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                            <p>
                                After submitting, an admin will review your profile. You'll be notified once you're verified and can start listing shows.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
