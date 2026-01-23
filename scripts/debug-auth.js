const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = 'samarthsaraswat13@gmail.com'
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            accounts: true
        }
    })

    console.log('User found:', JSON.stringify(user, null, 2))

    if (user) {
        console.log('Accounts associated with this user:', user.accounts.length)
        user.accounts.forEach(acc => {
            console.log(`- Provider: ${acc.provider}, ProviderAccountId: ${acc.providerAccountId}`)
        })
    } else {
        console.log('No user found with this email.')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
