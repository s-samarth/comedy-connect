"use client"

import { useState, useEffect } from "react"

interface Organizer {
  id: string
  email: string
  role: string
  organizerProfile: {
    id: string
    name: string
    contact?: string
    description?: string
    venue?: string
    createdAt: string
    approvals: Array<{
      id: string
      status: string
      createdAt: string
      admin: {
        email: string
      }
    }>
  }
}

export default function OrganizerManagement() {
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchOrganizers()
  }, [])

  const fetchOrganizers = async () => {
    try {
      const response = await fetch("/api/admin/organizers")
      if (response.ok) {
        const data = await response.json()
        setOrganizers(data.organizers)
      }
    } catch (error) {
      console.error("Failed to fetch organizers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (organizerId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(organizerId)
    
    try {
      const response = await fetch("/api/admin/organizers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerId, action })
      })

      if (response.ok) {
        await fetchOrganizers() // Refresh the list
      } else {
        const error = await response.json()
        alert(error.error || "Failed to process action")
      }
    } catch (error) {
      alert("An error occurred while processing your request")
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading organizers...</div>
  }

  return (
    <div className="space-y-6">
      {organizers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-zinc-600">No organizers have registered yet.</p>
        </div>
      ) : (
        organizers.map((organizer) => (
          <div key={organizer.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">{organizer.organizerProfile.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    organizer.role === 'ORGANIZER_VERIFIED'
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {organizer.role === 'ORGANIZER_VERIFIED' ? 'Verified' : 'Pending'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-zinc-600">
                  <p><strong>Email:</strong> {organizer.email}</p>
                  {organizer.organizerProfile.contact && (
                    <p><strong>Contact:</strong> {organizer.organizerProfile.contact}</p>
                  )}
                  {organizer.organizerProfile.venue && (
                    <p><strong>Venue:</strong> {organizer.organizerProfile.venue}</p>
                  )}
                  {organizer.organizerProfile.description && (
                    <p><strong>Description:</strong> {organizer.organizerProfile.description}</p>
                  )}
                  <p><strong>Applied:</strong> {new Date(organizer.organizerProfile.createdAt).toLocaleDateString()}</p>
                </div>

                {organizer.organizerProfile.approvals.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Approval History</h4>
                    <div className="space-y-1">
                      {organizer.organizerProfile.approvals.map((approval) => (
                        <div key={approval.id} className="text-xs text-zinc-600">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mr-2 ${
                            approval.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : approval.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {approval.status}
                          </span>
                          by {approval.admin.email} on {new Date(approval.createdAt).toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {organizer.role === 'ORGANIZER_UNVERIFIED' && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAction(organizer.id, 'APPROVE')}
                    disabled={actionLoading === organizer.id}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === organizer.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(organizer.id, 'REJECT')}
                    disabled={actionLoading === organizer.id}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === organizer.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
