import { getCurrentUser } from "@/lib/auth"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfileCard from "@/components/profile/ProfileCard"
import UserBookings from "@/components/profile/UserBookings"
import Link from "next/link"

async function getUserProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: {
                    select: {
                        provider: true,
                        providerAccountId: true,
                    }
                },
                organizerProfile: true,
                comedianProfile: true,
                createdShows: {
                    include: {
                        ticketInventory: true,
                        showComedians: {
                            include: {
                                comedian: true
                            }
                        }
                    },
                    orderBy: { date: 'asc' }
                },
                bookings: {
                    include: {
                        show: {
                            select: {
                                id: true,
                                title: true,
                                date: true,
                                venue: true,
                                ticketPrice: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                } as any
            } as any
        })
        return user as any
    } catch (error) {
        console.error("Error fetching user profile:", error)
        return null
    }
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function PublicProfilePage({ params }: PageProps) {
    const { id } = await params
    const currentUser = await getCurrentUser()
    const userProfile = await getUserProfile(id)

    if (!userProfile) {
        notFound()
    }

    const isOwner = currentUser?.id === id
    const shows = userProfile.createdShows || []

    // Sort shows into upcoming and past
    const now = new Date()
    const upcomingShows = shows.filter((s: any) => new Date(s.date) >= now)
    const pastShows = shows.filter((s: any) => new Date(s.date) < now)

    const youtubeUrls = [...(userProfile.organizerProfile?.youtubeUrls || []), ...(userProfile.comedianProfile?.youtubeUrls || [])]
    const instagramUrls = [...(userProfile.organizerProfile?.instagramUrls || []), ...(userProfile.comedianProfile?.instagramUrls || [])]

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getInstagramId = (url: string) => {
        const match = url.match(/(?:instagram\.com\/reel\/|instagram\.com\/p\/)([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        {isOwner ? "My Profile" : `${userProfile.name || 'User'}'s Profile`}
                    </h1>
                    {!isOwner && (
                        <p className="text-zinc-600 dark:text-zinc-400 mt-2">Viewing public profile</p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <ProfileCard user={userProfile} isOwner={isOwner} />

                        {/* Bio Section for Public View */}
                        {(userProfile.bio || userProfile.organizerProfile?.description) && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4 text-zinc-900 border-b pb-2">About</h2>
                                <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">
                                    {userProfile.bio || userProfile.organizerProfile?.description}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        {/* Social Media & Media Section */}
                        {(youtubeUrls.length > 0 || instagramUrls.length > 0) && (
                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Media Showcase</h2>
                                <div className="space-y-8">
                                    {/* YouTube Featured */}
                                    {youtubeUrls.slice(0, 1).map((url, i) => {
                                        const videoId = getYouTubeId(url);
                                        if (videoId) {
                                            return (
                                                <div key={`yt-${i}`} className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-lg border border-zinc-200">
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
                                        return null;
                                    })}

                                    {/* Instagram Reels Grid */}
                                    {instagramUrls.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {instagramUrls.slice(0, 2).map((url, i) => {
                                                const reelId = getInstagramId(url);
                                                if (reelId) {
                                                    return (
                                                        <div key={`ig-${i}`} className="flex justify-center bg-white p-2 rounded-xl shadow-md border border-zinc-100">
                                                            <iframe
                                                                className="rounded-lg w-full max-w-[320px]"
                                                                src={`https://www.instagram.com/reel/${reelId}/embed`}
                                                                height="480"
                                                                frameBorder="0"
                                                                scrolling="no"
                                                                allowTransparency={true}
                                                            ></iframe>
                                                        </div>
                                                    )
                                                }
                                                return null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Shows Listed Section */}
                        {shows.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Shows</h2>

                                {upcomingShows.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                                            <span>📅</span> Upcoming Shows
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {upcomingShows.map((show: any) => (
                                                <Link
                                                    key={show.id}
                                                    href={`/shows/${show.id}`}
                                                    className="bg-white border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-shadow flex gap-4"
                                                >
                                                    {show.posterImageUrl && (
                                                        <img src={show.posterImageUrl} className="w-20 h-28 object-cover rounded shadow-sm" alt="" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-zinc-900 truncate">{show.title}</h4>
                                                        <p className="text-sm text-zinc-600 mt-1">📍 {show.venue}</p>
                                                        <p className="text-sm text-zinc-600">🗓️ {new Date(show.date).toLocaleDateString()}</p>
                                                        <div className="mt-2 text-blue-600 text-sm font-medium">Book Now →</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {pastShows.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-zinc-500 mb-4">Past Work</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
                                            {pastShows.slice(0, 4).map((show: any) => (
                                                <Link
                                                    key={show.id}
                                                    href={`/shows/${show.id}`}
                                                    className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex gap-4 grayscale"
                                                >
                                                    {show.posterImageUrl && (
                                                        <img src={show.posterImageUrl} className="w-16 h-20 object-cover rounded" alt="" />
                                                    )}
                                                    <div>
                                                        <h4 className="font-semibold text-zinc-700">{show.title}</h4>
                                                        <p className="text-xs text-zinc-500 mt-1">{new Date(show.date).toLocaleDateString()}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Booking Activity (Private for owner/admin) */}
                        {(isOwner || currentUser?.role === 'ADMIN') && (
                            <section className="pt-8 border-t">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Booking Activity</h2>
                                <UserBookings bookings={userProfile.bookings || []} />
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
