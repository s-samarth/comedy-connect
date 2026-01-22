import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { UserRole, ApprovalStatus } from "@prisma/client"

export async function GET() {
  try {
    await requireAdmin()

    const organizers = await prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.ORGANIZER_UNVERIFIED, UserRole.ORGANIZER_VERIFIED]
        }
      },
      include: {
        organizerProfile: {
          include: {
            approvals: {
              include: {
                admin: {
                  select: { email: true }
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ organizers })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    const { organizerId, action } = await request.json()

    if (!organizerId || !action) {
      return NextResponse.json({ error: "Organizer ID and action are required" }, { status: 400 })
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const organizer = await prisma.user.findUnique({
      where: { id: organizerId },
      include: { organizerProfile: true }
    })

    if (!organizer || !organizer.organizerProfile) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 })
    }

    // Create approval record
    await prisma.organizerApproval.create({
      data: {
        organizerId: organizer.organizerProfile.id,
        adminId: admin.id,
        status: action === 'APPROVE' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED
      }
    })

    // Update user role based on action
    const newRole = action === 'APPROVE' ? UserRole.ORGANIZER_VERIFIED : UserRole.ORGANIZER_UNVERIFIED
    
    await prisma.user.update({
      where: { id: organizerId },
      data: { role: newRole }
    })

    return NextResponse.json({ 
      message: `Organizer ${action.toLowerCase()}d successfully`,
      organizer: {
        id: organizer.id,
        email: organizer.email,
        role: newRole
      }
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
