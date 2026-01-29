"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RoleSelectionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const router = useRouter()
    const [selectedRole, setSelectedRole] = useState<"organizer" | "comedian" | null>(null)

    if (!isOpen) return null

    const handleContinue = () => {
        if (selectedRole === "organizer") {
            router.push("/organizer/profile")
        } else if (selectedRole === "comedian") {
            router.push("/onboarding/comedian")
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-2xl w-full mx-4 p-8">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                    Who are you?
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                    Help us understand your role so we can guide you through the right onboarding process.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {/* Organizer Option */}
                    <button
                        onClick={() => setSelectedRole("organizer")}
                        className={`p-6 border-2 rounded-lg transition-all text-left ${selectedRole === "organizer"
                                ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                                : "border-zinc-300 dark:border-zinc-700 hover:border-purple-400"
                            }`}
                    >
                        <div className="text-4xl mb-3">🎪</div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                            I'm an Organiser
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            I organize comedy events, manage venues, and want to list shows on the platform.
                        </p>
                    </button>

                    {/* Comedian Option */}
                    <button
                        onClick={() => setSelectedRole("comedian")}
                        className={`p-6 border-2 rounded-lg transition-all text-left ${selectedRole === "comedian"
                                ? "border-pink-600 bg-pink-50 dark:bg-pink-900/20"
                                : "border-zinc-300 dark:border-zinc-700 hover:border-pink-400"
                            }`}
                    >
                        <div className="text-4xl mb-3">🎤</div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                            I'm a Comedian
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            I'm a stand-up comedian and want to create my profile and list my own shows.
                        </p>
                    </button>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedRole}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
