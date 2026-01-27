"use client"

import Link from "next/link"

interface ShowCardProps {
    show: {
        id: string
        title: string
        description?: string
        date: string | Date
        venue: string
        ticketPrice: number
        totalTickets: number
        posterImageUrl?: string
        durationMinutes?: number
        ticketInventory?: {
            available: number
        } | Array<{ available: number }>
        showComedians?: Array<{
            comedian: {
                id: string
                name: string
                youtubeUrls?: string[]
                instagramUrls?: string[]
            }
        }>
        // Stats within show object (optional, if passed via show)
        stats?: {
            ticketsSold: number
            revenue: number
        }
    }
    href?: string
    actionButtons?: React.ReactNode
    extraDetails?: React.ReactNode
    stats?: React.ReactNode // Stats as direct prop (JSX)
    className?: string
}

export default function ShowCard({ show, href, actionButtons, extraDetails, stats, className = "" }: ShowCardProps) {
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price)
    }

    // Handle inventory check (it might be an array or object depending on potential API differences, relying on ShowDiscovery logic)
    const availableTickets = Array.isArray(show.ticketInventory)
        ? show.ticketInventory[0]?.available
        : show.ticketInventory?.available ?? 0

    const isSoldOut = availableTickets === 0

    const CardContent = () => (
        <>
            {/* Poster or placeholder */}
            <div className="h-48 bg-zinc-200 flex items-center justify-center overflow-hidden relative">
                {show.posterImageUrl ? (
                    <img
                        src={show.posterImageUrl}
                        alt={show.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="text-zinc-400 text-center">
                        <div className="text-4xl mb-2">🎭</div>
                        <p>No Poster</p>
                    </div>
                )}
                {/* Sold Out Badge */}
                {isSoldOut && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Sold Out
                    </div>
                )}
            </div>

            <div className="p-6">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-zinc-900 group-hover:text-blue-600 transition-colors">
                    {show.title}
                </h3>

                {show.description && (
                    <p className="text-zinc-600 text-sm mb-3 line-clamp-2">{show.description}</p>
                )}

                <div className="space-y-2 text-sm text-zinc-600 mb-4">
                    <div className="flex items-center">
                        <span className="font-medium">📅</span>
                        <span className="ml-2">{formatDate(show.date)} ({show.durationMinutes || 60} mins)</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-medium">📍</span>
                        <span className="ml-2">{show.venue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="font-medium">🎫</span>
                            <span className="ml-2">{formatPrice(show.ticketPrice)}</span>
                        </div>
                    </div>
                </div>

                {/* Comedians */}
                {show.showComedians && show.showComedians.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {show.showComedians.slice(0, 3).map((showComedian) => (
                                <span
                                    key={showComedian.comedian.id}
                                    className="inline-block px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded"
                                >
                                    {showComedian.comedian.name}
                                </span>
                            ))}
                            {show.showComedians.length > 3 && (
                                <span className="inline-block px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded">
                                    +{show.showComedians.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {stats}

                {extraDetails}

                {actionButtons && (
                    <div className="mt-4 pt-4 border-t">
                        {actionButtons}
                    </div>
                )}
            </div>
        </>
    )

    if (href) {
        return (
            <Link
                href={href}
                className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow block group ${className}`}
            >
                <CardContent />
            </Link>
        )
    }

    return (
        <div className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow block group ${className}`}>
            <CardContent />
        </div>
    )
}
