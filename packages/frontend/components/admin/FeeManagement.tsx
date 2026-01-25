"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"

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

  // State for adding new slab
  const [isAddingMode, setIsAddingMode] = useState(false)

  useEffect(() => {
    fetchFeeConfig()
  }, [])

  const fetchFeeConfig = async () => {
    try {
      const data = await apiClient.get<any>("/api/v1/admin/fees")
      if (data?.feeConfig) {
        setFeeConfig(data.feeConfig)
        setFormData(data.feeConfig.slabs)
      }
    } catch (error) {
      console.error("Failed to fetch fee config:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const data = await apiClient.post<any>("/api/v1/admin/fees", { slabs: formData })
      setFeeConfig(data.feeConfig)
    } catch (error: any) {
      alert(error.message?.replace('API Error:', '').trim() || "Failed to update fee configuration")
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-32 bg-slate-100 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Platform Revenue Settings</h2>
          <p className="text-slate-500 text-sm">Configure dynamic booking fees based on ticket price slabs.</p>
        </div>
        {feeConfig && (
          <div className="text-right">
            <p className="text-xs text-slate-400">Last updated</p>
            <p className="text-sm font-medium text-slate-700">{new Date(feeConfig.lastUpdated).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">Active Booking Fee Slabs For Ticket Prices(Per Ticket Cost)</h3>
          <button
            type="button"
            onClick={addSlab}
            className="text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors shadow-sm"
          >
            + Add Tier
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="divide-y divide-slate-100">
            {formData.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No fee slabs configured. Add a tier to start collecting fees.
              </div>
            ) : (
              formData.map((slab, index) => (
                <div key={index} className="p-6 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-start gap-6">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Min Price (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={slab.minPrice}
                            onChange={(e) => updateSlab(index, 'minPrice', parseFloat(e.target.value))}
                            className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Max Price (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={slab.maxPrice}
                            onChange={(e) => updateSlab(index, 'maxPrice', parseFloat(e.target.value))}
                            className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Platform Fee
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={Number((slab.fee * 100).toFixed(1))}
                            onChange={(e) => updateSlab(index, 'fee', parseFloat(e.target.value) / 100)}
                            className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <span className="absolute right-3 text-slate-400 font-medium">%</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Applies to range ₹{slab.minPrice} - ₹{slab.maxPrice}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSlab(index)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6 opacity-0 group-hover:opacity-100"
                      aria-label="Remove slab"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              )}
              {isSaving ? "Saving Changes..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
