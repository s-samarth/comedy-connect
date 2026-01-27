import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Delete cookie and redirect
    const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = NextResponse.redirect(`${frontendUrl}/admin-secure/login`, 303)
    response.cookies.delete('admin-secure-session')
    return response
}
