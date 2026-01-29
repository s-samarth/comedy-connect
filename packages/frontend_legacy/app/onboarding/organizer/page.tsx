
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"

export default function OrganizerOnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        venue: "",
        description: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await apiClient.post("/api/v1/organizer/profile", formData)

            router.push("/organizer/pending-verification")
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
                            🎪 Create Your Organizer Profile
                        </h1>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            Tell us about your organization or venue! Your profile will be submitted for admin verification.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Organizer/Venue Name */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Organizer / Venue Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Name of your organization or venue"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-zinc-700 dark:text-white"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the types of shows you organize..."
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-zinc-700 dark:text-white"
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
                                    className="flex-1 w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg rounded-l-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-zinc-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Venue Location */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Venue Location (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.venue}
                                onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                                placeholder="Address or city"
                                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-zinc-700 dark:text-white"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isLoading || !formData.name}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Submitting..." : "Submit for Verification"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
