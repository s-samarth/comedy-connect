import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Delete cookie and redirect
    const frontendUrl = process.env.ALLOWED_ORIGIN
    if (!frontendUrl) throw new Error('ALLOWED_ORIGIN not set')
    const response = NextResponse.redirect(`${frontendUrl}/admin-secure/login`, 303)
    response.cookies.delete('admin-secure-session')
    return response
}
