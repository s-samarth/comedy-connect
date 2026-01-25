'use client'

import { useState } from 'react'

interface AdminPasswordPromptProps {
  onVerified: () => void
  needsSetup: boolean
}

export function AdminPasswordPrompt({ onVerified, needsSetup }: AdminPasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSetup, setIsSetup] = useState(needsSetup)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const endpoint = isSetup ? '/api/v1/admin/set-password' : '/api/v1/admin/verify-password'
      const body = isSetup
        ? { password, confirmPassword }
        : { password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        if (isSetup) {
          // After setting password, need to verify it
          setIsSetup(false)
          setPassword('')
          setConfirmPassword('')
          setError('Password set! Please enter it to continue.')
        } else {
          onVerified()
        }
      } else {
        setError(data.error || 'Authentication failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSetup ? 'Set Admin Password' : 'Admin Authentication'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {isSetup ? 'New Password' : 'Admin Password'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
          </div>

          {isSetup && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : isSetup ? 'Set Password' : 'Authenticate'}
          </button>
        </form>

        {isSetup && (
          <div className="mt-4 text-xs text-zinc-500">
            <p>Password must be at least 8 characters long.</p>
            <p>This is separate from your main account password.</p>
          </div>
        )}
      </div>
    </div>
  )
}
