import { NextResponse } from 'next/server'
import { adminOrganizerService } from '@/services/admin/admin-organizer.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin access required')
    }

    // Delegate to service
    const result = await adminOrganizerService.listOrganizerUsers()

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

    const { organizerId, action, customPlatformFee, reason } = await request.json()

    if (!organizerId || !action) {
      throw new Error('Missing organizerId or action')
    }

    const normalizedAction = action.toLowerCase()
    let result

    switch (normalizedAction) {
      case 'approve':
        result = await adminOrganizerService.approveOrganizer(organizerId, user.id)
        break
      case 'reject':
        result = await adminOrganizerService.rejectOrganizer(organizerId, user.id, reason)
        break
      case 'revoke':
      case 'disable':
        result = await adminOrganizerService.disableOrganizer(organizerId, user.id)
        break
      case 'enable':
        result = await adminOrganizerService.enableOrganizer(organizerId, user.id)
        break
      case 'update_fee':
        result = await adminOrganizerService.updateCustomFee(organizerId, customPlatformFee)
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
  // Keep PUT for backward compatibility if any other client uses it
  return POST(request)
}

export async function PATCH(request: Request) {
  // Keep PATCH for backward compatibility
  return POST(request)
}
