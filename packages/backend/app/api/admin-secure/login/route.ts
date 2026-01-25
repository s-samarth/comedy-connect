import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminPassword, createAdminSessionCookie, isAdminEmailWhitelisted } from '@/lib/admin-password'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
        }

        // 1. Check whitelist
        console.log(`[AdminLogin] Attempting login for ${email}. Whitelist check...`)
        if (!isAdminEmailWhitelisted(email)) {
            console.warn(`[AdminLogin] Email ${email} not in whitelist. Whitelist env: ${process.env.ADMIN_EMAIL}`)
            return NextResponse.json({ error: 'Unauthorized email' }, { status: 401 })
        }
        console.log(`[AdminLogin] Email ${email} whitelisted.`)

        // 2. Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Restricted access' }, { status: 401 })
        }

        // 3. Check if password set
        if (!user.adminPasswordHash) {
            return NextResponse.json({ error: 'Setup required', code: 'SETUP_REQUIRED' }, { status: 403 })
        }

        // 4. Verify password
        const isValid = await verifyAdminPassword(password, user.adminPasswordHash)
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // 5. Create session
        const sessionCookie = createAdminSessionCookie(email)

        // Set cookie on response
        const response = NextResponse.json({ success: true })
        // Using admin-secure-session to distinguish from previous attempts
        response.cookies.set('admin-secure-session', sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })

        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
