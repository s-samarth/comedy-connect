import { getCurrentUser, requireOrganizer, isVerifiedOrganizer } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verified organizers can see all comedians they created
    // Public users can see all comedians (for show discovery)
    const comedians = await prisma.comedian.findMany({
      where: user.role.startsWith("ORGANIZER") ? { createdBy: user.id } : {},
      include: {
        creator: {
          select: { email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ comedians })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireOrganizer()
    
    if (!isVerifiedOrganizer(user.role)) {
      return NextResponse.json({ error: "Account not verified" }, { status: 403 })
    }

    const { name, bio, socialLinks, promoVideoUrl } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Validate social links if provided
    if (socialLinks && typeof socialLinks !== 'object') {
      return NextResponse.json({ error: "Social links must be an object" }, { status: 400 })
    }

    const comedian = await prisma.comedian.create({
      data: {
        name,
        bio,
        socialLinks,
        promoVideoUrl,
        createdBy: user.id
      }
    })

    return NextResponse.json({ comedian })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
