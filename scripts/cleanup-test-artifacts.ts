
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();

    try {
        console.log('Cleaning up test data...');

        // Find all test shows created by the test suite
        // They are identified in test-db.ts by 'test-' or specific flow titles

        // 1. Delete dependent Bookings first
        await prisma.booking.deleteMany({
            where: {
                show: {
                    OR: [
                        { title: { contains: 'Audience Flow Show' } },
                        { title: { contains: 'Draft Lifecycle Show' } },
                        { createdBy: { startsWith: 'test-user' } },
                        { createdBy: { startsWith: 'flow' } }
                    ]
                }
            }
        });

        // 2. Delete dependent ShowComedians
        await prisma.showComedian.deleteMany({
            where: {
                show: {
                    OR: [
                        { title: { contains: 'Audience Flow Show' } },
                        { title: { contains: 'Draft Lifecycle Show' } },
                        { createdBy: { startsWith: 'test-user' } },
                        { createdBy: { startsWith: 'flow' } }
                    ]
                }
            }
        });

        // 3. Delete dependent TicketInventory
        await prisma.ticketInventory.deleteMany({
            where: {
                show: {
                    OR: [
                        { title: { contains: 'Audience Flow Show' } },
                        { title: { contains: 'Draft Lifecycle Show' } },
                        { createdBy: { startsWith: 'test-user' } },
                        { createdBy: { startsWith: 'flow' } }
                    ]
                }
            }
        });

        // 4. Now delete Shows
        const count = await prisma.show.deleteMany({
            where: {
                OR: [
                    { title: { contains: 'Audience Flow Show' } },
                    { title: { contains: 'Draft Lifecycle Show' } },
                    { createdBy: { startsWith: 'test-user' } },
                    { createdBy: { startsWith: 'flow' } }
                ]
            }
        });

        console.log(`Deleted ${count.count} test shows.`);

        // 5. Delete Comedians & Profiles dependent on these users
        await prisma.showComedian.deleteMany({
            where: { comedian: { createdBy: { startsWith: 'flow' } } }
        });

        // Expanded cleanup for Comedians created by test users
        await prisma.comedian.deleteMany({
            where: {
                OR: [
                    { createdBy: { startsWith: 'flow' } },
                    { creator: { email: { contains: 'test.com' } } }
                ]
            }
        });

        await prisma.comedianProfile.deleteMany({
            where: { user: { email: { contains: 'test.com' } } }
        });

        await prisma.organizerProfile.deleteMany({
            where: { user: { email: { contains: 'test.com' } } }
        });

        await prisma.organizerApproval.deleteMany({
            where: { organizer: { user: { email: { contains: 'test.com' } } } }
        });

        await prisma.session.deleteMany({
            where: { user: { email: { contains: 'test.com' } } }
        });

        await prisma.account.deleteMany({
            where: { user: { email: { contains: 'test.com' } } }
        });

        const userCount = await prisma.user.deleteMany({
            where: {
                OR: [
                    { id: { startsWith: 'flow' } },
                    { email: { contains: 'test.com' } } // Be careful with this one
                ]
            }
        });

        console.log(`Deleted ${userCount.count} test users.`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
