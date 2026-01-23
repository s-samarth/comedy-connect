import { requireComedian } from "@/lib/auth"
import { isVerifiedComedian } from "@/lib/auth"
import Link from "next/link"

export default async function ComedianPage() {
    const user = await requireComedian()
    const isVerified = isVerifiedComedian(user.role)

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Comedian Dashboard</h1>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-lg font-medium mb-1">Welcome back!</p>
                            <p className="text-zinc-600">Email: {user.email}</p>
                        </div>
                        <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                                }`}>
                                {isVerified ? "Verified" : "Pending Verification"}
                            </span>
                        </div>
                    </div>

                    {!isVerified && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-medium text-yellow-800 mb-2">Account Pending Verification</h3>
                            <p className="text-sm text-yellow-700">
                                Your comedian profile is currently pending admin verification.
                                You'll be able to create shows once approved.
                            </p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            href="/profile"
                            className="block border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 hover:border-pink-300 transition-colors"
                        >
                            <h3 className="font-medium mb-2">
                                {isVerified ? "Edit Profile" : "Complete Profile"}
                            </h3>
                            <p className="text-sm text-zinc-600">
                                {isVerified
                                    ? "Update your bio, photos, and media links"
                                    : "Submit your profile for verification"
                                }
                            </p>
                        </Link>

                        {isVerified && (
                            <Link
                                href="/organizer/shows"
                                className="block border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 hover:border-pink-300 transition-colors"
                            >
                                <h3 className="font-medium mb-2">My Shows</h3>
                                <p className="text-sm text-zinc-600">Create and manage your shows</p>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
