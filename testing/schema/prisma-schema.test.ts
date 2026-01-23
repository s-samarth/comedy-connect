/**
 * Schema Tests: Prisma Schema Validation
 * 
 * Tests to ensure the Prisma schema is valid and correctly configured
 */

import { PrismaClient, UserRole, BookingStatus, ApprovalStatus } from '@prisma/client';
import {
    getTestPrisma,
    cleanupTestData,
    disconnectTestDb
} from '../config/test-db';

describe('Schema: Prisma Schema Validation', () => {
    const prisma = getTestPrisma();

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    describe('Database Connection', () => {
        it('should connect to the database successfully', async () => {
            const result = await prisma.$queryRaw`SELECT 1 as connected`;
            expect(result).toBeTruthy();
        });

        it('should have a valid database URL', async () => {
            expect(process.env.DATABASE_URL || process.env.DATABASE_URL_TEST).toBeTruthy();
        });
    });

    describe('Core Models Exist', () => {
        it('User model is accessible', async () => {
            const count = await prisma.user.count();
            expect(typeof count).toBe('number');
        });

        it('Show model is accessible', async () => {
            const count = await prisma.show.count();
            expect(typeof count).toBe('number');
        });

        it('Booking model is accessible', async () => {
            const count = await prisma.booking.count();
            expect(typeof count).toBe('number');
        });

        it('Comedian model is accessible', async () => {
            const count = await prisma.comedian.count();
            expect(typeof count).toBe('number');
        });

        it('TicketInventory model is accessible', async () => {
            const count = await prisma.ticketInventory.count();
            expect(typeof count).toBe('number');
        });

        it('OrganizerProfile model is accessible', async () => {
            const count = await prisma.organizerProfile.count();
            expect(typeof count).toBe('number');
        });

        it('ShowComedian model is accessible', async () => {
            const count = await prisma.showComedian.count();
            expect(typeof count).toBe('number');
        });
    });

    describe('Enums Are Defined', () => {
        it('UserRole enum has expected values', () => {
            const expectedRoles = [
                'AUDIENCE',
                'ORGANIZER_UNVERIFIED',
                'ORGANIZER_VERIFIED',
                'ADMIN',
                'COMEDIAN_UNVERIFIED',
                'COMEDIAN_VERIFIED',
            ];

            for (const role of expectedRoles) {
                expect(Object.values(UserRole)).toContain(role);
            }
        });

        it('BookingStatus enum has expected values', () => {
            const expectedStatuses = [
                'PENDING',
                'CONFIRMED',
                'CONFIRMED_UNPAID',
                'CANCELLED',
                'FAILED',
            ];

            for (const status of expectedStatuses) {
                expect(Object.values(BookingStatus)).toContain(status);
            }
        });

        it('ApprovalStatus enum has expected values', () => {
            const expectedStatuses = [
                'PENDING',
                'APPROVED',
                'REJECTED',
            ];

            for (const status of expectedStatuses) {
                expect(Object.values(ApprovalStatus)).toContain(status);
            }
        });
    });

    describe('Required Fields', () => {
        it('User requires email', async () => {
            await expect(
                prisma.user.create({
                    data: {
                        id: 'test-missing-email',
                        // Missing email - this will fail
                    } as any,
                })
            ).rejects.toThrow();
        });

        it('Show requires title, venue, date, ticketPrice, totalTickets', async () => {
            await expect(
                prisma.show.create({
                    data: {
                        id: 'test-missing-fields',
                        title: 'Test',
                        // Missing required fields
                    } as any,
                })
            ).rejects.toThrow();
        });

        it('Booking requires showId, userId, quantity', async () => {
            await expect(
                prisma.booking.create({
                    data: {
                        id: 'test-booking-missing',
                        // Missing required fields
                    } as any,
                })
            ).rejects.toThrow();
        });
    });

    describe('Unique Constraints', () => {
        it('User email must be unique', async () => {
            const email = `unique-test-${Date.now()}@test.com`;

            await prisma.user.create({
                data: {
                    id: `test-unique-1-${Date.now()}`,
                    email,
                },
            });

            await expect(
                prisma.user.create({
                    data: {
                        id: `test-unique-2-${Date.now()}`,
                        email, // Same email
                    },
                })
            ).rejects.toThrow();
        });

        it('OrganizerProfile userId must be unique', async () => {
            const user = await prisma.user.create({
                data: {
                    id: `test-org-unique-${Date.now()}`,
                    email: `org-unique-${Date.now()}@test.com`,
                },
            });

            await prisma.organizerProfile.create({
                data: {
                    id: `test-org-profile-1-${Date.now()}`,
                    userId: user.id,
                    name: 'Profile 1',
                },
            });

            await expect(
                prisma.organizerProfile.create({
                    data: {
                        id: `test-org-profile-2-${Date.now()}`,
                        userId: user.id, // Same userId
                        name: 'Profile 2',
                    },
                })
            ).rejects.toThrow();
        });

        it('ShowComedian showId+comedianId must be unique', async () => {
            const creator = await prisma.user.create({
                data: {
                    id: `test-sc-unique-creator-${Date.now()}`,
                    email: `sc-unique-${Date.now()}@test.com`,
                    role: UserRole.ORGANIZER_VERIFIED,
                },
            });

            const show = await prisma.show.create({
                data: {
                    id: `test-sc-unique-show-${Date.now()}`,
                    title: 'Unique Test Show',
                    venue: 'Test Venue',
                    date: new Date(),
                    ticketPrice: 500,
                    totalTickets: 100,
                    createdBy: creator.id,
                },
            });

            const comedian = await prisma.comedian.create({
                data: {
                    id: `test-sc-unique-comedian-${Date.now()}`,
                    name: 'Unique Comedian',
                    createdBy: creator.id,
                },
            });

            await prisma.showComedian.create({
                data: {
                    id: `test-sc-1-${Date.now()}`,
                    showId: show.id,
                    comedianId: comedian.id,
                    order: 1,
                },
            });

            await expect(
                prisma.showComedian.create({
                    data: {
                        id: `test-sc-2-${Date.now()}`,
                        showId: show.id, // Same show
                        comedianId: comedian.id, // Same comedian
                        order: 2,
                    },
                })
            ).rejects.toThrow();
        });
    });

    describe('Foreign Key Relationships', () => {
        it('Booking requires valid showId', async () => {
            const user = await prisma.user.create({
                data: {
                    id: `test-fk-booking-user-${Date.now()}`,
                    email: `fk-booking-${Date.now()}@test.com`,
                },
            });

            await expect(
                prisma.booking.create({
                    data: {
                        id: `test-fk-booking-${Date.now()}`,
                        showId: 'non-existent-show-id',
                        userId: user.id,
                        quantity: 1,
                        totalAmount: 500,
                        platformFee: 40,
                    },
                })
            ).rejects.toThrow();
        });

        it('Show requires valid createdBy (userId)', async () => {
            await expect(
                prisma.show.create({
                    data: {
                        id: `test-fk-show-${Date.now()}`,
                        title: 'FK Test Show',
                        venue: 'Test Venue',
                        date: new Date(),
                        ticketPrice: 500,
                        totalTickets: 100,
                        createdBy: 'non-existent-user-id',
                    },
                })
            ).rejects.toThrow();
        });
    });

    describe('Cascade Deletes', () => {
        it('Deleting a show should delete its TicketInventory', async () => {
            const creator = await prisma.user.create({
                data: {
                    id: `test-cascade-creator-${Date.now()}`,
                    email: `cascade-${Date.now()}@test.com`,
                    role: UserRole.ORGANIZER_VERIFIED,
                },
            });

            const show = await prisma.show.create({
                data: {
                    id: `test-cascade-show-${Date.now()}`,
                    title: 'Cascade Test Show',
                    venue: 'Test Venue',
                    date: new Date(),
                    ticketPrice: 500,
                    totalTickets: 100,
                    createdBy: creator.id,
                    ticketInventory: {
                        create: {
                            id: `test-cascade-inv-${Date.now()}`,
                            available: 100,
                        },
                    },
                },
                include: { ticketInventory: true },
            });

            expect(show.ticketInventory).toBeTruthy();

            // Delete the show
            await prisma.show.delete({ where: { id: show.id } });

            // Inventory should be deleted too
            const inventory = await prisma.ticketInventory.findUnique({
                where: { showId: show.id },
            });
            expect(inventory).toBeNull();
        });
    });
});
