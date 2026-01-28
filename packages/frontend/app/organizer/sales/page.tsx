import { requireOrganizer } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function OrganizerSalesPage() {
    const user = await requireOrganizer()

    // Fetch all shows with booking stats
    const shows = await prisma.show.findMany({
        where: {
            createdBy: user.id
        },
        include: {
            bookings: {
                where: {
                    status: {
                        in: ["CONFIRMED", "CONFIRMED_UNPAID"]
                    }
                },
                select: {
                    quantity: true,
                    totalAmount: true,
                    platformFee: true
                }
            }
        },
        orderBy: {
            date: 'desc'
        }
    })

    // Calculate aggregates
    const showsWithStats = shows.map((show: any) => {
        const ticketsSold = show.bookings.reduce((sum: number, b: any) => sum + b.quantity, 0)
        const revenue = show.bookings.reduce((sum: number, b: any) => sum + b.totalAmount, 0)
        const platformFee = show.bookings.reduce((sum: number, b: any) => sum + b.platformFee, 0)
        const earnings = revenue - platformFee
        return {
            ...show,
            stats: {
                ticketsSold,
                revenue,
                platformFee,
                earnings,
                bookingsCount: show.bookings.length
            }
        }
    })

    // Calculate totals
    const totalTicketsSold = showsWithStats.reduce((sum: number, show: any) => sum + show.stats.ticketsSold, 0)
    const totalRevenue = showsWithStats.reduce((sum: number, show: any) => sum + show.stats.revenue, 0)
    const totalEarnings = showsWithStats.reduce((sum: number, show: any) => sum + show.stats.earnings, 0)

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price)
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Ticket Sales Report</h1>
                    <Link
                        href="/organizer"
                        className="text-sm text-zinc-600 hover:text-zinc-900"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase">Total Shows</h3>
                        <p className="mt-2 text-3xl font-bold text-zinc-900">{shows.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase">Tickets Sold</h3>
                        <p className="mt-2 text-3xl font-bold text-zinc-900">{totalTicketsSold}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-amber-600">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase">Total Revenue</h3>
                        <p className="mt-2 text-3xl font-bold text-zinc-900">{formatPrice(totalRevenue)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase">Net Earnings</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">{formatPrice(totalEarnings)}</p>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-200">
                        <h2 className="text-lg font-semibold text-zinc-900">Performance by Show</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200">
                            <thead className="bg-zinc-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        Show Details
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        Ticket Price
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        Tickets Sold
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        Platform Fee
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        Earnings
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-zinc-200">
                                {showsWithStats.map((show: any) => (
                                    <tr key={show.id} className="hover:bg-zinc-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-zinc-900">{show.title}</div>
                                            <div className="text-sm text-zinc-500">{show.venue}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                            {formatDate(show.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 text-right">
                                            {formatPrice(show.ticketPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 text-right font-medium">
                                            {show.stats.ticketsSold}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 text-right">
                                            {formatPrice(show.stats.revenue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 text-right">
                                            - {formatPrice(show.stats.platformFee)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-bold">
                                            {formatPrice(show.stats.earnings)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${show.isDisbursed
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                {show.isDisbursed ? "Disbursed" : "To Be Disbursed"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {shows.length === 0 && (
                        <div className="px-6 py-12 text-center text-zinc-500">
                            No shows found. Create your first show to see sales data.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
