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
        const result = await adminComedianService.listComedianUsers()

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Admin access required')
        }

        const { comedianId, customFee } = await request.json()

        // Delegate to service
        const result = await adminComedianService.updateCustomFee(comedianId, customFee)

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}

export async function PATCH(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Admin access required')
        }

        const { comedianId, action, reason } = await request.json()

        let result
        switch (action) {
            case 'approve':
                result = await adminComedianService.approveComedian(comedianId)
                break
            case 'reject':
                result = await adminComedianService.rejectComedian(comedianId, reason)
                break
            case 'disable':
                result = await adminComedianService.disableComedian(comedianId)
                break
            case 'enable':
                result = await adminComedianService.enableComedian(comedianId)
                break
            default:
                throw new Error('Invalid action')
        }

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
