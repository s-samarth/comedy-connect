"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import { Building2, Mail, MapPin, Phone, ShieldCheck, XCircle, CheckCircle2, AlertTriangle, Users, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchOrganizers()
    }, [])

    const fetchOrganizers = async () => {
        try {
            setIsLoading(true)
            const data = await api.get<any>("/api/v1/admin/organizers")
            setOrganizers(data.organizers || [])
        } catch (error) {
            console.error("Failed to fetch organizers:", error)
            toast.error("Failed to load organizer directory")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = async (organizerId: string, action: 'APPROVE' | 'REJECT' | 'REVOKE') => {
        setActionLoading(organizerId)
        try {
            await api.post("/api/v1/admin/organizers", { organizerId, action })
            toast.success(`Organizer status updated: ${action.toLowerCase()}`)
            await fetchOrganizers()
            setReviewOrganizer(null)
        } catch (error: any) {
            toast.error(error.message?.replace('API Error:', '').trim() || "Failed to process action")
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateFee = async (organizerId: string, customPlatformFee: number) => {
        setActionLoading(organizerId)
        try {
            await api.post("/api/v1/admin/organizers", { organizerId, action: 'UPDATE_FEE', customPlatformFee })
            toast.success("Platform commission updated")
            await fetchOrganizers()
            setReviewOrganizer(null)
        } catch (error: any) {
            toast.error(error.message?.replace('API Error:', '').trim() || "Failed to update fee")
        } finally {
            setActionLoading(null)
        }
    }

    const filteredOrganizers = organizers.filter(o =>
        o.organizerProfile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-white/[0.02] border border-white/[0.05] animate-pulse rounded-2xl" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <p className="text-body-standard text-sm max-w-xl">
                    Verify venue credentials, oversee organizer performance, and manage platform commission rates for events.
                </p>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-meta-label group-focus-within:text-primary transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Filter by organizer name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary/20 transition-all"
                    />
                </div>
            </div>

            {filteredOrganizers.length === 0 ? (
                <div className="bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl p-16 text-center space-y-4">
                    <Building2 size={32} className="mx-auto text-meta-label" />
                    <p className="text-meta-label font-bold uppercase tracking-widest text-xs">No organizers found in directory</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrganizers.map((organizer) => {
                        const latestApproval = organizer.organizerProfile?.approvals?.[0];
                        const profileUpdatedAt = organizer.organizerProfile?.updatedAt ? new Date(organizer.organizerProfile.updatedAt) : null;
                        const rejectionAt = latestApproval?.status === 'REJECTED' ? new Date(latestApproval.updatedAt) : null;
                        const isRejected = latestApproval?.status === 'REJECTED' && (!profileUpdatedAt || !rejectionAt || profileUpdatedAt <= rejectionAt);

                        return (
                            <div key={organizer.id} className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-white/[0.1] transition-all duration-300 flex flex-col">
                                <div className="space-y-4 relative z-10 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                                            <Building2 size={20} className="text-primary/60" />
                                        </div>
                                        <Badge className={`font-bold uppercase tracking-widest text-[10px] border-none ${organizer.role === 'ORGANIZER_VERIFIED' ? "bg-emerald-500/10 text-emerald-400" :
                                            isRejected ? "bg-destructive/10 text-destructive/70" : "bg-primary/10 text-primary"
                                            }`}>
                                            {organizer.role === 'ORGANIZER_VERIFIED' ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className="font-bold italic uppercase tracking-tight text-lg leading-none">
                                            {organizer.organizerProfile?.name || "Unknown Organizer"}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 text-meta-label uppercase tracking-widest text-[11px]">
                                            <Mail size={12} />
                                            {organizer.email}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-meta-label">
                                            <MapPin size={14} className="text-primary/40" />
                                            <span className="truncate">{organizer.organizerProfile?.venue || "No venue listed"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-meta-label">
                                            <Phone size={14} className="text-primary/40" />
                                            <span>{organizer.organizerProfile?.contact || "No contact info"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/[0.03] flex gap-2 relative z-10">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 rounded-lg font-bold uppercase tracking-widest text-[10px] h-9 bg-white/[0.03] hover:bg-white/[0.08]"
                                        onClick={() => setReviewOrganizer(organizer)}
                                    >
                                        Review
                                    </Button>

                                    {organizer.role === 'ORGANIZER_UNVERIFIED' ? (
                                        <Button
                                            size="sm"
                                            className="flex-1 rounded-lg font-bold uppercase tracking-widest text-[10px] h-9 shadow-sm"
                                            disabled={actionLoading === organizer.id}
                                            onClick={() => handleAction(organizer.id, 'APPROVE')}
                                        >
                                            {isRejected ? 'Verify' : 'Approve'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1 rounded-lg font-bold uppercase tracking-widest text-[10px] h-9 opacity-40 hover:opacity-100"
                                            disabled={actionLoading === organizer.id}
                                            onClick={() => handleAction(organizer.id, 'REVOKE')}
                                        >
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {reviewOrganizer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-950 border border-white/[0.05] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative anim-enter">
                        <button
                            onClick={() => setReviewOrganizer(null)}
                            className="absolute top-6 right-6 p-2 hover:bg-white/[0.05] rounded-full transition-colors z-20"
                        >
                            <X className="w-5 h-5 text-muted-foreground/40 hover:text-white" />
                        </button>

                        <div className="p-10 overflow-y-auto custom-scrollbar space-y-10">
                            <div className="flex gap-8 items-start">
                                <div className="w-24 h-24 rounded-2xl bg-white/[0.02] flex items-center justify-center border border-white/[0.05] shadow-xl">
                                    <Building2 size={32} className="text-meta-label" />
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-4xl font-bold italic uppercase tracking-tight leading-none">
                                            {reviewOrganizer.organizerProfile?.name}
                                        </h3>
                                        <p className="text-meta-label uppercase tracking-widest text-xs mt-1">{reviewOrganizer.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className="bg-primary/10 text-primary border-none uppercase font-bold tracking-widest text-[10px] px-2">Account</Badge>
                                        <Badge variant="outline" className="border-white/[0.05] text-meta-label uppercase font-bold tracking-widest text-[10px] px-2">{reviewOrganizer.role.replace('_', ' ')}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="text-[11px] uppercase tracking-widest text-meta-label flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Venue Description
                                        </h4>
                                        <p className="text-body-standard leading-relaxed text-sm">
                                            {reviewOrganizer.organizerProfile?.description || "No professional description has been provided for this organizer profile."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <h4 className="text-[11px] uppercase tracking-widest text-meta-label">Address</h4>
                                            <p className="text-sm font-bold italic uppercase tracking-tight">{reviewOrganizer.organizerProfile?.venue || "N/A"}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <h4 className="text-[11px] uppercase tracking-widest text-meta-label">Contact</h4>
                                            <p className="text-sm font-bold italic uppercase tracking-tight">{reviewOrganizer.organizerProfile?.contact || "N/A"}</p>
                                        </div>
                                    </div>

                                    {reviewOrganizer.organizerProfile?.approvals && reviewOrganizer.organizerProfile.approvals.length > 0 && (
                                        <div className="space-y-3 pt-6 border-t border-white/[0.03]">
                                            <h4 className="text-[9px] uppercase tracking-widest text-meta-label">History</h4>
                                            <div className="space-y-2">
                                                {reviewOrganizer.organizerProfile.approvals.map((approval) => (
                                                    <div key={approval.id} className="flex items-center gap-3 p-2 bg-white/[0.02] border border-white/[0.03] rounded-xl">
                                                        <ShieldCheck className={`w-3.5 h-3.5 ${approval.status === 'APPROVED' ? 'text-emerald-500' : 'text-destructive/50'}`} />
                                                        <div className="text-[11px] font-bold uppercase tracking-tighter">
                                                            {approval.status} <span className="text-meta-label mx-1">/</span> {approval.admin.email}
                                                        </div>
                                                        <div className="text-[10px] text-meta-label ml-auto">{new Date(approval.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white/[0.02] border border-white/[0.03] rounded-2xl p-4 space-y-4">
                                        <div className="space-y-2">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary/60">Platform Fee</h4>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="custom-fee-input"
                                                    type="number"
                                                    defaultValue={(reviewOrganizer.organizerProfile as any)?.customPlatformFee ?? 8}
                                                    step="0.1"
                                                    className="w-full bg-black border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs font-bold focus:border-primary/30 outline-none"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        const val = (document.getElementById('custom-fee-input') as HTMLInputElement).value;
                                                        handleUpdateFee(reviewOrganizer.id, parseFloat(val));
                                                    }}
                                                    className="rounded-lg h-8 px-3 font-bold uppercase tracking-widest text-[10px]"
                                                >
                                                    Set
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90 text-black rounded-xl h-10 font-bold uppercase tracking-widest text-xs gap-2"
                                            onClick={() => handleAction(reviewOrganizer.id, 'APPROVE')}
                                            disabled={actionLoading === reviewOrganizer.id}
                                        >
                                            Approve Access
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full text-meta-label hover:text-destructive hover:bg-destructive/5 rounded-xl h-10 font-bold uppercase tracking-widest text-xs gap-2"
                                            onClick={() => handleAction(reviewOrganizer.id, 'REJECT')}
                                            disabled={actionLoading === reviewOrganizer.id}
                                        >
                                            Deny Submission
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/[0.03] bg-white/[0.01] flex justify-between items-center mt-auto">
                            <p className="text-[11px] text-meta-label uppercase tracking-widest">
                                Verification Terminal
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
