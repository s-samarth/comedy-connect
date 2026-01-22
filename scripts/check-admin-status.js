
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdmin() {
    const email = 'samarthsaraswat13@gmail.com'
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log('User not found')
    } else {
        console.log('User found:', user.email)
        console.log('Role:', user.role)
        console.log('Has adminPasswordHash:', !!user.adminPasswordHash)
        console.log('Hash length:', user.adminPasswordHash ? user.adminPasswordHash.length : 0)
    }
}

checkAdmin()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
