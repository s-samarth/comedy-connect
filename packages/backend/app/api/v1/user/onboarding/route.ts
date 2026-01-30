import { NextResponse } from 'next/server'
import { onboardingService } from '@/services/user/onboarding.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new UnauthorizedError()
    }

    const body = await request.json()

    // Delegate to service
    const result = await onboardingService.completeOnboarding(user.email, body)

    return NextResponse.json(result)
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
