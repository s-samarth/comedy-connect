"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import { User, Mail, Star, MapPin, Video, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, X, Search, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface ComedianApplication {
    id: string
    email: string
    role: string
    name?: string
    image?: string
    comedianProfile?: {
        id: string
        stageName: string
        bio?: string
        profileImageUrl?: string
        socialLinks?: any
        customPlatformFee?: number
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

interface IndependentComedian {
    id: string
    name: string
    bio?: string
    profileImageUrl?: string
    socialLinks?: any
    createdAt: string
    creator: {
        email: string
        organizerProfile?: {
            name: string
        }
    }
    _count: {
        showComedians: number
    }
}

export default function ComedianManagement() {
    const [applications, setApplications] = useState<ComedianApplication[]>([])
    const [registry, setRegistry] = useState<IndependentComedian[]>([])
    const [activeTab, setActiveTab] = useState<'applications' | 'registry'>('applications')
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [reviewComedian, setReviewComedian] = useState<ComedianApplication | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (activeTab === 'applications') {
            fetchApplications()
        } else {
            fetchRegistry()
        }
    }, [activeTab])

    const fetchApplications = async () => {
        try {
            setIsLoading(true)
            const data = await api.get<any>("/api/v1/admin/comedian-users")
            setApplications(data.comedians || [])
        } catch (error) {
            console.error("Failed to fetch applications:", error)
            toast.error("Failed to load applications")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRegistry = async () => {
        try {
            setIsLoading(true)
            const data = await api.get<any>("/api/v1/admin/comedians")
            setRegistry(data.comedians || [])
        } catch (error) {
            console.error("Failed to fetch registry:", error)
            toast.error("Failed to load artist registry")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = async (comedianId: string, action: 'APPROVE' | 'REJECT' | 'REVOKE') => {
        setActionLoading(comedianId)
        try {
            await api.post("/api/v1/admin/comedian-users", { comedianId, action })
            toast.success(`Artist status updated: ${action.toLowerCase()}`)
            await fetchApplications()
            setReviewComedian(null)
        } catch (error: any) {
            toast.error(error.message?.replace('API Error:', '').trim() || "Failed to process action")
        } finally {
            setActionLoading(null)
        }
    }

    const handleUpdateFee = async (comedianId: string, customPlatformFee: number) => {
        setActionLoading(comedianId)
        try {
            await api.post("/api/v1/admin/comedian-users", { comedianId, action: 'UPDATE_FEE', customPlatformFee })
            toast.success("Platform fee updated for artist")
            await fetchApplications()
            setReviewComedian(null)
        } catch (error: any) {
            toast.error(error.message?.replace('API Error:', '').trim() || "Failed to update fee")
        } finally {
            setActionLoading(null)
        }
    }

    const filteredApplications = applications.filter(a =>
        a.comedianProfile?.stageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredRegistry = registry.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.creator.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-white/[0.03] p-1 rounded-xl border border-white/[0.05] w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 ${activeTab === 'applications'
                            ? 'bg-primary text-black'
                            : 'text-meta-label hover:text-white'
                            }`}
                    >
                        <FileText size={14} />
                        Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('registry')}
                        className={`flex-1 md:flex-none px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 ${activeTab === 'registry'
                            ? 'bg-primary text-black'
                            : 'text-meta-label hover:text-white'
                            }`}
                    >
                        <Users size={14} />
                        Artist Registry
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-meta-label" size={14} />
                    <input
                        type="text"
                        placeholder="Search artists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:border-primary/30 transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-white/[0.02] border border-white/[0.05] animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : activeTab === 'applications' ? (
                /* Applications View */
                <div className="space-y-6">
                    {filteredApplications.length === 0 ? (
                        <div className="bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl p-16 text-center space-y-4">
                            <User size={32} className="mx-auto text-meta-label" />
                            <p className="text-meta-label font-bold uppercase tracking-widest text-xs">No pending applications found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredApplications.map((comedian) => {
                                const latestApproval = comedian.comedianProfile?.approvals?.[0];
                                const profileUpdatedAt = comedian.comedianProfile?.updatedAt ? new Date(comedian.comedianProfile.updatedAt) : null;
                                const rejectionAt = latestApproval?.status === 'REJECTED' ? new Date(latestApproval.updatedAt) : null;
                                const isRejected = latestApproval?.status === 'REJECTED' && (!profileUpdatedAt || !rejectionAt || profileUpdatedAt <= rejectionAt);

                                return (
                                    <div key={comedian.id} className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-white/[0.1] transition-all duration-300">
                                        <div className="flex flex-col h-full space-y-4 relative z-10">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/[0.05]">
                                                        {(comedian.comedianProfile?.profileImageUrl || comedian.image) ? (
                                                            <img
                                                                src={comedian.comedianProfile?.profileImageUrl || comedian.image}
                                                                alt={comedian.comedianProfile?.stageName || comedian.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                                                                <User size={18} className="text-muted-foreground/20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold italic uppercase tracking-tight text-lg leading-none">
                                                            {comedian.comedianProfile?.stageName || comedian.name || "Anonymous Artist"}
                                                        </h3>
                                                        <p className="text-[11px] font-medium text-meta-label mt-1 uppercase tracking-widest">
                                                            {comedian.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={`font-bold uppercase tracking-widest text-[10px] border-none ${comedian.role === 'COMEDIAN_VERIFIED' ? "bg-emerald-500/10 text-emerald-400" :
                                                    isRejected ? "bg-destructive/10 text-destructive/70" : "bg-primary/10 text-primary"
                                                    }`}>
                                                    {comedian.role === 'COMEDIAN_VERIFIED' ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-body-standard line-clamp-2 leading-relaxed font-medium">
                                                {comedian.comedianProfile?.bio || "No profile bio provided yet."}
                                            </p>

                                            <div className="mt-auto pt-2 flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-1 rounded-lg font-bold uppercase tracking-widest text-[10px] h-9 bg-white/[0.03] hover:bg-white/[0.08]"
                                                    onClick={() => setReviewComedian(comedian)}
                                                >
                                                    Review
                                                </Button>

                                                {comedian.role === 'COMEDIAN_UNVERIFIED' ? (
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 rounded-lg font-bold uppercase tracking-widest text-[10px] h-9 shadow-sm"
                                                        disabled={actionLoading === comedian.id}
                                                        onClick={() => handleAction(comedian.id, 'APPROVE')}
                                                    >
                                                        {isRejected ? 'Verify' : 'Approve'}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="flex-1 rounded-lg font-bold uppercase tracking-widest text-[10px] h-9 opacity-40 hover:opacity-100"
                                                        disabled={actionLoading === comedian.id}
                                                        onClick={() => handleAction(comedian.id, 'REVOKE')}
                                                    >
                                                        Revoke
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* Registry View */
                <div className="space-y-6">
                    {filteredRegistry.length === 0 ? (
                        <div className="bg-white/[0.01] border border-dashed border-white/[0.05] rounded-2xl p-16 text-center space-y-4">
                            <Users size={32} className="mx-auto text-meta-label" />
                            <p className="text-meta-label font-bold uppercase tracking-widest text-xs">No independent artists found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRegistry.map((comedian) => (
                                <div key={comedian.id} className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-white/[0.1] transition-all duration-300">
                                    <div className="flex flex-col h-full space-y-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/[0.05]">
                                                {comedian.profileImageUrl ? (
                                                    <img src={comedian.profileImageUrl} alt={comedian.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                                                        <User size={18} className="text-muted-foreground/20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold italic uppercase tracking-tight text-lg leading-none">{comedian.name}</h3>
                                                <p className="text-[11px] font-medium text-meta-label mt-1 uppercase tracking-widest">
                                                    By: {comedian.creator.organizerProfile?.name || comedian.creator.email.split('@')[0]}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.03]">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-meta-label mb-0.5">Shows</div>
                                                <div className="font-bold text-sm">{comedian._count.showComedians}</div>
                                            </div>
                                            <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.03]">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-meta-label mb-0.5">Joined</div>
                                                <div className="font-bold text-[11px] uppercase">{new Date(comedian.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-body-standard line-clamp-2 leading-relaxed font-medium">
                                            {comedian.bio || "No description available for this registry artist."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {reviewComedian && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-950 border border-white/[0.05] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative anim-enter">
                        <button
                            onClick={() => setReviewComedian(null)}
                            className="absolute top-6 right-6 p-2 hover:bg-white/[0.05] rounded-full transition-colors z-20"
                        >
                            <X className="w-5 h-5 text-muted-foreground/40 hover:text-white" />
                        </button>

                        <div className="p-10 overflow-y-auto custom-scrollbar space-y-10">
                            <div className="flex gap-8 items-start">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/[0.05] shadow-xl">
                                    {(reviewComedian.comedianProfile?.profileImageUrl || reviewComedian.image) ? (
                                        <img src={reviewComedian.comedianProfile?.profileImageUrl || reviewComedian.image} alt="Artist" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-white/[0.05] flex items-center justify-center">
                                            <User size={32} className="text-meta-label" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-4xl font-bold italic uppercase tracking-tight leading-none">
                                            {reviewComedian.comedianProfile?.stageName || reviewComedian.name}
                                        </h3>
                                        <p className="text-primary/60 font-medium uppercase tracking-widest text-xs mt-1">{reviewComedian.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className="bg-primary/10 text-primary border-none uppercase font-bold tracking-widest text-[10px] px-2">Artist</Badge>
                                        <Badge variant="outline" className="border-white/[0.05] text-meta-label uppercase font-bold tracking-widest text-[10px] px-2">{reviewComedian.role.replace('_', ' ')}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="text-[11px] uppercase tracking-widest text-meta-label flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Artist Bio
                                        </h4>
                                        <p className="text-body-standard leading-relaxed text-sm">
                                            {reviewComedian.comedianProfile?.bio || "No professional biography has been provided for this artist."}
                                        </p>
                                    </div>

                                    {reviewComedian.comedianProfile?.approvals && reviewComedian.comedianProfile.approvals.length > 0 && (
                                        <div className="space-y-3 pt-6 border-t border-white/[0.03]">
                                            <h4 className="text-[9px] uppercase tracking-widest text-meta-label">History</h4>
                                            <div className="space-y-2">
                                                {reviewComedian.comedianProfile.approvals.map((approval) => (
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
                                                    id="comedian-fee-input"
                                                    type="number"
                                                    defaultValue={(reviewComedian.comedianProfile as any)?.customPlatformFee ?? 8}
                                                    className="w-full bg-black border border-white/[0.05] rounded-lg px-2 py-1.5 text-xs font-bold focus:border-primary/30 outline-none"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        const val = (document.getElementById('comedian-fee-input') as HTMLInputElement).value;
                                                        handleUpdateFee(reviewComedian.id, parseFloat(val));
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
                                            onClick={() => handleAction(reviewComedian.id, 'APPROVE')}
                                            disabled={actionLoading === reviewComedian.id}
                                        >
                                            Approve Access
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-xl h-10 font-bold uppercase tracking-widest text-xs gap-2"
                                            onClick={() => handleAction(reviewComedian.id, 'REJECT')}
                                            disabled={actionLoading === reviewComedian.id}
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
