import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function BookingsPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/auth/signin?callback=/bookings")
    }

    const bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: {
            show: {
                select: {
                    id: true,
                    title: true,
                    date: true,
                    venue: true,
                    ticketPrice: true,
                    posterImageUrl: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONFIRMED_UNPAID':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Confirmed
                    </span>
                )
            case 'CONFIRMED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                    </span>
                )
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Cancelled
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                )
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
                    My Bookings
                </h1>

                {bookings.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-12 text-center">
                        <div className="text-6xl mb-4">🎭</div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                            No Bookings Yet
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            You haven't booked any comedy shows yet. Start exploring!
                        </p>
                        <Link
                            href="/shows"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Browse Shows
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const isPastShow = new Date(booking.show.date) < new Date()

                            return (
                                <div
                                    key={booking.id}
                                    className={`bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden ${isPastShow ? 'opacity-75' : ''
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Show Image */}
                                        <div className="md:w-48 h-32 md:h-auto bg-zinc-200 dark:bg-zinc-800 flex-shrink-0">
                                            {booking.show.posterImageUrl ? (
                                                <img
                                                    src={booking.show.posterImageUrl}
                                                    alt={booking.show.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                                    🎭
                                                </div>
                                            )}
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex-1 p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                                        {booking.show.title}
                                                    </h3>
                                                    {isPastShow && (
                                                        <span className="text-xs text-zinc-500">Past Event</span>
                                                    )}
                                                </div>
                                                {getStatusBadge(booking.status)}
                                            </div>

                                            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                                <p className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    {new Date(booking.show.date).toLocaleDateString('en-IN', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <span>📍</span>
                                                    {booking.show.venue}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded">
                                                    <span className="text-zinc-600 dark:text-zinc-400">Tickets: </span>
                                                    <span className="font-semibold text-zinc-900 dark:text-white">
                                                        {booking.quantity}
                                                    </span>
                                                </div>
                                                <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded">
                                                    <span className="text-zinc-600 dark:text-zinc-400">Total: </span>
                                                    <span className="font-semibold text-zinc-900 dark:text-white">
                                                        ₹{booking.totalAmount + booking.bookingFee}
                                                    </span>
                                                </div>
                                                <div className="text-zinc-500 text-xs">
                                                    Ref: {booking.id.slice(0, 8).toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
