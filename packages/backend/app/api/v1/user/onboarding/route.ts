import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { name, phone, age, city, language, bio } = await request.json()

    // Validate required fields
    const errors: Record<string, string> = {}
    
    if (!name || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    if (!age || isNaN(Number(age)) || Number(age) < 13 || Number(age) > 100) {
      errors.age = 'Please enter a valid age between 13 and 100'
    }
    
    if (bio && bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      )
    }

    // Update user profile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        phone: phone.replace(/\D/g, ''), // Clean phone number
        age: Number(age),
        city: city?.trim() || null,
        language: language || null,
        bio: bio?.trim() || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
