import { requireAuth } from "@/lib/auth"
import Link from "next/link"

export default async function PendingVerificationPage() {
    const user = await requireAuth()

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 max-w-md text-center">
                <div className="text-6xl mb-6">⏳</div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                    Profile Submitted!
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                    Your comedian profile has been submitted for admin verification.
                    You'll be able to list shows once your profile is approved.
                </p>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>What's next?</strong><br />
                        Our admin team will review your profile shortly. Once approved,
                        you'll be able to create and publish your own shows.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/shows"
                        className="block border border-zinc-300 dark:border-zinc-600 px-6 py-3 rounded-lg font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Browse Shows
                    </Link>
                </div>
            </div>
        </div>
    )
}
