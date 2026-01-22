import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateResetCode, isAdminEmailWhitelisted } from '@/lib/admin-password'
import { sendAdminResetEmail } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        // 1. Check whitelist
        if (!isAdminEmailWhitelisted(email)) {
            // Return success even if not whitelisted to prevent enumeration
            // But practically for admin portal, user knows they need to be whitelisted
            return NextResponse.json({ error: 'Email not authorized' }, { status: 401 })
        }

        // 2. Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Email not found or not admin' }, { status: 404 })
        }

        // 3. Generate Code
        const code = generateResetCode()
        const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // 4. Save to DB
        await prisma.user.update({
            where: { email },
            data: {
                adminResetCode: code,
                adminResetExpires: expires
            }
        })

        // 5. Send Email
        const emailResult = await sendAdminResetEmail(email, code)

        if (!emailResult.success) {
            console.error('Failed to send email (expected in dev without SMTP):', emailResult.error)
            // Return success anyway for development testing
            return NextResponse.json({
                success: true,
                message: 'Email failed but code generated (dev authentication)',
                devCode: code
            })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Reset request error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
