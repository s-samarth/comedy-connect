import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Delete cookie and redirect
    const response = NextResponse.redirect(new URL('/admin-secure/login', request.url))
    response.cookies.delete('admin-secure-session')
    return response
}
