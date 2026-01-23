import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkComedian() {
    const user = await prisma.user.findUnique({
        where: { email: 'aifoxcoding@gmail.com' },
        include: {
            createdComedians: true,
        }
    })

    console.log('User:', user?.email)
    console.log('User ID:', user?.id)
    console.log('User Role:', user?.role)
    console.log('Created Comedians:', user?.createdComedians)

    // Check most recent show
    const recentShow = await prisma.show.findFirst({
        where: { title: 'Comedy Nights Live' },
        include: {
            showComedians: {
                include: {
                    comedian: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    console.log('\nRecent Show:', recentShow?.title)
    console.log('Show Comedians:', recentShow?.showComedians)
}

checkComedian()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
