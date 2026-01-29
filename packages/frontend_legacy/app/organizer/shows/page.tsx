import { requireShowCreator, isVerifiedShowCreator } from "@/lib/auth"
import ShowManagement from "@/components/organizer/ShowManagement"

export default async function OrganizerShowsPage() {
  const user = await requireShowCreator()
  const isVerified = isVerifiedShowCreator(user.role)

  // Determine correct dashboard based on role
  const dashboardUrl = user.role.startsWith('COMEDIAN') ? '/comedian' : '/organizer'

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Show Management</h1>
          <a href={dashboardUrl} className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>

        <ShowManagement userId={user.id} isVerified={isVerified} />
      </div>
    </div>
  )
}
