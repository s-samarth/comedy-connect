import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has completed onboarding using the new flag
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        onboardingCompleted: true
      }
    })

    const completed = userProfile?.onboardingCompleted || false

    return NextResponse.json({ 
      needsOnboarding: !completed,
      completed 
    })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
