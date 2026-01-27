import { getCurrentUser, requireShowCreator, isVerifiedShowCreator } from "@/lib/auth"
import { NextResponse } from "next/server"
import { showService } from "@/services/shows/show.service"
import { mapErrorToResponse } from "@/errors"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') as "public" | "manage" | "discovery" | undefined

    const shows = await showService.listShows({
      userId: user?.id,
      userRole: user?.role,
      mode
    })

    return NextResponse.json({
      shows,
      isMockData: false
    })
  } catch (error) {
    console.error('Error in shows API:', error)
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireShowCreator()

    // Allow both verified organizers and verified comedians to create shows
    const isVerified = isVerifiedShowCreator(user.role)

    if (!isVerified) {
      return NextResponse.json({
        error: "Account not verified. Please wait for admin approval before creating shows."
      }, { status: 403 })
    }

    const body = await request.json()

    // Call service to create show
    const show = await showService.createShow(user.id, user.role, {
      title: body.title,
      description: body.description,
      date: new Date(body.date),
      venue: body.venue,
      googleMapsLink: body.googleMapsLink,
      ticketPrice: body.ticketPrice,
      totalTickets: body.totalTickets,
      posterImageUrl: body.posterImageUrl,
      youtubeUrls: body.youtubeUrls,
      instagramUrls: body.instagramUrls
    })

    return NextResponse.json({ show })
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
