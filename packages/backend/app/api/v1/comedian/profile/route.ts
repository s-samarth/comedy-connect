import { NextResponse } from 'next/server'
import { comedianService } from '@/services/comedians/comedian.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            throw new UnauthorizedError()
        }

        // Delegate to service
        const result = await comedianService.getComedianByUserId(user.id)

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            throw new UnauthorizedError()
        }

        const body = await request.json()

        // Delegate to service
        const result = await comedianService.updateComedianProfile(user.id, body)

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
