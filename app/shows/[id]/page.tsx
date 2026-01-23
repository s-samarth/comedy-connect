import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ShowBooking from "@/components/shows/ShowBooking"
import { getCurrentUser } from "@/lib/auth"

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
          email: true
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
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
            <div className="relative z-10 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{show.title}</h1>
              <div className="flex items-center gap-4 text-lg">
                <span>📅 {new Date(show.date).toLocaleDateString()}</span>
                <span>🕐 {new Date(show.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="mt-2">
                <span>📍 {show.venue}</span>
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

                {/* Comedians */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Featuring</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {show.showComedians.map((showComedian) => (
                      <div key={showComedian.comedian.id} className="text-center">
                        {showComedian.comedian.profileImageUrl && (
                          <img
                            src={showComedian.comedian.profileImageUrl}
                            alt={showComedian.comedian.name}
                            className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
                          />
                        )}
                        <h3 className="font-medium">{showComedian.comedian.name}</h3>
                        {showComedian.comedian.bio && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {showComedian.comedian.bio}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Information */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Ticket Information</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Tickets:</span>
                        <span className="ml-2 font-medium">{show.totalTickets}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Available:</span>
                        <span className="ml-2 font-medium">{show.ticketInventory?.available || 0}</span>
                        <span className="ml-2 font-medium text-green-600">
                          ({show.ticketInventory?.available || 0} available)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Price per Ticket:</span>
                        <span className="ml-2 font-medium">₹{show.ticketPrice}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 font-medium ${(show.ticketInventory?.available || 0) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {(show.ticketInventory?.available || 0) > 0 ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizer Info */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Organized by</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {show.creator.name?.charAt(0).toUpperCase() || 'O'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{show.creator.name || 'Organizer'}</p>
                      <p className="text-sm text-gray-600">{show.creator.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Section */}
              <div className="md:col-span-1">
                <ShowBooking show={show} user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
