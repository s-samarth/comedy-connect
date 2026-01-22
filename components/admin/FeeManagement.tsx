"use client"

import { useState, useEffect } from "react"

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
      const response = await fetch("/api/admin/fees")
      if (response.ok) {
        const data = await response.json()
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
      const response = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slabs: formData })
      })

      if (response.ok) {
        const data = await response.json()
        setFeeConfig(data.feeConfig)
        alert("Fee configuration updated successfully!")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update fee configuration")
      }
    } catch (error) {
      alert("An error occurred while updating fee configuration")
    } finally {
      setIsSaving(false)
    }
  }

  const addSlab = () => {
    setFormData([...formData, {
      minPrice: 0,
      maxPrice: 100,
      fee: 0.05
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

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading fee configuration...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Platform Fee Configuration</h2>
        
        {feeConfig && (
          <div className="mb-6 p-4 bg-zinc-50 rounded">
            <p className="text-sm text-zinc-600">
              Last updated: {new Date(feeConfig.lastUpdated).toLocaleString()} by {feeConfig.updatedBy}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fee Slabs</h3>
            
            {formData.map((slab, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Slab {index + 1}</h4>
                  {formData.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlab(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Min Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={slab.minPrice}
                      onChange={(e) => updateSlab(index, 'minPrice', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Max Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={slab.maxPrice}
                      onChange={(e) => updateSlab(index, 'maxPrice', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Fee (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.001"
                      value={slab.fee}
                      onChange={(e) => updateSlab(index, 'fee', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="text-sm text-zinc-600">
                  Fee: {formatPercentage(slab.fee)} for prices ₹{slab.minPrice} - ₹{slab.maxPrice === Infinity ? '∞' : slab.maxPrice}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={addSlab}
              className="px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-700"
            >
              Add Slab
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
