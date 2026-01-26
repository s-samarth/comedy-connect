import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashAdminPassword, createAdminSessionCookie, isAdminEmailWhitelisted } from '@/lib/admin-password'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
        }

        // 1. Check whitelist
        if (!isAdminEmailWhitelisted(email)) {
            return NextResponse.json({ error: 'Unauthorized email' }, { status: 401 })
        }

        // 2. Check user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        // If user exists and has password -> Error
        if (user?.adminPasswordHash) {
            return NextResponse.json({ error: 'Password already set' }, { status: 400 })
        }

        // 3. Hash password
        const hashedPassword = await hashAdminPassword(password)

        // 4. Create or Update User
        await prisma.user.upsert({
            where: { email },
            update: {
                role: 'ADMIN',
                adminPasswordHash: hashedPassword
            },
            create: {
                email,
                role: 'ADMIN',
                adminPasswordHash: hashedPassword,
                name: 'Admin User'
            }
        })

        // 5. Create session
        const sessionCookie = await createAdminSessionCookie(email)

        const response = NextResponse.json({ success: true })
        response.cookies.set('admin-secure-session', sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })

        return response

    } catch (error) {
        console.error('Setup error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
