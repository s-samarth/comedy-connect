import { requireOrganizer } from "@/lib/auth"
import { isVerifiedOrganizer } from "@/lib/auth"
import Link from "next/link"

export default async function OrganizerPage() {
  const user = await requireOrganizer()
  const isVerified = isVerifiedOrganizer(user.role)

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Organizer Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <p className="text-lg mb-2">Welcome, Organizer!</p>
            <p className="text-zinc-600">Email: {user.email}</p>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isVerified 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {isVerified ? "Verified" : "Pending Verification"}
              </span>
            </div>
          </div>

          {!isVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-800 mb-2">Account Pending Verification</h3>
              <p className="text-sm text-yellow-700">
                Your organizer account is currently pending admin verification. 
                You'll be able to list shows once approved by an administrator.
              </p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/organizer/profile"
                className="block border rounded p-4 hover:bg-zinc-50 transition-colors"
              >
                <h3 className="font-medium mb-2">
                  {isVerified ? "Edit Profile" : "Complete Profile"}
                </h3>
                <p className="text-sm text-zinc-600">
                  {isVerified 
                    ? "Update your organizer information" 
                    : "Submit your profile for verification"
                  }
                </p>
              </Link>
              
              {isVerified ? (
                <>
                  <Link 
                    href="/organizer/shows"
                    className="block border rounded p-4 hover:bg-zinc-50 transition-colors"
                  >
                    <h3 className="font-medium mb-2">Create Show</h3>
                    <p className="text-sm text-zinc-600">List a new comedy show</p>
                  </Link>
                  <Link 
                    href="/organizer/shows"
                    className="block border rounded p-4 hover:bg-zinc-50 transition-colors"
                  >
                    <h3 className="font-medium mb-2">Manage Shows</h3>
                    <p className="text-sm text-zinc-600">View and edit your shows</p>
                  </Link>
                  <Link 
                    href="/organizer/comedians"
                    className="block border rounded p-4 hover:bg-zinc-50 transition-colors"
                  >
                    <h3 className="font-medium mb-2">Manage Comedians</h3>
                    <p className="text-sm text-zinc-600">Create comedian profiles</p>
                  </Link>
                  <div className="border rounded p-4 opacity-50">
                    <h3 className="font-medium mb-2">View Bookings</h3>
                    <p className="text-sm text-zinc-600">Track ticket sales (Coming soon)</p>
                  </div>
                </>
              ) : (
                <div className="col-span-2 border rounded p-4 bg-zinc-50">
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
