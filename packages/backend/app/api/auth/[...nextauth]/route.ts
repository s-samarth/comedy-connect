import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt", // Required for middleware getToken() to work
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = (user as any).id
        token.name = user.name
      } else if (token.id) {
        // Fetch fresh data from database when token is validated
        const { userRepository } = await import('@/repositories/user.repository')
        const dbUser = await userRepository.findById(token.id as string)

        if (dbUser) {
          token.role = dbUser.role
          token.name = dbUser.name
          token.onboardingCompleted = dbUser.onboardingCompleted
        }
      }
      return token
    },
    async session({ session, user, token }) {
      if (session.user) {
        // user is available when using database sessions, token is available when using JWT sessions
        const userId = user?.id || (token?.sub as string)
        const userRole = (user as any)?.role || (token?.role as string)
        const userName = user?.name || (token?.name as string)

          ; (session.user as any).id = userId
          ; (session.user as any).role = userRole
        session.user.name = userName

        // Check if user has completed onboarding
        const { userRepository } = await import('@/repositories/user.repository')
        const dbUser = await userRepository.findById(userId)

        if (dbUser) {
          ; (session.user as any).onboardingCompleted = dbUser.onboardingCompleted
            ; (session.user as any).phone = dbUser.phone
            ; (session.user as any).age = dbUser.age
            ; (session.user as any).city = dbUser.city
            ; (session.user as any).bio = dbUser.bio
            ; (session.user as any).language = dbUser.language
            ; (session.user as any).heardAboutUs = dbUser.heardAboutUs
            ; (session.user as any).comedianProfile = dbUser.comedianProfile
            ; (session.user as any).organizerProfile = dbUser.organizerProfile
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/signin',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
