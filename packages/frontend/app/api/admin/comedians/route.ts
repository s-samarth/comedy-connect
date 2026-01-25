import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // Server-side admin validation
        const user = await getCurrentUser()

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 403 }
            )
        }

        // Fetch all comedians with creator information
        const comedians = await prisma.comedian.findMany({
            include: {
                creator: {
                    select: {
                        email: true,
                        organizerProfile: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        showComedians: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json({ comedians })
    } catch (error) {
        console.error("Failed to fetch comedians:", error)
        return NextResponse.json(
            { error: "Failed to fetch comedians" },
            { status: 500 }
        )
    }
}
