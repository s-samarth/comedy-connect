import { getCurrentUser, requireOrganizer, isVerifiedOrganizer } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProfileForm from "@/components/organizer/ProfileForm"
import { redirect } from "next/navigation"

export default async function OrganizerProfilePage() {
  const user = await requireOrganizer()
  const isVerified = isVerifiedOrganizer(user.role)

  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    include: {
      approvals: {
        include: {
          admin: {
            select: { email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Organizer Profile</h1>
          <a href="/organizer" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
                }`}>
                {isVerified ? "Verified" : "Pending Verification"}
              </span>
              <p className="text-sm text-zinc-600">
                Email: {user.email}
              </p>
            </div>
          </div>

          {!isVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-800 mb-2">Verification Required</h3>
              <p className="text-sm text-yellow-700">
                Complete your profile below and submit for admin verification.
                You'll be able to list shows once approved.
              </p>
            </div>
          )}

          <ProfileForm
            initialData={profile}
            isVerified={isVerified}
            userId={user.id}
          />

          {profile?.approvals && profile.approvals.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Verification History</h3>
              <div className="space-y-2">
                {profile.approvals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${approval.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : approval.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {approval.status}
                      </span>
                      <span className="ml-2 text-sm text-zinc-600">
                        by Admin
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
