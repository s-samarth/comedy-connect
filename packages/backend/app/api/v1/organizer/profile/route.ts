import { getCurrentUser, requireOrganizer } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"
import { validateMediaUrls, sanitizeMediaUrls } from "@/lib/media-validation"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.organizerProfile.findUnique({
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      name,
      contact,
      description,
      venue,
      youtubeUrls,
      instagramUrls,
      socialLinks
    } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Sanitize and validate media URLs
    const sanitizedYouTube = sanitizeMediaUrls(youtubeUrls || [])
    const sanitizedInstagram = sanitizeMediaUrls(instagramUrls || [])

    const validation = validateMediaUrls(sanitizedYouTube, sanitizedInstagram)
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid media URLs", details: validation.errors },
        { status: 400 }
      )
    }

    // Update user role and mark onboarding as completed
    // Only set to UNVERIFIED if not already VERIFIED
    const updateData: any = {
      onboardingCompleted: true,
      phone: contact
    }

    if (user.role !== UserRole.ORGANIZER_VERIFIED) {
      updateData.role = UserRole.ORGANIZER_UNVERIFIED
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })

    // Create or update organizer profile
    const profile = await (prisma as any).organizerProfile.upsert({
      where: { userId: user.id },
      update: {
        name,
        contact,
        description,
        venue,
        youtubeUrls: sanitizedYouTube,
        instagramUrls: sanitizedInstagram,
        socialLinks
      },
      create: {
        userId: user.id,
        name,
        contact,
        description,
        venue,
        youtubeUrls: sanitizedYouTube,
        instagramUrls: sanitizedInstagram,
        socialLinks
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

