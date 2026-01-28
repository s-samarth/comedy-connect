import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

// Admin session verification result type
export interface AdminSessionResult {
    valid: boolean
    needsPassword?: boolean
    user?: {
        role: string
        email: string
        adminPasswordHash?: string | null
    }
    error?: string
}

// Verify admin session and checking for password setup
export async function verifyAdminSession(request: NextRequest): Promise<AdminSessionResult> {
    try {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        })

        if (!token || !token.email) {
            return { valid: false, error: 'unauthorized' }
        }

        // Get user from database to check role and password status
        const user = await prisma.user.findUnique({
            where: { email: token.email }
        })

        if (!user) {
            return { valid: false, error: 'user_not_found' }
        }

        if (user.role !== 'ADMIN') {
            return {
                valid: false,
                error: 'not_admin',
                user: { role: user.role, email: user.email }
            }
        }

        // Check if admin password is set
        const needsPassword = !user.adminPasswordHash

        return {
            valid: true,
            needsPassword,
            user: {
                role: user.role,
                email: user.email,
                adminPasswordHash: user.adminPasswordHash
            }
        }
    } catch (error) {
        console.error('Verify admin session error:', error)
        return { valid: false, error: 'server_error' }
    }
}

// Admin password utilities
export async function hashAdminPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
}

export async function verifyAdminPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
}

// Check if admin email is whitelisted
export function isAdminEmailWhitelisted(email: string): boolean {
    const adminEmails = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    return adminEmails.includes(email.toLowerCase())
}

// Generate a random 6-digit code for resets
export function generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Secure session signing using Web Crypto API (Edge compatible)
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev'

// Helper to convert string to ArrayBuffer
function str2ab(str: string) {
    return new TextEncoder().encode(str)
}

// Helper to convert ArrayBuffer to hex string
function ab2hex(buf: ArrayBuffer) {
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

export async function createAdminSessionCookie(email: string): Promise<string> {
    const session = {
        email,
        verified: true,
        expires: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
    }

    const payload = btoa(JSON.stringify(session))

    const key = await crypto.subtle.importKey(
        'raw',
        str2ab(SESSION_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        str2ab(payload)
    )

    return `${payload}.${ab2hex(signature)}`
}

export async function validateAdminSession(cookieValue: string | undefined): Promise<{ valid: boolean; email?: string }> {
    if (!cookieValue) return { valid: false }

    const parts = cookieValue.split('.')
    if (parts.length !== 2) return { valid: false }

    const [payload, signature] = parts

    try {
        const key = await crypto.subtle.importKey(
            'raw',
            str2ab(SESSION_SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        )

        // Convert hex signature back to Uint8Array
        const sigArray = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

        const isValidSignature = await crypto.subtle.verify(
            'HMAC',
            key,
            sigArray,
            str2ab(payload)
        )

        if (!isValidSignature) {
            console.error('[AdminSecurity] Invalid session signature detected!')
            return { valid: false }
        }

        const session = JSON.parse(atob(payload))

        if (session.verified && session.expires > Date.now() && isAdminEmailWhitelisted(session.email)) {
            return { valid: true, email: session.email }
        }
    } catch (error) {
        console.error('[AdminSecurity] Session validation error:', error)
        return { valid: false }
    }

    return { valid: false }
}

// Check session password verification
export async function checkAdminPasswordSession(request: any): Promise<boolean> {
    const adminCookie = request.cookies.get('admin-secure-session')?.value
    const session = await validateAdminSession(adminCookie)
    return session.valid
}
