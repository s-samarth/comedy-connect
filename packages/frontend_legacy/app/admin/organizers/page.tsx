import { requireAdmin } from "@/lib/auth"
import OrganizerManagement from "@/components/admin/OrganizerManagement"

export default async function AdminOrganizersPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Organizer Management</h1>
          <a href="/admin" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>

        <OrganizerManagement />
      </div>
    </div>
  )
}
