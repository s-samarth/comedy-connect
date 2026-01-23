import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createComedianForUser() {
    const user = await prisma.user.findUnique({
        where: { email: 'aifoxcoding@gmail.com' },
        include: {
            comedianProfile: true,
            createdComedians: true,
        }
    })

    if (!user) {
        console.log('❌ User not found')
        return
    }

    console.log('User:', user.email)
    console.log('Has ComedianProfile:', !!user.comedianProfile)
    console.log('Existing Comedians:', user.createdComedians.length)

    if (user.createdComedians.length > 0) {
        console.log('✅ User already has Comedian records')
        return
    }

    // Create Comedian record from ComedianProfile
    const comedian = await prisma.comedian.create({
        data: {
            name: user.comedianProfile?.stageName || user.name || 'Unknown',
            bio: user.comedianProfile?.bio || 'Comedian bio',
            createdBy: user.id,
            youtubeUrls: user.comedianProfile?.youtubeUrls || [],
            instagramUrls: user.comedianProfile?.instagramUrls || [],
        }
    })

    console.log('\n✅ Created Comedian record:')
    console.log('   ID:', comedian.id)
    console.log('   Name:', comedian.name)
    console.log('   Created By:', comedian.createdBy)
}

createComedianForUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
