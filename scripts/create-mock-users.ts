import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🎭 Creating mock users for Comedy Connect...\n')

    const password = await bcrypt.hash('password123', 10)

    const users = [
        {
            email: 'audience@test.com',
            name: 'Test Audience User',
            role: 'AUDIENCE' as UserRole,
            onboardingCompleted: true,
        },
        {
            email: 'comedian@test.com',
            name: 'Test Comedian (Pending)',
            role: 'COMEDIAN_UNVERIFIED' as UserRole,
            onboardingCompleted: true,
        },
        {
            email: 'comedian-verified@test.com',
            name: 'Test Comedian (Verified)',
            role: 'COMEDIAN_VERIFIED' as UserRole,
            onboardingCompleted: true,
        },
        {
            email: 'organizer@test.com',
            name: 'Test Organizer (Pending)',
            role: 'ORGANIZER_UNVERIFIED' as UserRole,
            onboardingCompleted: true,
        },
        {
            email: 'organizer-verified@test.com',
            name: 'Test Organizer (Verified)',
            role: 'ORGANIZER_VERIFIED' as UserRole,
            onboardingCompleted: true,
        },
    ]

    for (const userData of users) {
        try {
            // Check if user already exists
            const existing = await prisma.user.findUnique({
                where: { email: userData.email }
            })

            if (existing) {
                console.log(`⏭️  User ${userData.email} already exists, skipping...`)
                continue
            }

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    onboardingCompleted: userData.onboardingCompleted,
                }
            })

            console.log(`✅ Created user: ${user.email}`)
            console.log(`   Role: ${user.role}`)
            console.log(`   Name: ${user.name}`)

            // Create comedian profile if needed
            if (userData.role.startsWith('COMEDIAN')) {
                const comedianProfile = await prisma.comedianProfile.create({
                    data: {
                        userId: user.id,
                        stageName: user.name || 'Test Comedian',
                        bio: 'Test comedian profile for development',
                        contact: user.email,
                    }
                })

                // Create Comedian record for show association
                const comedian = await prisma.comedian.create({
                    data: {
                        name: user.name || 'Test Comedian',
                        bio: 'Test comedian for development',
                        createdBy: user.id,
                    }
                })

                console.log(`   🎤 Created comedian profiles (Profile ID: ${comedianProfile.id}, Comedian ID: ${comedian.id})`)
            }

            // Create organizer profile if needed
            if (userData.role.startsWith('ORGANIZER')) {
                const organizerProfile = await prisma.organizerProfile.create({
                    data: {
                        userId: user.id,
                        name: user.name || 'Test Organizer',
                        description: 'Test organizer profile for development',
                        contact: user.email,
                        venue: 'Test Venue, Hyderabad',
                    }
                })

                console.log(`   🎪 Created organizer profile (ID: ${organizerProfile.id})`)
            }

            console.log('')
        } catch (error) {
            console.error(`❌ Error creating user ${userData.email}:`, error)
            console.log('')
        }
    }

    console.log('\n📋 Summary of Created Test Users:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email                          Password       Role')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    for (const userData of users) {
        const paddedEmail = userData.email.padEnd(30)
        const paddedPassword = 'password123'.padEnd(14)
        console.log(`${paddedEmail} ${paddedPassword} ${userData.role}`)
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n💡 Note: For Google OAuth testing, use aifoxcoding@gmail.com')
    console.log('   (This script creates users for email/password auth only)\n')
}

main()
    .catch((e) => {
        console.error('Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
