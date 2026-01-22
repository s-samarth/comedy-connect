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

    // Check if user has completed onboarding
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        name: true,
        phone: true,
        age: true,
        bio: true,
        interests: true
      }
    })

    const completed = !!(userProfile?.name && userProfile?.phone && userProfile?.age)

    return NextResponse.json({ completed })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
