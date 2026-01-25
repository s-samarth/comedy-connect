import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { showService } from "@/services/shows/show.service"
import { mapErrorToResponse } from "@/errors"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: showId } = await params

        // Call service to unpublish show
        const updatedShow = await showService.unpublishShow(showId, user.id, user.role)

        return NextResponse.json({
            message: "Show unpublish successfully",
            show: updatedShow
        })
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
