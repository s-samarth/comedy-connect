import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await requireAdmin()

    // For now, return default fee structure
    // In a real implementation, this would be stored in database
    const feeConfig = {
      slabs: [
        { minPrice: 0, maxPrice: 199, fee: 0.05 }, // 5% for < ₹200
        { minPrice: 200, maxPrice: 400, fee: 0.07 }, // 7% for ₹200-₹400
        { minPrice: 401, maxPrice: Infinity, fee: 0.08 } // 8% for > ₹400
      ],
      lastUpdated: new Date().toISOString(),
      updatedBy: "system"
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
    const admin = await requireAdmin()
    const { slabs } = await request.json()

    // Validate slabs
    if (!Array.isArray(slabs) || slabs.length === 0) {
      return NextResponse.json({ error: "Invalid fee slabs" }, { status: 400 })
    }

    // Validate each slab
    for (const slab of slabs) {
      if (
        typeof slab.minPrice !== 'number' ||
        typeof slab.maxPrice !== 'number' ||
        typeof slab.fee !== 'number' ||
        slab.minPrice < 0 ||
        slab.maxPrice <= slab.minPrice ||
        slab.fee < 0 ||
        slab.fee > 1
      ) {
        return NextResponse.json({ error: "Invalid slab configuration" }, { status: 400 })
      }
    }

    // Sort slabs by minPrice
    slabs.sort((a, b) => a.minPrice - b.minPrice)

    // Check for gaps or overlaps
    for (let i = 1; i < slabs.length; i++) {
      if (slabs[i].minPrice !== slabs[i - 1].maxPrice + 1) {
        return NextResponse.json({ 
          error: "Fee slabs must be continuous without gaps" 
        }, { status: 400 })
      }
    }

    // For now, just return the updated config
    // In a real implementation, this would be stored in database
    const feeConfig = {
      slabs,
      lastUpdated: new Date().toISOString(),
      updatedBy: admin.email
    }

    return NextResponse.json({ 
      message: "Fee configuration updated successfully",
      feeConfig 
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
