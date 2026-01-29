'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { AdminPasswordPrompt } from "@/components/admin/AdminPasswordPrompt"
import OrganizerManagement from "@/components/admin/OrganizerManagement"
import ComedianManagement from "@/components/admin/ComedianManagement"
import { ShowManagement } from "@/components/admin/ShowManagement"
import FeeManagement from "@/components/admin/FeeManagement"
import Link from "next/link"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if admin password session exists
    const checkSession = async () => {
      try {
        const data = await apiClient.get<any>('/api/v1/admin/check-session')

        if (data.needsPasswordSetup) {
          setNeedsPasswordSetup(true)
          setIsLoading(false)
        } else if (data.authenticated) {
          setIsAuthenticated(true)
          setIsLoading(false)
        } else if (data.error === 'not_admin') {
          // User is authenticated but not an admin
          setError('You need admin privileges to access this page.')
          setIsLoading(false)
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        setError('Failed to verify admin access')
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium mb-2">Access Denied</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-red-500 text-xs mt-4">
            Please ensure you have admin privileges and your email is whitelisted.
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <AdminPasswordPrompt
        onVerified={() => setIsAuthenticated(true)}
        needsSetup={needsPasswordSetup}
      />
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-700">Admin Panel</h1>
            <p className="text-lg font-semibold text-green-600 mt-2">You are now in the Admin Panel</p>
          </div>
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Site
          </a>
        </div>
        <p className="text-zinc-600 mb-8">Internal administration interface - authorized access only</p>

        <div className="space-y-8">
          {/* Organizer Management Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Organizer Management</h2>
            <OrganizerManagement />
          </section>

          {/* Comedian Management Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Comedian Management</h2>
            <ComedianManagement />
          </section>

          {/* Show Management Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Show Management</h2>
            <ShowManagement />
          </section>

          {/* Platform Configuration Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Platform Configuration</h2>
            <FeeManagement />
          </section>
        </div>
      </div>
    </div>
  )
}
