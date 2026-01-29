'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'

interface DeleteAccountModalProps {
    isOpen: boolean
    onClose: () => void
    userRole: string
}

export default function DeleteAccountModal({ isOpen, onClose, userRole }: DeleteAccountModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleDelete = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/v1/profile/delete', {
                method: 'POST'
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to delete account')
                setLoading(false)
                return
            }

            // Success - Sign out and redirect
            await signOut({ callbackUrl: '/' })
        } catch (err) {
            setError('An unexpected error occurred')
            setLoading(false)
        }
    }

    const isVerifiedCreator = userRole === 'ORGANIZER_VERIFIED' || userRole === 'COMEDIAN_VERIFIED'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-xl font-bold">Delete Account</h3>
                </div>

                {error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                ) : (
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6 font-medium">
                        Are you sure you want to delete your account? You will lose all your tickets and preferences. This action is irreversible.
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin text-lg">⏳</span>
                                Deleting...
                            </>
                        ) : (
                            'Confirm Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
