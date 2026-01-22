
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getResetCode() {
    const email = 'samarthsaraswat13@gmail.com'

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (user?.adminResetCode) {
        console.log('Reset Code:', user.adminResetCode)
        console.log('Expires:', user.adminResetExpires)
    } else {
        console.log('No reset code found for', email)
    }
}

getResetCode()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
