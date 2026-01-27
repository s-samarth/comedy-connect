"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import { X, MapPin, Phone } from "lucide-react"

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

export default function OrganizerManagement() {
    const [organizers, setOrganizers] = useState<Organizer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [reviewOrganizer, setReviewOrganizer] = useState<Organizer | null>(null)

    useEffect(() => {
        fetchOrganizers()
    }, [])

    const fetchOrganizers = async () => {
        try {
            const data = await api.get<any>("/api/v1/admin/organizers")
            setOrganizers(data.organizers || [])
        } catch (error) {
            console.error("Failed to fetch organizers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = async (organizerId: string, action: 'APPROVE' | 'REJECT' | 'REVOKE') => {
        setActionLoading(organizerId)

        try {
            await api.post("/api/v1/admin/organizers", { organizerId, action })
            await fetchOrganizers() // Refresh the list
            setReviewOrganizer(null) // Close modal if open
        } catch (error: any) {
            alert(error.message?.replace('API Error:', '').trim() || "Failed to process action")
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateFee = async (organizerId: string, customPlatformFee: number) => {
        setActionLoading(organizerId)
        try {
            await api.post("/api/v1/admin/organizers", { organizerId, action: 'UPDATE_FEE', customPlatformFee })
            await fetchOrganizers()
            setReviewOrganizer(null)
        } catch (error: any) {
            alert(error.message?.replace('API Error:', '').trim() || "Failed to update fee")
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
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
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
                <h2 className="text-lg font-medium text-slate-900">Registered Organizers</h2>
                <p className="text-slate-500 text-sm">Review application details and approve valid organizers.</p>
            </div>

            {organizers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-100">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <p className="text-slate-600 font-medium">No organizers found</p>
                    <p className="text-slate-400 text-sm mt-1">Wait for users to sign up as organizers.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizers.map((organizer) => {
                        const latestApproval = organizer.organizerProfile?.approvals?.[0];
                        const profileUpdatedAt = organizer.organizerProfile?.updatedAt ? new Date(organizer.organizerProfile.updatedAt) : null;
                        const rejectionAt = latestApproval?.status === 'REJECTED' ? new Date(latestApproval.updatedAt) : null;

                        const isRejected = latestApproval?.status === 'REJECTED' && (!profileUpdatedAt || !rejectionAt || profileUpdatedAt <= rejectionAt);

                        return (
                            <div key={organizer.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600 font-bold text-lg">{organizer.organizerProfile?.name?.charAt(0) || "?"}</span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${organizer.role === 'ORGANIZER_VERIFIED'
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : isRejected
                                                ? "bg-red-100 text-red-700 border border-red-200"
                                                : "bg-amber-100 text-amber-700 border border-amber-200"
                                            }`}>
                                            {organizer.role === 'ORGANIZER_VERIFIED' ? 'Verified' : isRejected ? 'Rejected' : 'Pending Review'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{organizer.organizerProfile?.name || "Unknown Organizer"}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{organizer.email}</p>

                                    <div className="space-y-2 text-sm text-slate-600 mb-6">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                            <span className="flex-1">{organizer.organizerProfile?.venue || "No venue listed"}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                                            <span className="flex-1">{organizer.organizerProfile?.contact || "No contact info"}</span>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <button
                                        onClick={() => setReviewOrganizer(organizer)}
                                        className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-200"
                                    >
                                        View Full Profile
                                    </button>
                                </div>

                                {/* Quick Actions Footer (Only for pending) */}
                                <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-1 gap-3">
                                    {organizer.role === 'ORGANIZER_UNVERIFIED' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleAction(organizer.id, 'REJECT')}
                                                disabled={actionLoading === organizer.id || isRejected}
                                                className={`py-2 px-3 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors disabled:opacity-50 ${isRejected ? 'hidden' : ''}`}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction(organizer.id, 'APPROVE')}
                                                disabled={actionLoading === organizer.id}
                                                className={`py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 ${isRejected ? 'col-span-2' : ''}`}
                                            >
                                                {isRejected ? 'Reconsider & Verify' : 'Approve'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleAction(organizer.id, 'REVOKE')}
                                            disabled={actionLoading === organizer.id}
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
            {reviewOrganizer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Review Application</h3>
                                <p className="text-sm text-slate-500">Submitted on {reviewOrganizer.organizerProfile?.createdAt ? new Date(reviewOrganizer.organizerProfile.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <button
                                onClick={() => setReviewOrganizer(null)}
                                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600">
                                    {reviewOrganizer.organizerProfile?.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{reviewOrganizer.organizerProfile?.name || "Unknown"}</h4>
                                    <p className="text-slate-500">{reviewOrganizer.email}</p>
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${reviewOrganizer.role === 'ORGANIZER_VERIFIED'
                                        ? "bg-green-100 text-green-700"
                                        : "bg-amber-100 text-amber-700"
                                        }`}>
                                        {reviewOrganizer.role === 'ORGANIZER_VERIFIED' ? 'Verified Account' : 'Pending Verification'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                                    <h5 className="font-semibold text-slate-900 text-sm">Organization Details</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-medium">Venue Address</p>
                                            <p className="text-slate-800">{reviewOrganizer.organizerProfile?.venue || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-medium">Contact Number</p>
                                            <p className="text-slate-800">{reviewOrganizer.organizerProfile?.contact || "Not provided"}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Description</p>
                                        <p className="text-slate-800 mt-1 leading-relaxed">{reviewOrganizer.organizerProfile?.description || "No description provided."}</p>
                                    </div>
                                </div>

                                {/* Custom Platform Fee Setting */}
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                                    <h5 className="font-semibold text-blue-900 text-sm">Platform Fee Settings</h5>
                                    <div className="flex items-end gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-blue-700 uppercase font-medium mb-1">Platform Commission (%)</label>
                                            <input
                                                type="number"
                                                id="custom-fee-input"
                                                defaultValue={(reviewOrganizer.organizerProfile as any)?.customPlatformFee ?? 8}
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const val = (document.getElementById('custom-fee-input') as HTMLInputElement).value;
                                                handleUpdateFee(reviewOrganizer.id, parseFloat(val));
                                            }}
                                            disabled={actionLoading === reviewOrganizer.id}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            Update Fee
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-blue-500">
                                        Default is 8%. This will apply to all platform commissions for this organizer.
                                    </p>
                                </div>

                                {reviewOrganizer.organizerProfile?.approvals && reviewOrganizer.organizerProfile.approvals.length > 0 && (
                                    <div className="border border-slate-100 rounded-xl p-4">
                                        <h5 className="font-semibold text-slate-900 text-sm mb-3">History</h5>
                                        <div className="space-y-2">
                                            {reviewOrganizer.organizerProfile.approvals.map((approval) => (
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
                                onClick={() => setReviewOrganizer(null)}
                                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                            >
                                Close
                            </button>
                            {reviewOrganizer.role === 'ORGANIZER_UNVERIFIED' && (
                                <>
                                    <button
                                        onClick={() => handleAction(reviewOrganizer.id, 'REJECT')}
                                        disabled={actionLoading === reviewOrganizer.id}
                                        className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                                    >
                                        Reject Application
                                    </button>
                                    <button
                                        onClick={() => handleAction(reviewOrganizer.id, 'APPROVE')}
                                        disabled={actionLoading === reviewOrganizer.id}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50"
                                    >
                                        {actionLoading === reviewOrganizer.id ? 'Processing...' : 'Approve Organizer'}
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
