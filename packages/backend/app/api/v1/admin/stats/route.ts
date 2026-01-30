import { NextResponse } from 'next/server'
import { adminStatsService } from '@/services/admin/admin-stats.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Admin access required')
        }

        // Delegate to service
        const stats = await adminStatsService.getSystemStats()

        return NextResponse.json(stats)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
