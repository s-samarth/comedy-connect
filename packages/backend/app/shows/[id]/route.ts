import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { showService } from "@/services/shows/show.service"
import { mapErrorToResponse } from "@/errors"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id: showId } = await params

    const show = await showService.getShow(showId, user?.id, user?.role)

    return NextResponse.json({ show })
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: showId } = await params
    const updates = await request.json()

    const updatedShow = await showService.updateShow(showId, user.id, user.role, updates)

    return NextResponse.json({ show: updatedShow })
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: showId } = await params

    await showService.deleteShow(showId, user.id, user.role)

    return NextResponse.json({ message: "Show deleted successfully" })
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
