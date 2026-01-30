import { NextResponse } from 'next/server'
import { onboardingService } from '@/services/user/onboarding.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      throw new UnauthorizedError()
    }

    const body = await request.json()

    // Delegate to service
    const result = await onboardingService.completeOnboarding(session.user.email, body)

    return NextResponse.json(result)
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
