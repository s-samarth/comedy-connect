import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ShowBooking from "@/components/shows/ShowBooking"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { cookies } from "next/headers"

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ShowPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  const show = await prisma.show.findUnique({
    where: { id },
    include: {
      ticketInventory: true,
      showComedians: {
        include: {
          comedian: true
        }
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  })

  if (!show) {
    notFound()
  }

  // Fetch bookings for stats if user is admin or creator
  // Check for admin status via session OR explicitly via admin cookie for robust admin identification
  const cookieStore = await cookies()
  const hasAdminCookie = cookieStore.get('admin-secure-session')
  const isAdmin = user?.role === 'ADMIN' || !!hasAdminCookie
  const isCreator = user?.id === show.createdBy

  let stats = null
  if (isAdmin || isCreator) {
    const bookings = await prisma.booking.findMany({
      where: {
        showId: id,
        status: { in: ['CONFIRMED', 'CONFIRMED_UNPAID'] }
      }
    })

    const ticketsSold = bookings.reduce((sum, b) => sum + b.quantity, 0)
    const revenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0)

    stats = {
      ticketsSold,
      revenue,
      count: bookings.length
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Admin Navigation Overlay */}
        {isAdmin && (
          <div className="mb-6 flex justify-between items-center">
            <Link
              href="/admin-secure/shows"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
            >
              ← Back to Admin Show Management
            </Link>
            <div className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-100">
              Administrator Mode
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Admin/Creator Stats Banner - Premium Design */}
          {stats && (
            <div className="relative overflow-hidden bg-slate-900 px-8 py-8 text-white">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 px-2 bg-blue-500/20 rounded text-[10px] font-bold uppercase tracking-widest text-blue-400 border border-blue-500/30">
                      Analytics
                    </span>
                    <h2 className="text-xl font-bold tracking-tight">Show Performance Metrics</h2>
                  </div>
                  <p className="text-slate-400 text-sm">Real-time data for "{show.title}"</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Tickets Sold</div>
                    <div className="text-2xl font-black text-white flex items-baseline gap-1">
                      {stats.ticketsSold}
                      <span className="text-xs font-medium text-slate-500">/ {show.totalTickets}</span>
                    </div>
                    <div className="w-24 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((stats.ticketsSold / show.totalTickets) * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total Revenue</div>
                    <div className="text-2xl font-black text-green-400">
                      ₹{stats.revenue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Verified Confirmed</div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Bookings</div>
                    <div className="text-2xl font-black text-blue-400">
                      {stats.count}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Unique Transactions</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show Header */}
          <div className="relative h-72">
            {show.posterImageUrl && (
              <img
                src={show.posterImageUrl}
                alt={show.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="relative z-10 p-8 text-white bg-black/50 h-full flex flex-col justify-end">
              <h1 className="text-4xl font-bold mb-2">{show.title}</h1>
              <div className="flex items-center gap-4 text-lg">
                <span>📅 {new Date(show.date).toLocaleDateString()}</span>
                <span>🕐 {new Date(show.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({show.durationMinutes || 60} mins)</span>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <a
                  href={(show as any).googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-200 transition-colors group"
                >
                  <span>📍 {show.venue}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-sm">↗ View on Maps</span>
                </a>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Show Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                {show.description && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">About the Show</h2>
                    <p className="text-gray-700 leading-relaxed">{show.description}</p>
                  </div>
                )}

                {/* Social Media - Show Level */}
                {(((show as any).youtubeUrls && (show as any).youtubeUrls.length > 0) || ((show as any).instagramUrls && (show as any).instagramUrls.length > 0)) && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">On Social Media</h2>
                    <div className="space-y-6">
                      {/* YouTube Videos */}
                      {(show as any).youtubeUrls?.map((url: string, i: number) => {
                        const getYouTubeId = (url: string) => {
                          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                          const match = url.match(regExp);
                          return (match && match[2].length === 11) ? match[2] : null;
                        };
                        const videoId = getYouTubeId(url);

                        if (videoId) {
                          return (
                            <div key={`yt-${i}`} className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-md">
                              <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          )
                        }
                        return (
                          <a
                            key={`yt-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                          >
                            <span className="text-2xl">📹</span>
                            <span className="text-red-700 font-medium overflow-hidden text-ellipsis">Watch on YouTube</span>
                          </a>
                        )
                      })}

                      {/* Instagram Reels */}
                      {(show as any).instagramUrls?.map((url: string, i: number) => {
                        const getInstagramId = (url: string) => {
                          const match = url.match(/(?:instagram\.com\/reel\/|instagram\.com\/p\/)([a-zA-Z0-9_-]+)/);
                          return match ? match[1] : null;
                        };
                        const reelId = getInstagramId(url);

                        if (reelId) {
                          return (
                            <div key={`ig-${i}`} className="flex justify-center">
                              <iframe
                                className="rounded-lg shadow-md border border-gray-200 bg-white"
                                src={`https://www.instagram.com/reel/${reelId}/embed`}
                                width="350"
                                height="540"
                                frameBorder="0"
                                scrolling="no"
                                allowTransparency={true}
                              ></iframe>
                            </div>
                          )
                        }

                        return (
                          <a
                            key={`ig-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg transition-colors"
                          >
                            <span className="text-2xl">📱</span>
                            <span className="text-pink-700 font-medium overflow-hidden text-ellipsis">View on Instagram</span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Organizer vs Comedians Section */}
                {show.creator.role?.includes('ORGANIZER') ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Organized by</h2>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {show.creator.name?.charAt(0).toUpperCase() || 'O'}
                        </span>
                      </div>
                      <div>
                        <Link
                          href={`/profile/${show.creator.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {show.creator.name || 'Organizer'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Show comedians for non-organizer listings (Comedians/Admins) */
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Featuring</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {show.showComedians.length > 0 ? (
                        show.showComedians.map((showComedian) => (
                          <div key={showComedian.comedian.id} className="text-center">
                            {showComedian.comedian.profileImageUrl && (
                              <Link href={`/profile/${showComedian.comedian.createdBy}`}>
                                <img
                                  src={showComedian.comedian.profileImageUrl}
                                  alt={showComedian.comedian.name}
                                  className="w-20 h-20 rounded-full mx-auto mb-2 object-cover hover:opacity-80 transition-opacity"
                                />
                              </Link>
                            )}
                            <Link
                              href={`/profile/${showComedian.comedian.createdBy}`}
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors block"
                            >
                              {showComedian.comedian.name}
                            </Link>
                            {showComedian.comedian.bio && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {showComedian.comedian.bio}
                              </p>
                            )}
                            <div className="flex justify-center gap-2 mt-2">
                              {(showComedian.comedian as any).youtubeUrls?.map((url: string, i: number) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:scale-110 transition-transform" title="YouTube Video">
                                  📹
                                </a>
                              ))}
                              {(showComedian.comedian as any).instagramUrls?.map((url: string, i: number) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:scale-110 transition-transform" title="Instagram Reel">
                                  📱
                                </a>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        /* Fallback: If no comedians linked, show the creator (who is a comedian) */
                        <div className="text-center">
                          <Link href={`/profile/${show.creator.id}`}>
                            <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto mb-2 flex items-center justify-center hover:bg-blue-200 transition-colors">
                              <span className="text-blue-600 text-2xl font-bold">
                                {show.creator.name?.charAt(0).toUpperCase() || 'C'}
                              </span>
                            </div>
                          </Link>
                          <Link
                            href={`/profile/${show.creator.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors block"
                          >
                            {show.creator.name || 'Comedian'}
                          </Link>
                          <p className="text-sm text-gray-500">Main Act</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Section */}
              <div className="md:col-span-1">
                <ShowBooking show={show as any} user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
