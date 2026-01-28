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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex bg-muted/30 p-1 rounded-2xl border border-border w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === 'applications'
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        <FileText size={14} />
                        Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('registry')}
                        className={`flex-1 md:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === 'registry'
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'hover:bg-muted text-muted-foreground'
                            }`}
                    >
                        <Users size={14} />
                        Artist Registry
                    </button>
                </div>

                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search artists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted/20 border border-border rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-muted animate-pulse rounded-[2.5rem]" />
                    ))}
                </div>
            ) : activeTab === 'applications' ? (
                /* Applications View */
                <div className="space-y-8">
                    {filteredApplications.length === 0 ? (
                        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
                            <User size={48} className="mx-auto text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No pending applications found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredApplications.map((comedian) => {
                                const latestApproval = comedian.comedianProfile?.approvals?.[0];
                                const profileUpdatedAt = comedian.comedianProfile?.updatedAt ? new Date(comedian.comedianProfile.updatedAt) : null;
                                const rejectionAt = latestApproval?.status === 'REJECTED' ? new Date(latestApproval.updatedAt) : null;
                                const isRejected = latestApproval?.status === 'REJECTED' && (!profileUpdatedAt || !rejectionAt || profileUpdatedAt <= rejectionAt);

                                return (
                                    <div key={comedian.id} className="bg-card border border-border rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

                                        <div className="flex flex-col h-full space-y-6 relative z-10">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
                                                        {(comedian.comedianProfile?.profileImageUrl || comedian.image) ? (
                                                            <img
                                                                src={comedian.comedianProfile?.profileImageUrl || comedian.image}
                                                                alt={comedian.comedianProfile?.stageName || comedian.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                                <User size={24} className="text-muted-foreground opacity-20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black italic uppercase tracking-tighter text-lg leading-none">
                                                            {comedian.comedianProfile?.stageName || comedian.name || "Anonymous Artist"}
                                                        </h3>
                                                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                                                            {comedian.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={`font-black uppercase tracking-widest text-[9px] ${comedian.role === 'COMEDIAN_VERIFIED' ? "bg-emerald-500/10 text-emerald-600" :
                                                    isRejected ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                                                    }`}>
                                                    {comedian.role === 'COMEDIAN_VERIFIED' ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                                                </Badge>
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                                                {comedian.comedianProfile?.bio || "No profile bio provided yet."}
                                            </p>

                                            <div className="mt-auto pt-4 flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-10 border-border hover:bg-muted"
                                                    onClick={() => setReviewComedian(comedian)}
                                                >
                                                    Review Profile
                                                </Button>

                                                {comedian.role === 'COMEDIAN_UNVERIFIED' ? (
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-10 shadow-lg"
                                                        disabled={actionLoading === comedian.id}
                                                        onClick={() => handleAction(comedian.id, 'APPROVE')}
                                                    >
                                                        {isRejected ? 'Verify' : 'Approve'}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-10 opacity-40 hover:opacity-100"
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
                <div className="space-y-8">
                    {filteredRegistry.length === 0 ? (
                        <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
                            <Users size={48} className="mx-auto text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No independent artists found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredRegistry.map((comedian) => (
                                <div key={comedian.id} className="bg-card border border-border rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

                                    <div className="flex flex-col h-full space-y-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
                                                {comedian.profileImageUrl ? (
                                                    <img src={comedian.profileImageUrl} alt={comedian.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                                        <User size={24} className="text-muted-foreground opacity-20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-black italic uppercase tracking-tighter text-lg leading-none">{comedian.name}</h3>
                                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                                                    Created By: {comedian.creator.organizerProfile?.name || comedian.creator.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/30 rounded-xl p-3 border border-border">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Shows</div>
                                                <div className="font-black text-sm">{comedian._count.showComedians}</div>
                                            </div>
                                            <div className="bg-muted/30 rounded-xl p-3 border border-border">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Registered</div>
                                                <div className="font-black text-[10px] uppercase">{new Date(comedian.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                                            {comedian.bio || "No description available for this registry artist."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Application Review Modal (reused from previous version) */}
            {reviewComedian && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
                    <div className="bg-card border border-border rounded-[3rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative anim-enter">
                        <button
                            onClick={() => setReviewComedian(null)}
                            className="absolute top-8 right-8 p-2 hover:bg-muted rounded-full transition-colors z-20"
                        >
                            <X className="w-6 h-6 text-muted-foreground" />
                        </button>

                        <div className="p-10 md:p-14 overflow-y-auto custom-scrollbar space-y-12">
                            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                                <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-background shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    {(reviewComedian.comedianProfile?.profileImageUrl || reviewComedian.image) ? (
                                        <img src={reviewComedian.comedianProfile?.profileImageUrl || reviewComedian.image} alt="Artist" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <User size={48} className="text-muted-foreground opacity-20" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                                            {reviewComedian.comedianProfile?.stageName || reviewComedian.name}
                                        </h3>
                                        <p className="text-primary font-bold uppercase tracking-widest text-xs mt-2">{reviewComedian.email}</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        <Badge className="bg-primary/10 text-primary uppercase font-black tracking-widest text-[10px] px-3">Artist Roster</Badge>
                                        <Badge variant="outline" className="uppercase font-black tracking-widest text-[10px] px-3">{reviewComedian.role.replace('_', ' ')}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="md:col-span-2 space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Artist Manifesto
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed font-medium">
                                            {reviewComedian.comedianProfile?.bio || "No professional biography has been provided for this artist."}
                                        </p>
                                    </div>

                                    {reviewComedian.comedianProfile?.approvals && reviewComedian.comedianProfile.approvals.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t border-border">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Audit Trail</h4>
                                            <div className="space-y-3">
                                                {reviewComedian.comedianProfile.approvals.map((approval) => (
                                                    <div key={approval.id} className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-2xl">
                                                        <ShieldCheck className={`w-4 h-4 ${approval.status === 'APPROVED' ? 'text-emerald-500' : 'text-destructive'}`} />
                                                        <div className="text-[10px] font-bold uppercase">
                                                            {approval.status} <span className="text-muted-foreground mx-1">/</span> {approval.admin.email}
                                                        </div>
                                                        <div className="text-[9px] text-muted-foreground ml-auto">{new Date(approval.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 space-y-6">
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Commission Rate</h4>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="comedian-fee-input"
                                                    type="number"
                                                    defaultValue={(reviewComedian.comedianProfile as any)?.customPlatformFee ?? 8}
                                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-black focus:ring-2 focus:ring-primary outline-none"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        const val = (document.getElementById('comedian-fee-input') as HTMLInputElement).value;
                                                        handleUpdateFee(reviewComedian.id, parseFloat(val));
                                                    }}
                                                    className="rounded-xl h-9 px-4 font-black uppercase tracking-widest text-[9px] shadow-lg"
                                                >
                                                    Set
                                                </Button>
                                            </div>
                                            <p className="text-[9px] text-primary/60 font-bold uppercase tracking-tight">Standard platform rate is 8%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Console</h4>
                                        <div className="space-y-2">
                                            <Button
                                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl"
                                                onClick={() => handleAction(reviewComedian.id, 'APPROVE')}
                                                disabled={actionLoading === reviewComedian.id}
                                            >
                                                <CheckCircle2 size={16} /> Approve Access
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] gap-2 border-border"
                                                onClick={() => handleAction(reviewComedian.id, 'REJECT')}
                                                disabled={actionLoading === reviewComedian.id}
                                            >
                                                <XCircle size={16} /> Deny Submission
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 border-t border-border bg-muted/20 flex justify-between items-center mt-auto">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Profile Review Dashboard
                            </p>
                            <Button
                                variant="ghost"
                                className="rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-muted"
                                onClick={() => setReviewComedian(null)}
                            >
                                Dismiss
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
