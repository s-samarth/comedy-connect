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

        // Filter out comedians who are unverified and rejected (if they haven't updated since)
        const filteredComedians = comedians.filter(comedian => {
            // Keep verified comedians
            if (comedian.role === UserRole.COMEDIAN_VERIFIED) return true;

            // Check latest approval status for unverified comedians
            const latestApproval = comedian.comedianProfile?.approvals?.[0];
            const profileUpdatedAt = comedian.comedianProfile?.updatedAt ? new Date(comedian.comedianProfile.updatedAt) : null;
            const rejectionAt = latestApproval?.status === ApprovalStatus.REJECTED ? new Date(latestApproval.updatedAt) : null;

            // If rejected, only keep if profile was updated AFTER rejection
            if (rejectionAt && profileUpdatedAt && profileUpdatedAt > rejectionAt) {
                return true;
            }

            if (latestApproval?.status === ApprovalStatus.REJECTED) {
                return false;
            }

            return true;
        });

        // ------------------------------------------------------------------
        // READ PATCH: Fetch custom fees using Raw SQL to bypass stale metadata
        // ------------------------------------------------------------------
        const profileFees = await prisma.$queryRaw`
            SELECT "userId", "customPlatformFee" FROM "ComedianProfile"
        ` as any[]

        const feeMap = new Map(profileFees.map(f => [f.userId, f.customPlatformFee]))

        const patchedComedians = filteredComedians.map(c => {
            if (c.comedianProfile) {
                // Overlay the fee from raw SQL
                (c.comedianProfile as any).customPlatformFee = feeMap.get(c.id) ?? (c.comedianProfile as any).customPlatformFee
            }
            return c
        })

        return NextResponse.json({ comedians: patchedComedians })
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
        const { comedianId, action, customPlatformFee } = await request.json()

        if (action === 'UPDATE_FEE') {
            if (typeof customPlatformFee !== 'number' || customPlatformFee < 0 || customPlatformFee > 100) {
                return NextResponse.json({ error: "Invalid fee percentage (0-100 required)" }, { status: 400 })
            }

            // Update profile and propagate to all future/active shows (undisbursed)
            await prisma.$transaction([
                (prisma.comedianProfile as any).update({
                    where: { userId: comedianId },
                    data: { customPlatformFee }
                }),
                // Use isDisbursed=false instead of date check to ensure all active/pending shows are updated
                (prisma.show as any).updateMany({
                    where: {
                        createdBy: comedianId,
                        isDisbursed: false
                    },
                    data: { customPlatformFee }
                })
            ])

            return NextResponse.json({ success: true, message: "Platform fee updated for comedian and future shows" })
        }

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

        if (!comedian) {
            return NextResponse.json({ error: "Comedian not found" }, { status: 404 })
        }

        // Determine new role based on action
        let newRole: UserRole
        let approvalStatus: ApprovalStatus

        if (action === 'APPROVE') {
            newRole = UserRole.COMEDIAN_VERIFIED
            approvalStatus = ApprovalStatus.APPROVED
        } else if (action === 'REVOKE') {
            // For revoke, we just downgrade to unverified. 
            // If they have no profile, they will appear as Pending.
            newRole = UserRole.COMEDIAN_UNVERIFIED
            approvalStatus = ApprovalStatus.REJECTED

            // Unpublish all future shows immediately
            await prisma.show.updateMany({
                where: {
                    createdBy: comedianId,
                    date: { gte: new Date() },
                    isPublished: true
                },
                data: { isPublished: false }
            })
        } else { // REJECT
            approvalStatus = ApprovalStatus.REJECTED

            if (!comedian.comedianProfile) {
                // If rejecting a user with no profile, remove them from the roster basically
                // by setting them to AUDIENCE
                newRole = UserRole.AUDIENCE
            } else {
                newRole = UserRole.COMEDIAN_UNVERIFIED
            }
        }

        // Create or update approval record ONLY if profile exists
        if (comedian.comedianProfile) {
            await prisma.comedianApproval.upsert({
                where: {
                    comedianId_adminId: {
                        comedianId: comedian.comedianProfile.id,
                        adminId: admin.id
                    }
                },
                update: {
                    status: approvalStatus
                },
                create: {
                    comedianId: comedian.comedianProfile.id,
                    adminId: admin.id,
                    status: approvalStatus
                }
            })
        }

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
