'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

function SetupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const defaultEmail = searchParams.get('email') || ''

    const [email, setEmail] = useState(defaultEmail)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }

        setLoading(true)

        try {
            const data = await apiClient.post<any>('/api/admin-secure/setup', {
                email,
                password,
            })

            router.push('/admin-secure')
        } catch (err: any) {
            setError(err.message?.replace('API Error:', '').trim() || 'Setup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Admin Setup</h1>
                    <p className="text-slate-500 mt-2">Create your secure admin password</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="admin@example.com"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">Must be whitelisted in system config</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Create Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            minLength={8}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Setting up...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function AdminSetupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SetupForm />
        </Suspense>
    )
}
