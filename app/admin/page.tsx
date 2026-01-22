import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminPage() {
  const user = await requireAdmin()

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg mb-4">Welcome, Admin!</p>
          <p className="text-zinc-600">
            Email: {user.email}
          </p>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/admin/organizers"
                className="block border rounded p-4 hover:bg-zinc-50 transition-colors"
              >
                <h3 className="font-medium mb-2">Manage Organizers</h3>
                <p className="text-sm text-zinc-600">Approve or reject organizer applications</p>
              </Link>
              <div className="border rounded p-4 opacity-50">
                <h3 className="font-medium mb-2">Configure Fees</h3>
                <p className="text-sm text-zinc-600">Set platform commission rates (Coming soon)</p>
              </div>
              <div className="border rounded p-4 opacity-50">
                <h3 className="font-medium mb-2">View Shows</h3>
                <p className="text-sm text-zinc-600">Manage comedy show listings (Coming soon)</p>
              </div>
              <div className="border rounded p-4 opacity-50">
                <h3 className="font-medium mb-2">View Bookings</h3>
                <p className="text-sm text-zinc-600">Monitor ticket sales and revenue (Coming soon)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
