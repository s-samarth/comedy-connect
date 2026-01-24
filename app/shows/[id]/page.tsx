import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ShowBooking from "@/components/shows/ShowBooking"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

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

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Show Header */}
          <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
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
                <span>🕐 {new Date(show.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
