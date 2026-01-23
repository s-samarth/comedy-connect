"use client"

import { useState, useEffect } from "react"

interface ComedianUser {
    id: string
    email: string
    role: string
    comedianProfile: {
        id: string
        stageName: string
        bio?: string
        contact?: string
        socialLinks?: any
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

export default function ComedianUserManagement() {
    const [comedians, setComedians] = useState<ComedianUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchComedians()
    }, [])

    const fetchComedians = async () => {
        try {
            const response = await fetch("/api/admin/comedian-users")
            if (response.ok) {
                const data = await response.json()
                setComedians(data.comedians || [])
            }
        } catch (error) {
            console.error("Failed to fetch comedians:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = async (comedianId: string, action: 'APPROVE' | 'REJECT' | 'REVOKE') => {
        setActionLoading(comedianId)

        try {
            const response = await fetch("/api/admin/comedian-users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comedianId, action })
            })

            if (response.ok) {
                await fetchComedians() // Refresh the list
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
        return <div className="text-center py-8">Loading comedians...</div>
    }

    return (
        <div className="space-y-6">
            {comedians.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-zinc-600">No comedians have registered yet.</p>
                </div>
            ) : (
                comedians.map((comedian) => (
                    <div key={comedian.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="text-lg font-semibold">{comedian.comedianProfile?.stageName || "Unknown"}</h3>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${comedian.role === 'COMEDIAN_VERIFIED'
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                        {comedian.role === 'COMEDIAN_VERIFIED' ? 'Verified' : 'Pending'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-zinc-600">
                                    <p><strong>Email:</strong> {comedian.email}</p>
                                    {comedian.comedianProfile?.bio && (
                                        <p><strong>Bio:</strong> {comedian.comedianProfile.bio}</p>
                                    )}
                                    {comedian.comedianProfile?.contact && (
                                        <p><strong>Contact:</strong> {comedian.comedianProfile.contact}</p>
                                    )}
                                    <p><strong>Joined:</strong> {new Date(comedian.comedianProfile?.createdAt).toLocaleDateString()}</p>
                                </div>

                                {comedian.comedianProfile?.approvals?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="text-sm font-medium mb-2">Approval History</h4>
                                        <div className="space-y-1">
                                            {comedian.comedianProfile.approvals.map((approval) => (
                                                <div key={approval.id} className="text-xs text-zinc-600">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mr-2 ${approval.status === 'APPROVED'
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

                            <div className="flex gap-2 ml-4">
                                {comedian.role === 'COMEDIAN_UNVERIFIED' && (
                                    <>
                                        <button
                                            onClick={() => handleAction(comedian.id, 'APPROVE')}
                                            disabled={actionLoading === comedian.id}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {actionLoading === comedian.id ? 'Processing...' : 'Verify'}
                                        </button>
                                        <button
                                            onClick={() => handleAction(comedian.id, 'REJECT')}
                                            disabled={actionLoading === comedian.id}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {actionLoading === comedian.id ? 'Processing...' : 'Reject'}
                                        </button>
                                    </>
                                )}
                                {comedian.role === 'COMEDIAN_VERIFIED' && (
                                    <button
                                        onClick={() => handleAction(comedian.id, 'REVOKE')}
                                        disabled={actionLoading === comedian.id}
                                        className="px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        {actionLoading === comedian.id ? 'Processing...' : 'Revoke'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
