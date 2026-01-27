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
        customPlatformFee?: number
        createdAt: string
        updatedAt: string
        approvals: Array<{
            id: string
            status: string
            createdAt: string
            updatedAt: string
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
    const [reviewComedian, setReviewComedian] = useState<ComedianUser | null>(null)

    useEffect(() => {
        fetchComedians()
    }, [])

    const fetchComedians = async () => {
        try {
            const response = await fetch("/api/v1/admin/comedian-users", { cache: "no-store" })
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
            const response = await fetch("/api/v1/admin/comedian-users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comedianId, action })
            })

            if (response.ok) {
                await fetchComedians()
                setReviewComedian(null)
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

    const handleUpdateFee = async (comedianId: string, customPlatformFee: number) => {
        setActionLoading(comedianId)
        try {
            const response = await fetch("/api/v1/admin/comedian-users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comedianId, action: 'UPDATE_FEE', customPlatformFee })
            })

            if (response.ok) {
                await fetchComedians()
                setReviewComedian(null)
            } else {
                const error = await response.json()
                alert(error.error || "Failed to update fee")
            }
        } catch (error) {
            alert("An error occurred")
        } finally {
            setActionLoading(null)
        }
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-lg font-medium text-slate-900">Comedian Roster</h2>
                <p className="text-slate-500 text-sm">Verify profiles and manage artist access.</p>
            </div>

            {comedians.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-slate-600 font-medium">No comedians found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comedians.map((comedian) => {
                        const latestApproval = comedian.comedianProfile?.approvals?.[0];
                        const profileUpdatedAt = comedian.comedianProfile?.updatedAt ? new Date(comedian.comedianProfile.updatedAt) : null;
                        const rejectionAt = latestApproval?.status === 'REJECTED' ? new Date(latestApproval.updatedAt) : null;

                        const isRejected = latestApproval?.status === 'REJECTED' && (!profileUpdatedAt || !rejectionAt || profileUpdatedAt <= rejectionAt);

                        return (
                            <div key={comedian.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                                            <span className="text-pink-600 font-bold text-lg">{comedian.comedianProfile?.stageName?.charAt(0) || "?"}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${comedian.role === 'COMEDIAN_VERIFIED'
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : isRejected
                                                ? "bg-red-100 text-red-700 border border-red-200"
                                                : "bg-amber-100 text-amber-700 border border-amber-200"
                                            }`}>
                                            {comedian.role === 'COMEDIAN_VERIFIED' ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{comedian.comedianProfile?.stageName || "Unknown Artist"}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{comedian.email}</p>

                                    <div className="space-y-4 mb-6">
                                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                            {comedian.comedianProfile?.bio || "No bio available."}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setReviewComedian(comedian)}
                                        className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-200"
                                    >
                                        View Full Profile
                                    </button>
                                </div>

                                {/* Quick Actions Footer */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-1 gap-3">
                                    {comedian.role === 'COMEDIAN_UNVERIFIED' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleAction(comedian.id, 'REJECT')}
                                                disabled={actionLoading === comedian.id || isRejected}
                                                className={`py-2 px-3 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 ${isRejected ? 'hidden' : ''}`}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction(comedian.id, 'APPROVE')}
                                                disabled={actionLoading === comedian.id}
                                                className={`py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 ${isRejected ? 'col-span-2' : ''}`}
                                            >
                                                {isRejected ? 'Reconsider & Verify' : 'Verify'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleAction(comedian.id, 'REVOKE')}
                                            disabled={actionLoading === comedian.id}
                                            className="py-2 px-3 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
                                        >
                                            Revoke Status
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Review Modal */}
            {reviewComedian && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Comedian Profile</h3>
                                <p className="text-sm text-slate-500">Joined {new Date(reviewComedian.comedianProfile?.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => setReviewComedian(null)}
                                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-pink-600">
                                    {reviewComedian.comedianProfile?.stageName?.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{reviewComedian.comedianProfile?.stageName}</h4>
                                    <p className="text-slate-500">{reviewComedian.email}</p>
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${reviewComedian.role === 'COMEDIAN_VERIFIED'
                                        ? "bg-green-100 text-green-700"
                                        : "bg-amber-100 text-amber-700"
                                        }`}>
                                        {reviewComedian.role === 'COMEDIAN_VERIFIED' ? 'Verified Status' : 'Pending Verification'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <h5 className="font-semibold text-slate-900 text-sm">Artist Details</h5>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Bio</p>
                                        <p className="text-slate-800 mt-1 leading-relaxed whitespace-pre-wrap">{reviewComedian.comedianProfile?.bio || "No bio provided."}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Contact</p>
                                        <p className="text-slate-800">{reviewComedian.comedianProfile?.contact || "Not provided"}</p>
                                    </div>
                                </div>

                                {/* Custom Platform Fee Setting */}
                                <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl space-y-3">
                                    <h5 className="font-semibold text-pink-900 text-sm">Artist Payout Settings</h5>
                                    <div className="flex items-end gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-pink-700 uppercase font-medium mb-1">Platform Commission (%)</label>
                                            <input
                                                type="number"
                                                id="comedian-fee-input"
                                                defaultValue={(reviewComedian.comedianProfile as any)?.customPlatformFee ?? 8}
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                className="w-full px-3 py-2 bg-white border border-pink-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const val = (document.getElementById('comedian-fee-input') as HTMLInputElement).value;
                                                handleUpdateFee(reviewComedian.id, parseFloat(val));
                                            }}
                                            disabled={actionLoading === reviewComedian.id}
                                            className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            Update Fee
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-pink-500 italic">
                                        Setting a custom fee here overrides the platform default for this specific artist.
                                    </p>
                                </div>

                                {reviewComedian.comedianProfile?.approvals?.length > 0 && (
                                    <div className="border border-slate-100 rounded-xl p-4">
                                        <h5 className="font-semibold text-slate-900 text-sm mb-3">History</h5>
                                        <div className="space-y-2">
                                            {reviewComedian.comedianProfile.approvals.map((approval) => (
                                                <div key={approval.id} className="flex items-center text-sm gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${approval.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    <span className="font-medium text-slate-700">{approval.status}</span>
                                                    <span className="text-slate-400">by {approval.admin.email}</span>
                                                    <span className="text-slate-400 ml-auto">{new Date(approval.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setReviewComedian(null)}
                                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                            >
                                Close
                            </button>
                            {reviewComedian.role === 'COMEDIAN_UNVERIFIED' && (
                                <>
                                    <button
                                        onClick={() => handleAction(reviewComedian.id, 'REJECT')}
                                        disabled={actionLoading === reviewComedian.id}
                                        className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(reviewComedian.id, 'APPROVE')}
                                        disabled={actionLoading === reviewComedian.id}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm disabled:opacity-50"
                                    >
                                        {actionLoading === reviewComedian.id ? 'Processing...' : 'Verify Artist'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
