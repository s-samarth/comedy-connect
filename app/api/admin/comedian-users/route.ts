import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { UserRole, ApprovalStatus } from "@prisma/client"

export async function GET() {
    try {
        await requireAdmin()

        const comedians = await prisma.user.findMany({
            where: {
                role: {
                    in: [UserRole.COMEDIAN_UNVERIFIED, UserRole.COMEDIAN_VERIFIED]
                }
            },
            include: {
                comedianProfile: {
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

        return NextResponse.json({ comedians })
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
        const { comedianId, action } = await request.json()

        if (!comedianId || !action) {
            return NextResponse.json({ error: "Comedian ID and action are required" }, { status: 400 })
        }

        if (!['APPROVE', 'REJECT', 'REVOKE'].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const comedian = await prisma.user.findUnique({
            where: { id: comedianId },
            include: { comedianProfile: true }
        })

        if (!comedian || !comedian.comedianProfile) {
            return NextResponse.json({ error: "Comedian not found" }, { status: 404 })
        }

        // Determine new role based on action
        let newRole: UserRole
        let approvalStatus: ApprovalStatus

        if (action === 'APPROVE') {
            newRole = UserRole.COMEDIAN_VERIFIED
            approvalStatus = ApprovalStatus.APPROVED
        } else if (action === 'REVOKE') {
            newRole = UserRole.COMEDIAN_UNVERIFIED
            approvalStatus = ApprovalStatus.REJECTED
        } else { // REJECT
            newRole = UserRole.COMEDIAN_UNVERIFIED
            approvalStatus = ApprovalStatus.REJECTED
        }

        // Create approval record
        await prisma.comedianApproval.create({
            data: {
                comedianId: comedian.comedianProfile.id,
                adminId: admin.id,
                status: approvalStatus
            }
        })

        // Update user role
        await prisma.user.update({
            where: { id: comedianId },
            data: { role: newRole }
        })

        return NextResponse.json({
            message: `Comedian ${action.toLowerCase()}d successfully`,
            comedian: {
                id: comedian.id,
                email: comedian.email,
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
