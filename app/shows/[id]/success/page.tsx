import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ bookingId?: string }>
}

export default async function BookingSuccessPage({ params, searchParams }: PageProps) {
    const { id: showId } = await params
    const { bookingId } = await searchParams

    const user = await getCurrentUser()

    if (!user) {
        redirect(`/auth/signin?callback=/shows/${showId}`)
    }

    if (!bookingId) {
        notFound()
    }

    const booking = await prisma.booking.findUnique({
        where: {
            id: bookingId,
            userId: user.id // Ensure user can only see their own booking
        },
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
        }
    })

    if (!booking) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Success Icon */}
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                        <p className="text-gray-600">
                            Your tickets have been reserved successfully.
                        </p>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                        <h2 className="font-semibold text-gray-900 mb-4 text-lg">{booking.show.title}</h2>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">📅</span>
                                <div>
                                    <p className="text-sm text-gray-600">Date & Time</p>
                                    <p className="font-medium">
                                        {new Date(booking.show.date).toLocaleDateString('en-IN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-gray-600">
                                        {new Date(booking.show.date).toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="text-xl">📍</span>
                                <div>
                                    <p className="text-sm text-gray-600">Venue</p>
                                    <p className="font-medium">{booking.show.venue}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <span className="text-xl">🎫</span>
                                <div>
                                    <p className="text-sm text-gray-600">Tickets</p>
                                    <p className="font-medium">
                                        {booking.quantity} {booking.quantity === 1 ? 'Ticket' : 'Tickets'}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">Total Amount</span>
                                    <span className="text-xl font-bold text-green-600">₹{booking.totalAmount}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Payment to be collected at venue</p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Reference */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-600 mb-1">Booking Reference</p>
                        <p className="font-mono font-semibold text-blue-900">{booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            href="/bookings"
                            className="w-full block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            View My Bookings
                        </Link>
                        <Link
                            href="/shows"
                            className="w-full block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Browse More Shows
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
