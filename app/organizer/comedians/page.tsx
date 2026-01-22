import { requireOrganizer, isVerifiedOrganizer } from "@/lib/auth"
import ComedianManagement from "@/components/organizer/ComedianManagement"

export default async function OrganizerComediansPage() {
  const user = await requireOrganizer()
  const isVerified = isVerifiedOrganizer(user.role)

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Comedian Management</h1>
          <a href="/organizer" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>

        <ComedianManagement userId={user.id} isVerified={isVerified} />
      </div>
    </div>
  )
}
