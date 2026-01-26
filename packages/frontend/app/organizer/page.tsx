import { requireOrganizer } from "@/lib/auth"
import { isVerifiedOrganizer } from "@/lib/auth"
import Link from "next/link"
import DashboardOverview from "@/components/organizer/DashboardOverview"

export default async function OrganizerPage() {
  const user = await requireOrganizer()
  const isVerified = isVerifiedOrganizer(user.role)

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Organizer Dashboard</h1>

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
                  Your organizer account is currently pending admin verification.
                  You'll be able to list shows once approved by an administrator.
                </p>
              </div>
            )}
          </div>

          {/* Dashboard Overview - only for verified organizers */}
          {isVerified && (
            <div className="mb-6">
              <DashboardOverview />
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/organizer/profile"
                className="block border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 hover:border-blue-300 transition-colors"
              >
                <h3 className="font-medium mb-2">
                  {isVerified ? "Edit Profile" : "Complete Profile"}
                </h3>
                <p className="text-sm text-zinc-600">
                  {isVerified
                    ? "Update your organizer information and media"
                    : "Submit your profile for verification"
                  }
                </p>
              </Link>

              {isVerified ? (
                <>
                  <Link
                    href="/organizer/shows"
                    className="block border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 hover:border-blue-300 transition-colors"
                  >
                    <h3 className="font-medium mb-2">Manage Shows</h3>
                    <p className="text-sm text-zinc-600">Create and manage your comedy shows</p>
                  </Link>
                </>
              ) : (
                <div className="col-span-2 border border-zinc-200 rounded-lg p-4 bg-zinc-50">
                  <h3 className="font-medium mb-2">Complete Profile</h3>
                  <p className="text-sm text-zinc-600">
                    Submit your organizer profile for verification to start listing shows
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
