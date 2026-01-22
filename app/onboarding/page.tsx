'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface UserDetails {
  name: string
  phone: string
  age: string
  city: string
  language: string
  bio: string
}

export default function Onboarding() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    phone: '',
    age: '',
    city: '',
    language: '',
    bio: ''
  })
  const [errors, setErrors] = useState<Partial<UserDetails>>({})


  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    // Check if user has already completed onboarding
    checkOnboardingStatus()
  }, [session, router])

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/user/onboarding-status')
      if (response.ok) {
        const data = await response.json()
        if (data.completed) {
          router.push('/profile')
          return
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }


  const validateForm = () => {
    const newErrors: Partial<UserDetails> = {}

    if (!userDetails.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (userDetails.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!userDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(userDetails.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    if (!userDetails.age.trim()) {
      newErrors.age = 'Age is required'
    } else if (isNaN(Number(userDetails.age)) || Number(userDetails.age) < 13 || Number(userDetails.age) > 100) {
      newErrors.age = 'Please enter a valid age between 13 and 100'
    }

    if (userDetails.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails),
      })

      if (response.ok) {
        router.push('/profile?onboarding=complete')
      } else {
        const data = await response.json()
        setErrors(data.errors || {})
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your Profile
          </h1>
          <p className="text-lg text-gray-600">
            Add a few details to enhance your comedy experience (optional)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={userDetails.phone}
                  onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  value={userDetails.age}
                  onChange={(e) => setUserDetails(prev => ({ ...prev, age: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your age"
                  min="13"
                  max="100"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City (optional)
                </label>
                <input
                  type="text"
                  id="city"
                  value={userDetails.city}
                  onChange={(e) => setUserDetails(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Language Preference (optional)
                </label>
                <select
                  id="language"
                  value={userDetails.language}
                  onChange={(e) => setUserDetails(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a language</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="telugu">Telugu</option>
                  <option value="tamil">Tamil</option>
                  <option value="malayalam">Malayalam</option>
                  <option value="kannada">Kannada</option>
                  <option value="bengali">Bengali</option>
                  <option value="marathi">Marathi</option>
                  <option value="gujarati">Gujarati</option>
                  <option value="punjabi">Punjabi</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Tell us about yourself (optional)
              </label>
              <textarea
                id="bio"
                rows={4}
                value={userDetails.bio}
                onChange={(e) => setUserDetails(prev => ({ ...prev, bio: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.bio ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Share a bit about your comedy preferences, what makes you laugh, or what you're looking for in comedy shows..."
                maxLength={500}
              />
              <div className="mt-1 text-right">
                <span className="text-sm text-gray-500">
                  {userDetails.bio.length}/500 characters
                </span>
              </div>
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
              )}
            </div>
          </div>


          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving your details...
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </div>
        </form>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/profile')}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
