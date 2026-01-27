'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api/client'
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
                const data = await api.get<any>('/api/v1/admin/check-session')

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
                // setError('Failed to verify admin access')
                // Often 401/403 means just not auth to admin password yet, so we show prompt
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
        <div className="min-h-screen bg-zinc-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-green-700">Admin Dashboard</h1>
                        <p className="text-lg font-semibold text-green-600 mt-2">Manage the platform</p>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Organizer Management Section */}
                    <section id="organizers" className="scroll-mt-24">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">Organizers</span>
                            Review & Approvals
                        </h2>
                        <OrganizerManagement />
                    </section>

                    <hr className="border-slate-200" />

                    {/* Comedian Management Section */}
                    <section id="comedians" className="scroll-mt-24">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded">Comedians</span>
                            Review & Directory
                        </h2>
                        <ComedianManagement />
                    </section>

                    <hr className="border-slate-200" />

                    {/* Show Management Section */}
                    <section id="shows" className="scroll-mt-24">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded">Shows</span>
                            Moderation & Finance
                        </h2>
                        <ShowManagement />
                    </section>

                    <hr className="border-slate-200" />

                    {/* Platform Configuration Section */}
                    <section id="fees" className="scroll-mt-24">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-800 text-sm px-2 py-1 rounded">Platform Fees</span>
                            Revenue Configuration
                        </h2>
                        <FeeManagement />
                    </section>
                </div>
            </div>
        </div>
    )
}
