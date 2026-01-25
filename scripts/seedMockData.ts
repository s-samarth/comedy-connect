// ====================================================================
// DEV-ONLY MOCK DATA SEED SCRIPT
// ====================================================================
// 
// PURPOSE: Creates mock development data for testing
// SAFETY: 
// - NEVER creates ADMIN users or assigns ADMIN roles
// - NEVER modifies existing users or production data
// - ABORTS if NODE_ENV === "production"
// - Uses clearly fake test emails only
// - Safe to run multiple times (idempotent)
//
// USAGE: 
//   npx ts-node scripts/seedMockData.ts
//   or
//   NODE_ENV=development npx ts-node scripts/seedMockData.ts
// ====================================================================

import { PrismaClient, UserRole } from '@prisma/client';

// SAFETY CHECK: Abort immediately if in production
if (process.env.NODE_ENV === 'production') {
  console.error('🚨 CRITICAL: Cannot run seed script in production environment!');
  console.error('This script is for DEVELOPMENT ONLY.');
  process.exit(1);
}

const prisma = new PrismaClient();

// Mock data generators
const generateMockUsers = () => [
  // 10 Audience users
  ...Array.from({ length: 10 }, (_, i) => ({
    email: `test+audience${i + 1}@example.com`,
    name: `Audience User ${i + 1}`,
    role: UserRole.AUDIENCE as UserRole,
    phone: `+9198765432${i.toString().padStart(2, '0')}`,
    age: 25 + (i % 15),
    city: 'Hyderabad',
    language: 'English',
    bio: `Comedy enthusiast ${i + 1} who loves stand-up shows`,
    interests: JSON.stringify(['stand-up', 'improv', 'sketch'])
  })),

  // 5 Unverified organizers
  ...Array.from({ length: 5 }, (_, i) => ({
    email: `test+organizer-unverified${i + 1}@example.com`,
    name: `Unverified Organizer ${i + 1}`,
    role: UserRole.ORGANIZER_UNVERIFIED as UserRole,
    phone: `+9198765433${i.toString().padStart(2, '0')}`,
    age: 30 + (i % 10),
    city: 'Hyderabad',
    language: 'English',
    bio: `Aspiring event organizer ${i + 1} passionate about comedy`,
    interests: JSON.stringify(['event-management', 'comedy'])
  })),

  // 5 Verified organizers
  ...Array.from({ length: 5 }, (_, i) => ({
    email: `test+organizer-verified${i + 1}@example.com`,
    name: `Verified Organizer ${i + 1}`,
    role: UserRole.ORGANIZER_VERIFIED as UserRole,
    phone: `+9198765434${i.toString().padStart(2, '0')}`,
    age: 35 + (i % 8),
    city: 'Hyderabad',
    language: 'English',
    bio: `Professional event organizer ${i + 1} with comedy show expertise`,
    interests: JSON.stringify(['event-management', 'comedy', 'production'])
  }))
];

const generateMockOrganizerProfiles = (organizerUsers: any[]) => {
  return organizerUsers.map((user, index) => ({
    userId: user.id,
    name: user.name,
    contact: user.phone,
    description: `${user.name} - Professional comedy event organizer specializing in stand-up shows and open mic nights in Hyderabad.`,
    venue: index % 2 === 0 ? 'Hyderabad Comedy Club' : 'Laugh Factory Hyderabad'
  }));
};

const generateMockComedians = (verifiedOrganizers: any[]) => {
  const comedianNames = [
    'Raj Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
    'Anjali Nair', 'Rohit Verma', 'Kavita Menon', 'Arjun Kumar', 'Meera Iyer',
    'Karan Shah', 'Divya Gupta', 'Rahul Bose', 'Tanya Malhotra', 'Nikhil Choudhary'
  ];

  return comedianNames.map((name, index) => {
    const organizerIndex = index % verifiedOrganizers.length;
    return {
      name,
      bio: `${name} is a stand-up comedian with ${2 + (index % 5)} years of experience. Known for observational comedy and witty takes on everyday life.`,
      profileImageUrl: `https://picsum.photos/seed/comedian${index}/400/400.jpg`,
      socialLinks: JSON.stringify({
        instagram: `@${name.toLowerCase().replace(' ', '')}_comedy`,
        twitter: `@${name.toLowerCase().replace(' ', '')}_laughs`,
        youtube: `https://youtube.com/@${name.toLowerCase().replace(' ', '')}comedy`
      }),
      createdBy: verifiedOrganizers[organizerIndex].id
    };
  });
};

const generateMockShows = (verifiedOrganizers: any[], comedians: any[]) => {
  const venues = [
    'Hyderabad Comedy Club', 'Laugh Factory Hyderabad', 'Comedy Central Hyderabad',
    'The Punchline', 'Hyderabad Laughs', 'Stand-up Square', 'Joke Junction'
  ];

  const showTitles = [
    'Weekend Laughter Riot', 'Comedy Night Special', 'Stand-up Saturday',
    'Hyderabad Laughs Live', 'Comedy Extravaganza', 'Joke Marathon',
    'Laugh Out Loud', 'Comedy Showcase', 'Funny Business', 'The Big Laugh',
    'Comedy Blast', 'Humor Hour', 'Giggle Fest', 'Comedy Carnival', 'Laugh Attack'
  ];

  const shows = [];
  const now = new Date();

  for (let i = 0; i < showTitles.length; i++) {
    const organizerIndex = i % verifiedOrganizers.length;
    const showDate = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000); // Future dates only
    const numComedians = 2 + Math.floor(Math.random() * 3); // 2-4 comedians per show

    shows.push({
      title: showTitles[i],
      description: `An amazing night of comedy featuring ${numComedians} talented comedians. Join us for an evening filled with laughter and entertainment at the best comedy venue in Hyderabad.`,
      date: showDate,
      venue: venues[i % venues.length],
      ticketPrice: 200 + (i % 5) * 100, // 200-600 rupees
      totalTickets: 50 + (i % 3) * 25, // 50-100 tickets
      posterImageUrl: `https://picsum.photos/seed/show${i}/800/400.jpg`,
      createdBy: verifiedOrganizers[organizerIndex].id
    });
  }

  return shows;
};

