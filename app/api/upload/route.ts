import { getCurrentUser, requireOrganizer, isVerifiedOrganizer } from "@/lib/auth"
import { uploadImage, validateImageFile } from "@/lib/cloudinary"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const user = await requireOrganizer()
    
    if (!isVerifiedOrganizer(user.role)) {
      return NextResponse.json({ error: "Account not verified" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'show' or 'comedian'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type || !['show', 'comedian'].includes(type)) {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 })
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const folder = type === 'show' ? 'comedy-connect/shows' : 'comedy-connect/comedians'
    const result = await uploadImage(buffer, folder)

    return NextResponse.json({ 
      url: result.url,
      publicId: result.publicId
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
