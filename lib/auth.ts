import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserRole } from "@prisma/client"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return (session as any)?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error(`Access denied. Required role: ${role}`)
  }
  return user
}

export async function requireOrganizer() {
  const user = await requireAuth()
  if (!user.role.startsWith("ORGANIZER")) {
    throw new Error("Access denied. Organizer role required")
  }
  return user
}

export async function requireAdmin() {
  return requireRole("ADMIN")
}

export function isVerifiedOrganizer(role: UserRole): boolean {
  return role === "ORGANIZER_VERIFIED"
}
