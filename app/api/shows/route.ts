import { getCurrentUser, requireOrganizer, isVerifiedOrganizer } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Mock comedy shows data
const mockShows = [
  {
    id: "mock-1",
    title: "Stand-Up Saturday Night",
    description: "A hilarious evening with the best comedians in town. Get ready for non-stop laughter!",
    date: new Date("2024-02-10T19:00:00Z").toISOString(),
    venue: "The Comedy Club, Banjara Hills",
    ticketPrice: 499,
    totalTickets: 100,
    posterImageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    createdAt: new Date().toISOString(),
    creator: {
      email: "mock@comedyconnect.com"
    },
    showComedians: [
      {
        comedian: {
          id: "comedian-1",
          name: "Rajesh Kumar",
          bio: "Veteran stand-up comedian with 10+ years experience",
          profileImageUrl: null
        }
      },
      {
        comedian: {
          id: "comedian-2", 
          name: "Priya Sharma",
          bio: "Rising star in the comedy scene",
          profileImageUrl: null
        }
      }
    ],
    ticketInventory: {
      available: 85
    },
    _count: {
      bookings: 15
    }
  },
  {
    id: "mock-2",
    title: "Comedy Central Presents", 
    description: "An exclusive night of premium comedy featuring top performers from across the country.",
    date: new Date("2024-02-15T20:00:00Z").toISOString(),
    venue: "Phoenix Arena, Hitech City",
    ticketPrice: 799,
    totalTickets: 150,
    posterImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop",
    createdAt: new Date().toISOString(),
    creator: {
      email: "mock@comedyconnect.com"
    },
    showComedians: [
      {
        comedian: {
          id: "comedian-3",
          name: "Amit Patel",
          bio: "Winner of Comedy Central's Stand-up Competition",
          profileImageUrl: null
        }
      },
      {
        comedian: {
          id: "comedian-4",
          name: "Sneha Reddy", 
          bio: "Known for her sharp wit and observational humor",
          profileImageUrl: null
        }
      },
      {
        comedian: {
          id: "comedian-5",
          name: "Karan Singh",
          bio: "Master of improvisation and crowd work", 
          profileImageUrl: null
        }
      }
    ],
    ticketInventory: {
      available: 120
    },
    _count: {
      bookings: 30
    }
  },
  {
    id: "mock-3",
    title: "Laughter Therapy",
    description: "Stress-busting comedy session to lift your spirits and heal your soul with laughter.",
    date: new Date("2024-02-20T18:30:00Z").toISOString(),
    venue: "Jubilee Hills Club",
    ticketPrice: 399,
    totalTickets: 80,
    posterImageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=600&fit=crop",
    createdAt: new Date().toISOString(),
    creator: {
      email: "mock@comedyconnect.com"
    },
    showComedians: [
      {
        comedian: {
          id: "comedian-6",
          name: "Dr. Funny Bones",
          bio: "Comedian and psychologist bringing therapeutic comedy",
          profileImageUrl: null
        }
      }
    ],
    ticketInventory: {
      available: 65
    },
    _count: {
      bookings: 15
    }
  },
  {
    id: "mock-4",
    title: "Open Mic Madness",
    description: "Raw, unfiltered comedy from emerging talents. Be the first to discover the next big thing!",
    date: new Date("2024-02-25T19:30:00Z").toISOString(),
    venue: "The Local Cafe, Gachibowli",
    ticketPrice: 299,
    totalTickets: 60,
    posterImageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b5503846a?w=400&h=600&fit=crop",
    createdAt: new Date().toISOString(),
    creator: {
      email: "mock@comedyconnect.com"
    },
    showComedians: [
      {
        comedian: {
          id: "comedian-7",
          name: "Various Artists",
          bio: "New comedians testing their material",
          profileImageUrl: null
        }
      }
    ],
    ticketInventory: {
      available: 45
    },
    _count: {
      bookings: 15
    }
  },
  {
    id: "mock-5",
    title: "Corporate Comedy Night",
    description: "Specially curated for working professionals. Relatable humor about office life and more.",
    date: new Date("2024-03-01T20:30:00Z").toISOString(),
    venue: "Hyderabad International Convention Center",
    ticketPrice: 999,
    totalTickets: 200,
    posterImageUrl: "https://images.unsplash.com/photo-1574397367598-8265d4b4b4c1?w=400&h=600&fit=crop",
    createdAt: new Date().toISOString(),
    creator: {
      email: "mock@comedyconnect.com"
    },
    showComedians: [
      {
        comedian: {
          id: "comedian-8",
          name: "Techie Ted",
          bio: "IT professional turned comedian",
          profileImageUrl: null
        }
      },
      {
        comedian: {
          id: "comedian-9",
          name: "Corporate Cathy",
          bio: "HR manager with a hilarious twist",
          profileImageUrl: null
        }
      }
    ],
    ticketInventory: {
      available: 175
    },
    _count: {
      bookings: 25
    }
  },
  {
    id: "mock-6",
    title: "Weekend Comedy Festival",
    description: "Two-day extravaganza featuring 20+ comedians. The ultimate comedy experience in Hyderabad!",
    date: new Date("2024-03-08T17:00:00Z").toISOString(),
    venue: "Hitex Exhibition Center",
    ticketPrice: 1499,
    totalTickets: 500,
    posterImageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=600&fit=crop",
    createdAt: new Date().toISOString(),
    creator: {
      email: "mock@comedyconnect.com"
    },
    showComedians: [
      {
        comedian: {
          id: "comedian-10",
          name: "Multiple Headliners",
          bio: "Best comedians from across India",
          profileImageUrl: null
        }
      }
    ],
    ticketInventory: {
      available: 400
    },
    _count: {
      bookings: 100
    }
  }
]

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    // Try to get real shows from database
    let shows = []
    try {
      shows = await prisma.show.findMany({
        where: {
          date: {
            gte: new Date()
          }
        },
        include: {
          creator: {
            select: { email: true }
          },
          showComedians: {
            include: {
              comedian: {
                select: { id: true, name: true, bio: true, profileImageUrl: true }
              }
            },
            orderBy: { order: 'asc' }
          },
          ticketInventory: true,
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: { date: 'asc' }
      })
    } catch (dbError) {
      console.log('Database error, using mock data:', dbError)
    }

    // If no shows in database, return mock data
    if (shows.length === 0) {
      return NextResponse.json({ 
        shows: mockShows,
        isMockData: true 
      })
    }

    // Filter based on user role
    let filteredShows = shows
    if (user?.role.startsWith("ORGANIZER")) {
      // Organizers see only their shows
      filteredShows = shows.filter((show: any) => show.createdBy === user.id)
    }

    return NextResponse.json({ 
      shows: filteredShows,
      isMockData: false 
    })
  } catch (error) {
    console.error('Error in shows API:', error)
    
    // Return mock data as fallback
    return NextResponse.json({ 
      shows: mockShows,
      isMockData: true 
    })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireOrganizer()
    
    if (!isVerifiedOrganizer(user.role)) {
      return NextResponse.json({ error: "Account not verified" }, { status: 403 })
    }

    const { 
      title, 
      description, 
      date, 
      venue, 
      ticketPrice, 
      totalTickets,
      comedianIds 
    } = await request.json()

    // Validation
    if (!title || !date || !venue || !ticketPrice || !totalTickets) {
      return NextResponse.json({ 
        error: "Title, date, venue, ticket price, and total tickets are required" 
      }, { status: 400 })
    }

    const showDate = new Date(date)
    if (showDate <= new Date()) {
      return NextResponse.json({ error: "Show date must be in the future" }, { status: 400 })
    }

    if (totalTickets <= 0) {
      return NextResponse.json({ error: "Total tickets must be greater than 0" }, { status: 400 })
    }

    if (ticketPrice <= 0) {
      return NextResponse.json({ error: "Ticket price must be greater than 0" }, { status: 400 })
    }

    // Validate venue is in Hyderabad (basic check)
    if (!venue.toLowerCase().includes("hyderabad")) {
      return NextResponse.json({ 
        error: "Currently only Hyderabad venues are supported" 
      }, { status: 400 })
    }

    // Validate comedians if provided
    if (comedianIds && comedianIds.length > 0) {
      const comedians = await prisma.comedian.findMany({
        where: { 
          id: { in: comedianIds },
          createdBy: user.id 
        }
      })

      if (comedians.length !== comedianIds.length) {
        return NextResponse.json({ 
          error: "Some comedians not found or not owned by you" 
        }, { status: 400 })
      }
    }

    // Create show and related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const show = await tx.show.create({
        data: {
          title,
          description,
          date: showDate,
          venue,
          ticketPrice,
          totalTickets,
          createdBy: user.id
        }
      })

      // Create ticket inventory
      await tx.ticketInventory.create({
        data: {
          showId: show.id,
          available: totalTickets
        }
      })

      // Associate comedians if provided
      if (comedianIds && comedianIds.length > 0) {
        const showComedians = comedianIds.map((comedianId: string, index: number) => ({
          showId: show.id,
          comedianId,
          order: index
        }))

        await tx.showComedian.createMany({
          data: showComedians
        })
      }

      return show
    })

    return NextResponse.json({ show: result })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
