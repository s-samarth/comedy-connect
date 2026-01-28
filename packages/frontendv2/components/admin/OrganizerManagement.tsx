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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-[2.5rem]" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <p className="text-muted-foreground text-sm font-medium max-w-xl italic">
                    Verify venue credentials, oversee organizer performance, and manage platform commission rates for events.
                </p>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Filter by organizer name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted/20 border border-border rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {filteredOrganizers.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-[2.5rem] p-20 text-center space-y-4">
                    <Building2 size={48} className="mx-auto text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No organizers found in directory</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredOrganizers.map((organizer) => {
                        const latestApproval = organizer.organizerProfile?.approvals?.[0];
                        const profileUpdatedAt = organizer.organizerProfile?.updatedAt ? new Date(organizer.organizerProfile.updatedAt) : null;
                        const rejectionAt = latestApproval?.status === 'REJECTED' ? new Date(latestApproval.updatedAt) : null;
                        const isRejected = latestApproval?.status === 'REJECTED' && (!profileUpdatedAt || !rejectionAt || profileUpdatedAt <= rejectionAt);

                        return (
                            <div key={organizer.id} className="bg-card border border-border rounded-[2.5rem] p-7 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

                                <div className="space-y-6 relative z-10 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg">
                                            <Building2 size={24} className="text-primary" />
                                        </div>
                                        <Badge className={`font-black uppercase tracking-widest text-[9px] ${organizer.role === 'ORGANIZER_VERIFIED' ? "bg-emerald-500/10 text-emerald-600" :
                                            isRejected ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                                            }`}>
                                            {organizer.role === 'ORGANIZER_VERIFIED' ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className="font-black italic uppercase tracking-tighter text-xl leading-none">
                                            {organizer.organizerProfile?.name || "Unknown Organizer"}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 text-muted-foreground font-bold uppercase tracking-tight text-[10px]">
                                            <Mail size={12} />
                                            {organizer.email}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <MapPin size={14} className="text-primary/60" />
                                            <span className="truncate">{organizer.organizerProfile?.venue || "No venue listed"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <Phone size={14} className="text-primary/60" />
                                            <span>{organizer.organizerProfile?.contact || "No contact info"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border flex gap-3 relative z-10">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-11 border-border bg-background hover:bg-muted"
                                        onClick={() => setReviewOrganizer(organizer)}
                                    >
                                        Review Details
                                    </Button>

                                    {organizer.role === 'ORGANIZER_UNVERIFIED' ? (
                                        <Button
                                            size="sm"
                                            className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-11 shadow-lg"
                                            disabled={actionLoading === organizer.id}
                                            onClick={() => handleAction(organizer.id, 'APPROVE')}
                                        >
                                            {isRejected ? 'Verify' : 'Approve'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1 rounded-xl font-black uppercase tracking-widest text-[9px] h-11 text-destructive hover:bg-destructive/5 hover:text-destructive transition-all opacity-40 hover:opacity-100"
                                            disabled={actionLoading === organizer.id}
                                            onClick={() => handleAction(organizer.id, 'REVOKE')}
                                        >
                                            Revoke Access
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Review Modal */}
            {reviewOrganizer && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
                    <div className="bg-card border border-border rounded-[3rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative anim-enter">
                        <button
                            onClick={() => setReviewOrganizer(null)}
                            className="absolute top-8 right-8 p-2 hover:bg-muted rounded-full transition-colors z-20"
                        >
                            <X className="w-6 h-6 text-muted-foreground" />
                        </button>

                        <div className="p-10 md:p-14 overflow-y-auto custom-scrollbar space-y-12">
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                                <div className="w-32 h-32 rounded-[2rem] bg-primary/5 flex items-center justify-center border-4 border-background shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <Building2 size={48} className="text-primary" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                                            {reviewOrganizer.organizerProfile?.name}
                                        </h3>
                                        <p className="text-primary font-bold uppercase tracking-widest text-xs mt-2">{reviewOrganizer.email}</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        <Badge className="bg-primary/10 text-primary uppercase font-black tracking-widest text-[10px] px-3">Organiser Account</Badge>
                                        <Badge variant="outline" className="uppercase font-black tracking-widest text-[10px] px-3">{reviewOrganizer.role.replace('_', ' ')}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="md:col-span-2 space-y-10">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Venue Description
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed font-medium">
                                            {reviewOrganizer.organizerProfile?.description || "No professional description has been provided for this organizer profile."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                Venue Address
                                            </h4>
                                            <p className="text-xs font-black italic uppercase tracking-tight">{reviewOrganizer.organizerProfile?.venue || "N/A"}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                Contact Access
                                            </h4>
                                            <p className="text-xs font-black italic uppercase tracking-tight">{reviewOrganizer.organizerProfile?.contact || "N/A"}</p>
                                        </div>
                                    </div>

                                    {reviewOrganizer.organizerProfile?.approvals && reviewOrganizer.organizerProfile.approvals.length > 0 && (
                                        <div className="space-y-4 pt-4 border-t border-border">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Trail</h4>
                                            <div className="space-y-3">
                                                {reviewOrganizer.organizerProfile.approvals.map((approval) => (
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
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Platform Commission</h4>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    id="custom-fee-input"
                                                    type="number"
                                                    defaultValue={(reviewOrganizer.organizerProfile as any)?.customPlatformFee ?? 8}
                                                    step="0.1"
                                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-black focus:ring-2 focus:ring-primary outline-none"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        const val = (document.getElementById('custom-fee-input') as HTMLInputElement).value;
                                                        handleUpdateFee(reviewOrganizer.id, parseFloat(val));
                                                    }}
                                                    className="rounded-xl h-9 px-4 font-black uppercase tracking-widest text-[9px] shadow-lg"
                                                >
                                                    Update
                                                </Button>
                                            </div>
                                            <p className="text-[9px] text-primary/60 font-bold uppercase tracking-tight italic">Platform baseline is 8%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Console</h4>
                                        <div className="space-y-2">
                                            <Button
                                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl"
                                                onClick={() => handleAction(reviewOrganizer.id, 'APPROVE')}
                                                disabled={actionLoading === reviewOrganizer.id}
                                            >
                                                <CheckCircle2 size={16} /> Approve Application
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] gap-2 border-border"
                                                onClick={() => handleAction(reviewOrganizer.id, 'REJECT')}
                                                disabled={actionLoading === reviewOrganizer.id}
                                            >
                                                <XCircle size={16} /> Mark as Ineligible
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-10 border-t border-border bg-muted/20 flex justify-between items-center mt-auto">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                                Verification Required for platform access
                            </p>
                            <Button
                                variant="ghost"
                                className="rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-muted"
                                onClick={() => setReviewOrganizer(null)}
                            >
                                Dismiss Review
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
