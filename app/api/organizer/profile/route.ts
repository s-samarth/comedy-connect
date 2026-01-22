import { getCurrentUser, requireOrganizer } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

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

    const { name, contact, description, venue } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Update user role to organizer if not already
    await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.ORGANIZER_UNVERIFIED }
    })

    // Create or update organizer profile
    const profile = await prisma.organizerProfile.upsert({
      where: { userId: user.id },
      update: { name, contact, description, venue },
      create: {
        userId: user.id,
        name,
        contact,
        description,
        venue
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
