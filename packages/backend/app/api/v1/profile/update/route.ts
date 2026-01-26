import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            name, phone, age, city, language, bio, image,
            // Comedian specific
            stageName, comedianContact, comedianBio, comedianYoutubeUrls, comedianInstagramUrls, comedianSocialLinks,
            // Organizer specific
            organizerName, organizerContact, organizerDescription, organizerVenue, organizerYoutubeUrls, organizerInstagramUrls, organizerSocialLinks
        } = body

        // Validate media limits
        if ((comedianYoutubeUrls?.length > 1) || (organizerYoutubeUrls?.length > 1)) {
            return NextResponse.json({ error: "Limit reached: Maximum 1 YouTube video is allowed." }, { status: 400 })
        }
        if ((comedianInstagramUrls?.length > 2) || (organizerInstagramUrls?.length > 2)) {
            return NextResponse.json({ error: "Limit reached: Maximum 2 Instagram reels are allowed." }, { status: 400 })
        }

        // Update basic user info
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: name?.trim() || undefined,
                phone: phone?.replace(/\D/g, '') || undefined,
                age: age ? Number(age) : undefined,
                city: city?.trim() || undefined,
                language: language || undefined,
                bio: bio?.trim() || undefined,
                image: image || undefined,
                updatedAt: new Date()
            }
        })

        // Fetch an admin to assign for approval (required by schema)
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        })

        // Update Comedian Profile if user is a comedian
        if (user.role.startsWith('COMEDIAN')) {
            const comedianProfile = await prisma.comedianProfile.upsert({
                where: { userId: user.id },
                update: {
                    stageName: stageName || undefined,
                    contact: comedianContact || undefined,
                    bio: comedianBio || undefined,
                    youtubeUrls: comedianYoutubeUrls || undefined,
                    instagramUrls: comedianInstagramUrls || undefined,
                    socialLinks: comedianSocialLinks || undefined,
                },
                create: {
                    userId: user.id,
                    stageName: stageName || name || "Comedian",
                    contact: comedianContact || phone || "",
                    bio: comedianBio || bio || "",
                    youtubeUrls: comedianYoutubeUrls || [],
                    instagramUrls: comedianInstagramUrls || [],
                    socialLinks: comedianSocialLinks || {},
                }
            })

            // Ensure Approval Request Exists
            if (admin) {
                await prisma.comedianApproval.upsert({
                    where: {
                        comedianId_adminId: {
                            comedianId: comedianProfile.id,
                            adminId: admin.id
                        }
                    },
                    update: { status: 'PENDING' }, // Reset to PENDING on profile update
                    create: {
                        comedianId: comedianProfile.id,
                        adminId: admin.id,
                        status: 'PENDING'
                    }
                })
            }
        }

        // Update Organizer Profile if user is an organizer
        if (user.role.startsWith('ORGANIZER')) {
            const organizerProfile = await prisma.organizerProfile.upsert({
                where: { userId: user.id },
                update: {
                    name: organizerName || undefined,
                    contact: organizerContact || undefined,
                    description: organizerDescription || undefined,
                    venue: organizerVenue || undefined,
                    youtubeUrls: organizerYoutubeUrls || undefined,
                    instagramUrls: organizerInstagramUrls || undefined,
                    socialLinks: organizerSocialLinks || undefined,
                },
                create: {
                    userId: user.id,
                    name: organizerName || name || "Organizer",
                    contact: organizerContact || phone || "",
                    description: organizerDescription || bio || "",
                    venue: organizerVenue || "",
                    youtubeUrls: organizerYoutubeUrls || [],
                    instagramUrls: organizerInstagramUrls || [],
                    socialLinks: organizerSocialLinks || {},
                }
            })

            // Ensure Approval Request Exists
            if (admin) {
                await prisma.organizerApproval.upsert({
                    where: {
                        organizerId_adminId: {
                            organizerId: organizerProfile.id,
                            adminId: admin.id
                        }
                    },
                    update: { status: 'PENDING' },
                    create: {
                        organizerId: organizerProfile.id,
                        adminId: admin.id,
                        status: 'PENDING'
                    }
                })
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully'
        })
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
