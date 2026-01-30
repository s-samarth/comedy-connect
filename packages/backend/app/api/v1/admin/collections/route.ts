import { NextResponse } from 'next/server'
import { adminCollectionsService } from '@/services/admin/admin-collections.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Admin access required')
        }

        const { searchParams } = new URL(request.url)
        const showId = searchParams.get('showId') || undefined

        // Delegate to service
        const result = await adminCollectionsService.getCollectionsSummary(showId)

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Admin access required')
        }

        const { showId } = await request.json()

        // Delegate to service
        const result = await adminCollectionsService.disburseShow(showId)

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
