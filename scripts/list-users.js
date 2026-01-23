const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        include: {
            accounts: true
        }
    })

    console.log('Total users:', users.length)
    users.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name || 'NULL'}, Accounts: ${user.accounts.length}`)
        user.accounts.forEach(acc => {
            console.log(`  - Provider: ${acc.provider}, ProviderAccountId: ${acc.providerAccountId}`)
        })
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
