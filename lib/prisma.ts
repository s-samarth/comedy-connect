import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In development, the prisma instance is cached in globalThis.
// If we add new models and run 'prisma generate', the cached instance might not have them.
// We check for comedianProfile to ensure the client is up-to-date.
if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  !(globalForPrisma.prisma as any).comedianProfile
) {
  console.log("Refreshing stale Prisma client instance...")
  globalForPrisma.prisma = undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
