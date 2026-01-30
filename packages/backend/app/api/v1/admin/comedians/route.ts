import { NextResponse } from 'next/server'
import { adminComedianService } from '@/services/admin/admin-comedian.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Admin access required')
        }

        // Delegate to service
        const result = await adminComedianService.getComedianProfiles()

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
