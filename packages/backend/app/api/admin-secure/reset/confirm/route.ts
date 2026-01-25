import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashAdminPassword } from '@/lib/admin-password'

export async function POST(request: Request) {
    try {
        const { email, code, newPassword } = await request.json()

        if (!email || !code || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
        }

        // 1. Find user with valid code
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.adminResetCode || !user.adminResetExpires) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        // 2. Validate Code & Expiry
        if (user.adminResetCode !== code) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
        }

        if (new Date() > user.adminResetExpires) {
            return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
        }

        // 3. Hash New Password
        const hashedPassword = await hashAdminPassword(newPassword)

        // 4. Update User & specific Clear Reset Fields
        await prisma.user.update({
            where: { email },
            data: {
                adminPasswordHash: hashedPassword,
                adminResetCode: null,
                adminResetExpires: null
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Reset confirm error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
