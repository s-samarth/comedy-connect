import { NextResponse } from 'next/server'
import { adminAuthService } from '@/services/admin/admin-auth.service'
import { mapErrorToResponse } from '@/errors'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // Delegate to service
        const result = await adminAuthService.login(email, password)

        // Create response with session cookie
        const response = NextResponse.json(result)
        response.headers.set('Set-Cookie', result.sessionCookie)

        return response
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
