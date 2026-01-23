import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function publishAllShows() {
    console.log('📢 Publishing all draft shows...\n')

    // Find all unpublished shows
    const draftShows = await prisma.show.findMany({
        where: { isPublished: false },
        select: {
            id: true,
            title: true,
            venue: true,
            date: true,
        }
    })

    if (draftShows.length === 0) {
        console.log('✅ No draft shows found. All shows are already published!\n')
        return
    }

    console.log(`Found ${draftShows.length} draft show(s):\n`)
    for (const show of draftShows) {
        console.log(`  - ${show.title}`)
        console.log(`    Venue: ${show.venue}`)
        console.log(`    Date: ${show.date}`)
        console.log(`    ID: ${show.id}`)
        console.log('')
    }

    // Publish all draft shows
    const result = await prisma.show.updateMany({
        where: { isPublished: false },
        data: { isPublished: true }
    })

    console.log(`✅ Successfully published ${result.count} show(s)!`)
    console.log('\nThese shows are now visible to all users (guests, audience, etc.)\n')
}

publishAllShows()
    .catch((error) => {
        console.error('❌ Error:', error)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
