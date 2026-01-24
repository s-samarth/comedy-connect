import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const showId = process.argv[2]
    if (!showId) {
        console.error('Please provide a show ID')
        return
    }

    const show = await prisma.show.findUnique({
        where: { id: showId },
        include: {
            creator: true,
            showComedians: {
                include: {
                    comedian: true
                }
            }
        }
    })

    if (!show) {
        console.log('Show not found')
        return
    }

    console.log('Show:', {
        title: show.title,
        creatorRole: show.creator.role,
        comedianCount: show.showComedians.length,
        comedians: show.showComedians.map(sc => sc.comedian.name)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
