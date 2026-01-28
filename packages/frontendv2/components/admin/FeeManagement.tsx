"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import { Trash2, Loader2, DollarSign, Info, ShieldAlert, BadgePercent, TrendingUp, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface FeeSlab {
    minPrice: number
    maxPrice: number
    fee: number
}

interface FeeConfig {
    slabs: FeeSlab[]
    lastUpdated: string
    updatedBy: string
}

export default function FeeManagement() {
    const [feeConfig, setFeeConfig] = useState<FeeConfig | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState<FeeSlab[]>([])

    useEffect(() => {
        fetchFeeConfig()
    }, [])

    const fetchFeeConfig = async () => {
        try {
            setIsLoading(true)
            const data = await api.get<any>("/api/v1/admin/fees")
            if (data?.feeConfig) {
                setFeeConfig(data.feeConfig)
                setFormData(data.feeConfig.slabs)
            }
        } catch (error) {
            console.error("Failed to fetch fee config:", error)
            toast.error("Failed to load fee configuration")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const data = await api.post<any>("/api/v1/admin/fees", { slabs: formData })
            setFeeConfig(data.feeConfig)
            toast.success("Platform revenue settings updated")
        } catch (error: any) {
            toast.error(error.message?.replace('API Error:', '').trim() || "Failed to update configuration")
        } finally {
            setIsSaving(false)
        }
    }

    const addSlab = () => {
        setFormData([...formData, {
            minPrice: 0,
            maxPrice: 9999,
            fee: 0.10 // 10% default
        }])
    }

    const removeSlab = (index: number) => {
        setFormData(formData.filter((_, i) => i !== index))
    }

    const updateSlab = (index: number, field: keyof FeeSlab, value: number) => {
        const updated = [...formData]
        updated[index] = { ...updated[index], [field]: value }
        setFormData(updated)
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="h-24 bg-muted animate-pulse rounded-[2.5rem]" />
                <div className="h-96 bg-muted animate-pulse rounded-[2.5rem]" />
            </div>
        )
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium italic max-w-xl">
                        Design dynamic revenue structures through price-based commission slabs. Automated per-ticket handling for the entire ecosystem.
                    </p>
                </div>
                {feeConfig && (
                    <div className="flex items-center gap-3 bg-muted/30 border border-border px-4 py-2 rounded-2xl">
                        <Clock size={14} className="text-muted-foreground" />
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Last Modified <span className="text-primary ml-1">{new Date(feeConfig.lastUpdated).toLocaleDateString()}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Explainer / Warning */}
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BadgePercent size={120} className="text-primary" />
                </div>
                <div className="bg-background/80 p-4 rounded-3xl border border-primary/20">
                    <ShieldAlert size={28} className="text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                    <h3 className="font-black italic uppercase tracking-tighter text-lg">Platform Revenue Governance</h3>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-2xl">
                        Adjusting these parameters will immediately affect the platform's cut from all upcoming transactions. Always ensure slabs are continuous and do not overlap to prevent billing logic anomalies.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="bg-card border border-border rounded-[3rem] shadow-2xl overflow-hidden">
                    <div className="p-8 md:p-10 bg-muted/10 border-b border-border flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <TrendingUp className="text-primary" size={20} />
                            <h3 className="font-black italic uppercase tracking-tighter text-xl">Dynamic Commission Tiers</h3>
                        </div>
                        <Button
                            type="button"
                            onClick={addSlab}
                            className="rounded-xl font-black uppercase tracking-widest text-[9px] h-10 px-6 gap-2 bg-background border border-border text-foreground hover:bg-muted shadow-lg"
                        >
                            <Plus size={14} /> Add Revenue Tier
                        </Button>
                    </div>

                    <div className="divide-y divide-border">
                        {formData.length === 0 ? (
                            <div className="py-24 text-center space-y-4">
                                <DollarSign size={40} className="mx-auto text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No active revenue slabs found</p>
                            </div>
                        ) : (
                            formData.map((slab, index) => (
                                <div key={index} className="px-8 md:px-12 py-10 hover:bg-primary/5 transition-all duration-500 group">
                                    <div className="flex flex-col md:flex-row items-end gap-8">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    Min Ticket Price (₹)
                                                </label>
                                                <div className="relative group/input">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black italic text-primary/40 group-focus-within/input:text-primary transition-colors italic">₹</div>
                                                    <input
                                                        type="number"
                                                        value={slab.minPrice}
                                                        onChange={(e) => updateSlab(index, 'minPrice', parseFloat(e.target.value))}
                                                        className="w-full bg-background border border-border rounded-2xl pl-10 pr-4 py-4 text-sm font-black italic focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    Max Ticket Price (₹)
                                                </label>
                                                <div className="relative group/input">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black italic text-primary/40 group-focus-within/input:text-primary transition-colors italic">₹</div>
                                                    <input
                                                        type="number"
                                                        value={slab.maxPrice}
                                                        onChange={(e) => updateSlab(index, 'maxPrice', parseFloat(e.target.value))}
                                                        className="w-full bg-background border border-border rounded-2xl pl-10 pr-4 py-4 text-sm font-black italic focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                    Platform Commission (%)
                                                </label>
                                                <div className="relative group/input">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={Number((slab.fee * 100).toFixed(1))}
                                                        onChange={(e) => updateSlab(index, 'fee', parseFloat(e.target.value) / 100)}
                                                        className="w-full bg-primary/5 border border-primary/20 rounded-2xl pl-4 pr-10 py-4 text-sm font-black italic text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black italic text-primary/40">%</div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSlab(index)}
                                            className="h-14 w-14 rounded-2xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive opacity-40 group-hover:opacity-100 transition-all border border-transparent hover:border-destructive/10"
                                        >
                                            <Trash2 size={20} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-10 md:p-12 bg-muted/20 border-t border-border flex justify-between items-center">
                        <div className="flex items-center gap-4 text-muted-foreground opacity-60">
                            <Info size={16} />
                            <p className="text-[10px] font-black uppercase tracking-widest italic">Changes take effect globally on save</p>
                        </div>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 shadow-2xl bg-primary text-primary-foreground hover:scale-105 transition-transform gap-3"
                        >
                            {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <DollarSign size={16} />}
                            {isSaving ? "Synchronizing..." : "Save Configuration"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