const generateShowComedians = (shows: any[], comedians: any[]): { showId: string; comedianId: string; order: number }[] => {
  const showComedians: { showId: string; comedianId: string; order: number }[] = [];

  shows.forEach((show, showIndex) => {
    const numComedians = 2 + Math.floor(Math.random() * 3); // 2-4 comedians per show
    const selectedComedians = [...comedians].sort(() => 0.5 - Math.random()).slice(0, numComedians);

    selectedComedians.forEach((comedian, order) => {
      showComedians.push({
        showId: show.id,
        comedianId: comedian.id,
        order: order
      });
    });
  });

  return showComedians;
};

const generateTicketInventory = (shows: any[]) => {
  return shows.map(show => ({
    showId: show.id,
    available: show.totalTickets,
    locked: 0
  }));
};

async function seedMockData() {
  console.log('🌱 Starting mock data seed process...');

  try {
    // Check for existing mock data to avoid duplicates
    const existingMockUsers = await prisma.user.count({
      where: {
        email: {
          startsWith: 'test+'
        }
      }
    });

    if (existingMockUsers > 0) {
      console.log(`⚠️  Found ${existingMockUsers} existing mock users. Skipping user creation.`);
      console.log('📊 Mock data already exists. Script is idempotent - no action needed.');
      return;
    }

    console.log('👥 Creating mock users...');

    // Create mock users (NO ADMIN USERS)
    const mockUsers = generateMockUsers();
    const createdUsers = [];

    for (const userData of mockUsers) {
      try {
        const user = await prisma.user.create({
          data: userData
        });
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.email} (${user.role})`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⏭️  User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    const audienceUsers = createdUsers.filter(u => u.role === UserRole.AUDIENCE);
    const unverifiedOrganizers = createdUsers.filter(u => u.role === UserRole.ORGANIZER_UNVERIFIED);
    const verifiedOrganizers = createdUsers.filter(u => u.role === UserRole.ORGANIZER_VERIFIED);

    console.log(`📊 Created: ${audienceUsers.length} audience, ${unverifiedOrganizers.length} unverified organizers, ${verifiedOrganizers.length} verified organizers`);

    // Create organizer profiles for all organizers
    console.log('📋 Creating organizer profiles...');
    const allOrganizers = [...unverifiedOrganizers, ...verifiedOrganizers];
    const organizerProfiles = generateMockOrganizerProfiles(allOrganizers);

    for (const profileData of organizerProfiles) {
      try {
        await prisma.organizerProfile.create({
          data: profileData
        });
        console.log(`✅ Created organizer profile for: ${profileData.name}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⏭️  Organizer profile already exists for: ${profileData.name}`);
        } else {
          console.error(`❌ Error creating organizer profile:`, error.message);
        }
      }
    }

    // Create comedians (only by verified organizers)
    console.log('🎭 Creating comedian profiles...');
    const comedians = generateMockComedians(verifiedOrganizers);
    const createdComedians = [];

    for (const comedianData of comedians) {
      try {
        const comedian = await prisma.comedian.create({
          data: comedianData
        });
        createdComedians.push(comedian);
        console.log(`✅ Created comedian: ${comedian.name}`);
      } catch (error: any) {
        console.error(`❌ Error creating comedian:`, error.message);
      }
    }

    // Create shows (only by verified organizers)
    console.log('🎪 Creating shows...');
    const shows = generateMockShows(verifiedOrganizers, createdComedians);
    const createdShows = [];

    for (const showData of shows) {
      try {
        const show = await prisma.show.create({
          data: showData
        });
        createdShows.push(show);
        console.log(`✅ Created show: ${show.title}`);
      } catch (error: any) {
        console.error(`❌ Error creating show:`, error.message);
      }
    }

    // Create show-comedian relationships
    console.log('🔗 Linking comedians to shows...');
    const showComedians = generateShowComedians(createdShows, createdComedians);

    for (const showComedianData of showComedians) {
      try {
        await prisma.showComedian.create({
          data: showComedianData
        });
      } catch (error: any) {
        console.error(`❌ Error linking comedian to show:`, error.message);
      }
    }

    // Create ticket inventory
    console.log('🎫 Creating ticket inventory...');
    const ticketInventory = generateTicketInventory(createdShows);

    for (const inventoryData of ticketInventory) {
      try {
        await prisma.ticketInventory.create({
          data: inventoryData
        });
        console.log(`✅ Created ticket inventory for show`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⏭️  Ticket inventory already exists for show`);
        } else {
          console.error(`❌ Error creating ticket inventory:`, error.message);
        }
      }
    }

    console.log('\n🎉 Mock data seed completed successfully!');
    console.log('📈 Summary:');
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   🎭 Comedians: ${createdComedians.length}`);
    console.log(`   🎪 Shows: ${createdShows.length}`);
    console.log(`   🔗 Show-Comedian links: ${showComedians.length}`);
    console.log('\n⚠️  REMINDER: This is development data only. Never run in production!');

  } catch (error) {
    console.error('💥 Error during seed process:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMockData()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed script failed:', error);
    process.exit(1);
  });

export { seedMockData };
