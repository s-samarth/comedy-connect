'use client'

import { useRouter } from 'next/navigation'

interface ProfileCardProps {
  user: {
    id: string
    email: string
    role: string
    createdAt: Date
    image?: string | null
    name?: string | null
    phone?: string | null
    age?: number | null
    city?: string | null
    language?: string | null
    bio?: string | null
    interests?: any | null
    accounts?: Array<{
      provider: string
      providerAccountId: string
    }>
    organizerProfile?: any
    comedianProfile?: any
  }
  isOwner?: boolean
}

export default function ProfileCard({ user, isOwner = true }: ProfileCardProps) {
  const router = useRouter()

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator'
      case 'ORGANIZER_VERIFIED':
        return 'Verified Organizer'
      case 'ORGANIZER_UNVERIFIED':
        return 'Unverified Organizer'
      case 'AUDIENCE':
        return 'Audience Member'
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'ORGANIZER_VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'ORGANIZER_UNVERIFIED':
        return 'bg-yellow-100 text-yellow-800'
      case 'AUDIENCE':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatPhone = (phone: string) => {
    if (!phone) return 'Not provided'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const isProfileComplete = !!(user.name && user.phone && user.age)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center">
        {/* Profile Avatar */}
        <div className="mx-auto h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
          {user.image ? (
            <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
          ) : (
            <svg className="h-14 w-14 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>

        {/* User Info */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {user.name || 'Anonymous User'}
        </h2>

        {isOwner && (
          <p className="text-sm text-gray-600 mb-4">
            {user.email}
          </p>
        )}

        {/* Profile Completion Status */}
        <div className="mb-4">
          {isProfileComplete ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Profile Complete
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Profile Incomplete
            </span>
          )}
        </div>

        {/* Role Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
            {getRoleDisplay(user.role)}
          </span>
        </div>

        {/* Account Details */}
        <div className="space-y-3 text-left">
          {isOwner && user.phone && (
            <div className="border-t pt-3">
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">
                {formatPhone(user.phone)}
              </p>
            </div>
          )}

          {isOwner && user.age && (
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-sm font-medium text-gray-900">
                {user.age} years old
              </p>
            </div>
          )}

          {user.city && (
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="text-sm font-medium text-gray-900">
                {user.city}
              </p>
            </div>
          )}

          {user.language && (
            <div>
              <p className="text-sm text-gray-500">Language Preference</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {user.language}
              </p>
            </div>
          )}

          {user.bio && (
            <div>
              <p className="text-sm text-gray-500">Bio</p>
              <p className="text-sm text-gray-900 italic">
                "{user.bio}"
              </p>
            </div>
          )}

          {user.interests && Array.isArray(user.interests) && user.interests.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Comedy Interests</p>
              <div className="flex flex-wrap gap-1">
                {(user.interests as string[]).map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(user.createdAt)}
            </p>
          </div>

          {(user.organizerProfile || user.comedianProfile) && (
            <div className="border-t pt-3">
              <p className="text-sm text-gray-500 mb-2">Social Media & Clips</p>
              <div className="flex flex-wrap gap-2">
                {/* Social Handles */}
                {(user.comedianProfile?.socialLinks?.youtube || user.organizerProfile?.socialLinks?.youtube) && (
                  <a
                    href={`https://youtube.com/@${user.comedianProfile?.socialLinks?.youtube || user.organizerProfile?.socialLinks?.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 font-bold"
                  >
                    @YouTube
                  </a>
                )}
                {(user.comedianProfile?.socialLinks?.instagram || user.organizerProfile?.socialLinks?.instagram) && (
                  <a
                    href={`https://instagram.com/${user.comedianProfile?.socialLinks?.instagram || user.organizerProfile?.socialLinks?.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs hover:opacity-90 font-bold"
                  >
                    @Instagram
                  </a>
                )}

                {/* Video Clips */}
                {((user.organizerProfile?.youtubeUrls || user.comedianProfile?.youtubeUrls || []) as string[]).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs hover:bg-red-100">
                    📹 Video
                  </a>
                ))}
                {((user.organizerProfile?.instagramUrls || user.comedianProfile?.instagramUrls || []) as string[]).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 rounded bg-pink-50 text-pink-700 text-xs hover:bg-pink-100">
                    📱 Reel
                  </a>
                ))}
              </div>
            </div>
          )}

          {isOwner && user.accounts && user.accounts.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Connected Accounts</p>
              <div className="flex justify-center space-x-2 mt-1">
                {user.accounts.map((account, index) => (
                  <div key={index} className="text-2xl" title={account.provider}>
                    {account.provider === 'google' && (
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          {isOwner && (
            <button
              onClick={() => router.push('/profile/edit')}
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>⚙️</span> Edit Profile
            </button>
          )}

          {isOwner && !isProfileComplete && (
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Complete Your Profile
            </button>
          )}

          {isOwner && user.role === 'ORGANIZER_UNVERIFIED' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                Your organizer account is pending verification. You'll be able to list shows once approved.
              </p>
            </div>
          )}

          {isOwner && user.role === 'AUDIENCE' && isProfileComplete && (
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium">
              Become an Organizer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
