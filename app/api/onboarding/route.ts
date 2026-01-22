import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, age, city, watchedComedy, phone, heardAboutUs } = body

    // Server-side validation
    if (!name || !age || !city || !watchedComedy) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, age, city, and watchedComedy are required' 
      }, { status: 400 })
    }

    if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      return NextResponse.json({ 
        error: 'Age must be a valid number between 1 and 120' 
      }, { status: 400 })
    }

    if (!['yes', 'no'].includes(watchedComedy)) {
      return NextResponse.json({ 
        error: 'watchedComedy must be either "yes" or "no"' 
      }, { status: 400 })
    }

    // Update user profile and mark onboarding as completed
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        age: Number(age),
        city: city.trim(),
        phone: phone?.trim() || null,
        heardAboutUs: heardAboutUs?.trim() || null,
        onboardingCompleted: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        onboardingCompleted: updatedUser.onboardingCompleted
      }
    })

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
