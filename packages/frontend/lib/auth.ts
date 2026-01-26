import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserRole } from "@prisma/client"
import { cookies } from "next/headers"
import { validateAdminSession } from "@/lib/admin-password"

export async function getCurrentUser() {
  // 1. Try NextAuth session first
  const session = await getServerSession(authOptions)
  if ((session as any)?.user?.id) {
    const { prisma } = await import('@/lib/prisma')
    return await prisma.user.findUnique({
      where: { id: (session as any).user.id }
    })
  }

  // 2. Try Admin Password Session
  try {
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get('admin-secure-session')

    if (adminCookie) {
      const { valid, email } = validateAdminSession(adminCookie.value)

      if (valid && email) {
        // Fetch user from DB to ensure we have ID and role
        const { prisma } = await import('@/lib/prisma')
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (user && user.role === 'ADMIN') {
          return user
        } else {
          if (!user) console.warn(`[Auth] Admin session valid for ${email} but user not found in DB`)
          else if (user.role !== 'ADMIN') console.warn(`[Auth] Admin session valid for ${email} but role is ${user.role}`)
        }
      } else {
        console.warn("[Auth] Admin cookie present but validation failed")
      }
    }
  } catch (e) {
    console.error("[Auth] Error checking admin session:", e)
    // Ignore errors (e.g. if cookies() is not available in certain contexts)
  }

  return null
}

import { redirect } from "next/navigation"

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect("/")
  }
  return user
}

export async function requireOrganizer() {
  const user = await requireAuth()
  if (user.role !== "ADMIN" && !user.role.startsWith("ORGANIZER")) {
    redirect("/onboarding/role-selection")
  }
  return user
}

export async function requireComedian() {
  const user = await requireAuth()
  if (user.role !== "ADMIN" && !user.role.startsWith("COMEDIAN")) {
    redirect("/onboarding/role-selection")
  }
  return user
}

export async function requireAdmin() {
  return requireRole("ADMIN")
}

export function isVerifiedOrganizer(role: UserRole): boolean {
  return role === "ADMIN" || role === "ORGANIZER_VERIFIED"
}

export function isVerifiedComedian(role: UserRole): boolean {
  return role === "ADMIN" || (role as string) === "COMEDIAN_VERIFIED"
}

export async function requireShowCreator() {
  const user = await requireAuth()
  if (user.role !== "ADMIN" && !user.role.startsWith("COMEDIAN") && !user.role.startsWith("ORGANIZER")) {
    throw new Error("Access denied. Comedian or Organizer role required")
  }
  return user
}

export function isVerifiedShowCreator(role: UserRole): boolean {
  return role === "ADMIN" || isVerifiedComedian(role) || isVerifiedOrganizer(role)
}
