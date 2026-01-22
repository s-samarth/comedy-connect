#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function confirmAction(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function cleanupDatabase() {
  console.log('🧹 Database Cleanup Script for Comedy Connect');
  console.log('==========================================\n');

  try {
    // Get current database stats
    console.log('Current database statistics:');
    const userCount = await prisma.user.count();
    const showCount = await prisma.show.count();
    const comedianCount = await prisma.comedian.count();
    const bookingCount = await prisma.booking.count();
    const organizerCount = await prisma.organizerProfile.count();

    console.log(`- Users: ${userCount}`);
    console.log(`- Shows: ${showCount}`);
    console.log(`- Comedians: ${comedianCount}`);
    console.log(`- Bookings: ${bookingCount}`);
    console.log(`- Organizer Profiles: ${organizerCount}\n`);

    const confirmed = await confirmAction('⚠️  This will permanently delete ALL user data except admin users. Are you sure?');
    
    if (!confirmed) {
      console.log('❌ Cleanup cancelled.');
      return;
    }

    console.log('\n🔄 Starting cleanup process...');

    // Delete in order of dependencies to avoid foreign key constraints
    const operations = [
      { name: 'Bookings', model: prisma.booking },
      { name: 'Ticket Inventory', model: prisma.ticketInventory },
      { name: 'Show Comedians', model: prisma.showComedian },
      { name: 'Shows', model: prisma.show },
      { name: 'Comedians', model: prisma.comedian },
      { name: 'Organizer Approvals', model: prisma.organizerApproval },
      { name: 'Organizer Profiles', model: prisma.organizerProfile },
      { name: 'Sessions', model: prisma.session },
      { name: 'Accounts', model: prisma.account },
    ];

    // Delete non-admin users last
    for (const operation of operations) {
      try {
        const result = await operation.model.deleteMany({});
        console.log(`✅ Deleted ${result.count} ${operation.name}`);
      } catch (error) {
        console.log(`⚠️  Error deleting ${operation.name}: ${error.message}`);
      }
    }

    // Delete all users except admins
    const adminUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      }
    });
    console.log(`✅ Deleted ${adminUsers.count} non-admin users`);

    // Keep admin users but reset their sessions
    const adminSessions = await prisma.session.deleteMany({
      where: {
        user: {
          role: 'ADMIN'
        }
      }
    });
    console.log(`✅ Deleted ${adminSessions.count} admin sessions`);

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('📊 New database statistics:');
    
    const newStats = await prisma.user.count();
    console.log(`- Admin Users: ${newStats} (preserved)`);
    console.log('- All other data has been reset\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Cleanup interrupted by user');
  await prisma.$disconnect();
  rl.close();
  process.exit(0);
});

// Run the cleanup
cleanupDatabase().catch(console.error);
