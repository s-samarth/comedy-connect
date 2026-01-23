import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const profile = await (prisma as any).comedianProfile.findUnique({
            where: { userId: user.id },
            include: {
                approvals: {
                    include: {
                        admin: {
                            select: { email: true }
                        }
                    }
                }
            }
        })

        return NextResponse.json({ profile })
    } catch (error) {
        console.error("Error in comedian profile GET:", error)
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            console.log("POST /api/comedian/profile: Unauthorized")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        console.log("POST /api/comedian/profile: Body received", { ...body, stageName: body.stageName ? "present" : "missing" })

        const { stageName, bio, contact, socialLinks, youtubeUrls, instagramUrls } = body

        if (!stageName) {
            return NextResponse.json({ error: "Stage name is required" }, { status: 400 })
        }

        console.log("POST /api/comedian/profile: Updating user role for", user.id)
        // Update user role and mark onboarding as completed
        await (prisma as any).user.update({
            where: { id: user.id },
            data: {
                role: "COMEDIAN_UNVERIFIED",
                onboardingCompleted: true
            }
        })

        console.log("POST /api/comedian/profile: Upserting comedian profile for", user.id)
        // Create or update comedian profile
        const profile = await (prisma as any).comedianProfile.upsert({
            where: { userId: user.id },
            update: { stageName, bio, contact, socialLinks, youtubeUrls, instagramUrls },
            create: {
                userId: user.id,
                stageName,
                bio,
                contact,
                socialLinks,
                youtubeUrls,
                instagramUrls
            }
        })

        console.log("POST /api/comedian/profile: Success")
        return NextResponse.json({ profile })
    } catch (error) {
        console.error("Error in comedian profile POST:", error)
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
