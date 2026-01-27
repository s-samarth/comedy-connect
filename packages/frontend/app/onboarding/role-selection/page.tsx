import { requireAuth } from "@/lib/auth"
import Link from "next/link"

export default async function RoleSelectionPage() {
    const user = await requireAuth()

    // If user already has a role, redirect them
    if (user.role.startsWith("ORGANIZER")) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Already Registered</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        You're already registered as an organizer.
                    </p>
                    <Link
                        href="/organizer"
                        className="block text-center bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
                    >
                        Go to Organizer Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Check for profile completion
    const isProfileComplete = user.name && user.phone && user.city && user.age;

    if (!isProfileComplete) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Profile Incomplete</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        Please complete your basic profile (Age, Phone, City) before registering as an Organizer or Comedian.
                    </p>
                    <Link
                        href="/onboarding"
                        className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Complete Your Profile
                    </Link>
                    <p className="mt-4 text-sm text-zinc-500">
                        <Link href="/" className="hover:underline">Back to Home</Link>
                    </p>
                </div>
            </div>
        )
    }

    if (user.role.startsWith("COMEDIAN")) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Already Registered</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        You're already registered as a comedian.
                    </p>
                    <Link
                        href="/comedian"
                        className="block text-center bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700"
                    >
                        Go to Comedian Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl max-w-4xl w-full p-8">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 text-center">
                    Choose Your Role
                </h1>
                <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12">
                    Tell us who you are so we can set up your profile correctly
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Organizer Card */}
                    <Link
                        href="/onboarding/organizer"
                        className="group p-8 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-purple-600 hover:shadow-xl transition-all"
                    >
                        <div className="text-6xl mb-4 text-center">🎪</div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 text-center">
                            I'm an Organiser
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                            I organize comedy events, manage venues, and want to list shows on the platform.
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Create and manage comedy shows
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Add comedian profiles for your events
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Track ticket sales and bookings
                            </li>
                        </ul>
                        <div className="text-center">
                            <span className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold group-hover:bg-purple-700 transition-colors">
                                Get Started →
                            </span>
                        </div>
                    </Link>

                    {/* Comedian Card */}
                    <Link
                        href="/onboarding/comedian"
                        className="group p-8 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-pink-600 hover:shadow-xl transition-all"
                    >
                        <div className="text-6xl mb-4 text-center">🎤</div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 text-center">
                            I'm a Comedian
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">
                            I'm a stand-up comedian and want to create my profile and list my own shows.
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Build your comedian profile
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                List and promote your own shows
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Connect with your audience
                            </li>
                        </ul>
                        <div className="text-center">
                            <span className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold group-hover:bg-pink-700 transition-colors">
                                Get Started →
                            </span>
                        </div>
                    </Link>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
