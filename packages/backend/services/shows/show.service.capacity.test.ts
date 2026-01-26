
import { showService } from "./show.service";
import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/errors";

describe("ShowService Capacity Verification (P2.1)", () => {
    let adminUserId: string;
    let showId: string;

    beforeAll(async () => {
        // Create a unique admin user
        const user = await prisma.user.create({
            data: {
                email: `capacity_test_${Date.now()}@test.com`,
                role: "ADMIN",
                name: "Capacity Test Admin"
            }
        });
        adminUserId = user.id;
    });

    afterAll(async () => {
        // Cleanup cascading deletes
        if (adminUserId) {
            await prisma.user.delete({ where: { id: adminUserId } });
        }
    });

    it("should prevent reducing capacity below sold tickets", async () => {
        // 1. Create a Show
        const show = await showService.createShow(adminUserId, "ADMIN", {
            title: "Capacity Test Show",
            date: new Date(Date.now() + 10000000),
            venue: "Test Venue",
            googleMapsLink: "https://maps.google.com/test",
            ticketPrice: 100,
            totalTickets: 10, // Initial capacity 10
            durationMinutes: 60
        });
        showId = show.id;

        // 2. Publish Show
        await showService.publishShow(showId, adminUserId, "ADMIN");

        // 3. Create a Booking (5 tickets) manually
        await prisma.booking.create({
            data: {
                showId: showId,
                userId: adminUserId, // Admin booking own show is fine for test
                quantity: 5,         // 5 sold
                totalAmount: 500,
                platformFee: 40,
                status: "CONFIRMED"
            }
        });

        // 4. Try to reduce capacity to 8 (Should Succeed - 8 >= 5)
        const updatedShow = await showService.updateShow(showId, adminUserId, "ADMIN", {
            totalTickets: 8
        });
        expect(updatedShow.totalTickets).toBe(8);

        // 5. Try to reduce capacity to 4 (Should Fail - 4 < 5)
        await expect(
            showService.updateShow(showId, adminUserId, "ADMIN", {
                totalTickets: 4
            })
        ).rejects.toThrow(ValidationError);

        await expect(
            showService.updateShow(showId, adminUserId, "ADMIN", {
                totalTickets: 4
            })
        ).rejects.toThrow("Cannot reduce capacity below sold tickets");
    });
});
