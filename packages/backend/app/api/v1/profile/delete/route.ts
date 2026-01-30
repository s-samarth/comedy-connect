import { NextResponse } from 'next/server'
import { profileService } from '@/services/user/profile.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function DELETE() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            throw new UnauthorizedError()
        }

        // Delegate to service
        const result = await profileService.deleteAccount(user.id, user.role)

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
