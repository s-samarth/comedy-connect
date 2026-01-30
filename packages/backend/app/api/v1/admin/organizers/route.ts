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

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin access required')
    }

    const { organizerId, customFee } = await request.json()

    // Delegate to service
    const result = await adminOrganizerService.updateCustomFee(organizerId, customFee)

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

    const { organizerId, action, reason } = await request.json()

    let result
    switch (action) {
      case 'approve':
        result = await adminOrganizerService.approveOrganizer(organizerId)
        break
      case 'reject':
        result = await adminOrganizerService.rejectOrganizer(organizerId, reason)
        break
      case 'disable':
        result = await adminOrganizerService.disableOrganizer(organizerId)
        break
      case 'enable':
        result = await adminOrganizerService.enableOrganizer(organizerId)
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
