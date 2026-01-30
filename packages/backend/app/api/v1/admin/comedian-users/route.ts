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

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Admin access required')
        }

        const { comedianId, action, customPlatformFee, reason } = await request.json()

        if (!comedianId || !action) {
            throw new Error('Missing comedianId or action')
        }

        const normalizedAction = action.toLowerCase()
        let result

        switch (normalizedAction) {
            case 'approve':
                result = await adminComedianService.approveComedian(comedianId, user.id)
                break
            case 'reject':
                result = await adminComedianService.rejectComedian(comedianId, user.id, reason)
                break
            case 'revoke':
            case 'disable':
                result = await adminComedianService.disableComedian(comedianId, user.id)
                break
            case 'enable':
                result = await adminComedianService.enableComedian(comedianId, user.id)
                break
            case 'update_fee':
                result = await adminComedianService.updateCustomFee(comedianId, customPlatformFee)
                break
            default:
                throw new Error(`Invalid action: ${action}`)
        }

        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}

export async function PUT(request: Request) {
    return POST(request)
}

export async function PATCH(request: Request) {
    return POST(request)
}
