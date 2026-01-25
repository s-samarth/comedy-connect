'use client'

import { useState } from 'react'

export function DatabaseCleanup() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleCleanup = async () => {
    const confirmed = window.confirm(
      '⚠️ This will permanently delete ALL user data except admin users. Are you absolutely sure?'
    )
    
    if (!confirmed) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/cleanup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ ${data.message}`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleCleanup}
        disabled={isLoading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Cleaning up...' : '🧹 Clean Database'}
      </button>
      
      {result && (
        <div className={`p-3 rounded text-sm ${result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result}
        </div>
      )}
      
      <div className="text-xs text-zinc-500 mt-2">
        <p>• Deletes all non-admin users</p>
        <p>• Removes all shows, comedians, bookings</p>
        <p>• Preserves admin accounts</p>
        <p>• Use for development testing only</p>
      </div>
    </div>
  )
}
