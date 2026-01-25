import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { UserRole, ApprovalStatus } from "@prisma/client"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

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

    // Filter out organizers who are unverified and rejected
    const filteredOrganizers = organizers.filter(organizer => {
      // Keep verified organizers
      if (organizer.role === UserRole.ORGANIZER_VERIFIED) return true;

      // Check latest approval status for unverified organizers
      const latestApproval = organizer.organizerProfile?.approvals?.[0];
      if (latestApproval?.status === ApprovalStatus.REJECTED) {
        return false;
      }

      return true;
    });

    // ------------------------------------------------------------------
    // READ PATCH: Fetch custom fees using Raw SQL to bypass stale metadata
    // ------------------------------------------------------------------
    const profileFees = await prisma.$queryRaw`
        SELECT "userId", "customPlatformFee" FROM "OrganizerProfile"
    ` as any[]

    const feeMap = new Map(profileFees.map(f => [f.userId, f.customPlatformFee]))

    const patchedOrganizers = filteredOrganizers.map(o => {
      if (o.organizerProfile) {
        (o.organizerProfile as any).customPlatformFee = feeMap.get(o.id) ?? (o.organizerProfile as any).customPlatformFee
      }
      return o
    })

    return NextResponse.json({ organizers: patchedOrganizers })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentUser()
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const { organizerId, action, customPlatformFee } = await request.json()

    if (action === 'UPDATE_FEE') {
      if (typeof customPlatformFee !== 'number' || customPlatformFee < 0 || customPlatformFee > 100) {
        return NextResponse.json({ error: "Invalid fee percentage (0-100 required)" }, { status: 400 })
      }

      // Update profile and propagate to all future/active shows (undisbursed)
      await prisma.$transaction([
        (prisma.organizerProfile as any).update({
          where: { userId: organizerId },
          data: { customPlatformFee }
        }),
        // Use isDisbursed=false to cover all active business
        (prisma.show as any).updateMany({
          where: {
            createdBy: organizerId,
            isDisbursed: false
          },
          data: { customPlatformFee }
        })
      ])

      return NextResponse.json({ success: true, message: "Platform fee updated for organizer and future shows" })
    }

    if (!organizerId || !action) {
      return NextResponse.json({ error: "Organizer ID and action are required" }, { status: 400 })
    }

    if (!['APPROVE', 'REJECT', 'REVOKE'].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const organizer = await prisma.user.findUnique({
      where: { id: organizerId },
      include: { organizerProfile: true }
    })

    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 })
    }

    // Determine new role and approval status based on action
    let newRole: UserRole
    let approvalStatus: ApprovalStatus

    if (action === 'APPROVE') {
      newRole = UserRole.ORGANIZER_VERIFIED
      approvalStatus = ApprovalStatus.APPROVED
    } else if (action === 'REVOKE') {
      // For revoke, we just downgrade to unverified. 
      // If they have no profile, they will appear as Pending.
      newRole = UserRole.ORGANIZER_UNVERIFIED
      approvalStatus = ApprovalStatus.REJECTED

      // Unpublish all future shows immediately
      await prisma.show.updateMany({
        where: {
          createdBy: organizerId,
          date: { gte: new Date() },
          isPublished: true
        },
        data: { isPublished: false }
      })
    } else { // REJECT
      approvalStatus = ApprovalStatus.REJECTED

      if (!organizer.organizerProfile) {
        // If rejecting a user with no profile, set them to AUDIENCE
        newRole = UserRole.AUDIENCE
      } else {
        newRole = UserRole.ORGANIZER_UNVERIFIED
      }
    }

    // Create or update approval record ONLY if profile exists
    if (organizer.organizerProfile) {
      await prisma.organizerApproval.upsert({
        where: {
          organizerId_adminId: {
            organizerId: organizer.organizerProfile.id,
            adminId: admin.id
          }
        },
        update: {
          status: approvalStatus
        },
        create: {
          organizerId: organizer.organizerProfile.id,
          adminId: admin.id,
          status: approvalStatus
        }
      })
    }

    // Update user role
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
