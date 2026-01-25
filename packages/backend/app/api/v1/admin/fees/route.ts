
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const DEFAULT_SLABS = [
  { minPrice: 0, maxPrice: 199, fee: 7 }, // 7%
  { minPrice: 200, maxPrice: 400, fee: 8 }, // 8%
  { minPrice: 401, maxPrice: 1000000, fee: 9 } // 9%
]

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let config = await (prisma as any).platformConfig.findUnique({
      where: { key: 'booking_fee_slabs' }
    })

    if (!config) {
      config = await prisma.platformConfig.create({
        data: {
          key: 'booking_fee_slabs',
          value: DEFAULT_SLABS
        }
      })
    }

    const feeConfig = {
      slabs: config.value,
      lastUpdated: config.updatedAt,
      updatedBy: "admin"
    }

    return NextResponse.json({ feeConfig })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const { slabs } = await request.json()

    if (!Array.isArray(slabs) || slabs.length === 0) {
      return NextResponse.json({ error: "Invalid fee slabs" }, { status: 400 })
    }

    await (prisma as any).platformConfig.upsert({
      where: { key: 'booking_fee_slabs' },
      update: { value: slabs },
      create: { key: 'booking_fee_slabs', value: slabs }
    })

    return NextResponse.json({
      message: "Fee configuration updated successfully",
      feeConfig: { slabs, lastUpdated: new Date() }
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
