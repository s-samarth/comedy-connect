
import { showService } from "../services/shows/show.service";
import { prisma } from "../lib/prisma";

async function verifyCapacityReduction() {
    console.log("Starting P2.1 Verification in script (Backend Context)...");

    // Use a random email to avoid conflicts
    const adminEmail = "script_admin_" + Date.now() + "@test.com";

    let user;
    try {
        user = await prisma.user.create({
            data: {
                email: adminEmail,
                role: "ADMIN",
                name: "Script Admin"
            }
        });
        console.log("Created Admin User:", user.id);

        // 2. Create a Show with 10 tickets
        // Note: 'date' must be in future
        const show = await showService.createShow(user.id, "ADMIN", {
            title: "Capacity Test Show",
            date: new Date(Date.now() + 86400000),
            venue: "Test Venue",
            googleMapsLink: "https://maps.google.com/test",
            ticketPrice: 100,
            totalTickets: 10,
            durationMinutes: 60
        });
        console.log("Created Show:", show.id);

        // 3. Publish Show
        await showService.publishShow(show.id, user.id, "ADMIN");
        console.log("Published Show");

        // 4. Create a Booking (5 tickets) manually via Prisma
        await prisma.booking.create({
            data: {
                showId: show.id,
                userId: user.id,
                quantity: 5,
                totalAmount: 500,
                platformFee: 40,
                status: "CONFIRMED"
            }
        });
        console.log("Created Booking for 5 tickets");

        // 5. Try to reduce capacity to 8 (Should Succeed)
        console.log("Attempting to reduce capacity to 8 (Valid)...");
        await showService.updateShow(show.id, user.id, "ADMIN", {
            totalTickets: 8
        });
        console.log("SUCCESS: Reduced capacity to 8");

        // 6. Try to reduce capacity to 4 (Should Fail, as 5 are sold)
        console.log("Attempting to reduce capacity to 4 (Invalid, 5 sold)...");
        try {
            await showService.updateShow(show.id, user.id, "ADMIN", {
                totalTickets: 4
            });
            console.error("FAILURE: Should have thrown validation error!");
        } catch (error: any) {
            if (error.message.includes("Cannot reduce capacity below sold tickets")) {
                console.log("SUCCESS: Caught expected error:", error.message);
            } else {
                console.error("FAILURE: Caught unexpected error:", error);
            }
        }

    } catch (err: any) {
        console.error("Verification Script Failed:", err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        // Cleanup
        if (user) {
            await prisma.user.delete({ where: { id: user.id } });
            console.log("Cleanup complete");
        }
    }
}

verifyCapacityReduction();
