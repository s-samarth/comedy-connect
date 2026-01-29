import { requireAdmin } from "@/lib/auth"
import FeeManagement from "@/components/admin/FeeManagement"

export default async function AdminFeesPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Fee Configuration</h1>
          <a href="/admin" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>

        <FeeManagement />
      </div>
    </div>
  )
}
