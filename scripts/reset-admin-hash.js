
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetAdminHash() {
    const email = 'samarthsaraswat13@gmail.com'

    await prisma.user.update({
        where: { email },
        data: {
            adminPasswordHash: null,
            adminResetCode: null,
            adminResetExpires: null
        }
    })

    console.log('Successfully cleared admin password hash and reset codes for:', email)
}

resetAdminHash()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
