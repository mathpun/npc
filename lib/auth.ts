import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import db from './db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') {
        return true
      }

      const email = user.email
      const googleId = account.providerAccountId

      if (!email) {
        return '/login?error=NoEmail'
      }

      try {
        // Check if this Google account is already linked to a user
        const existingGoogleUser = await db.prepare(
          'SELECT * FROM users WHERE google_id = ?'
        ).get(googleId)

        if (existingGoogleUser) {
          // User already exists with this Google account - allow sign in
          return true
        }

        // Check if there's a user with this email
        const existingEmailUser = await db.prepare(
          'SELECT * FROM users WHERE email = ?'
        ).get(email)

        if (existingEmailUser) {
          // Link Google account to existing user
          await db.prepare(
            'UPDATE users SET google_id = ?, auth_provider = COALESCE(auth_provider, ?) WHERE email = ?'
          ).run(googleId, 'google', email)
          return true
        }

        // Check if this email is a parent email in parent_connections
        const parentConnection = await db.prepare(
          'SELECT * FROM parent_connections WHERE parent_email = ? AND connection_status = ?'
        ).get(email, 'verified')

        if (parentConnection) {
          // This is a verified parent - allow sign in
          return true
        }

        // New user - redirect to onboarding with Google info
        // Store Google info in session for onboarding to pick up
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return '/login?error=DatabaseError'
      }
    },

    async jwt({ token, account, user }) {
      if (account?.provider === 'google' && user) {
        token.googleId = account.providerAccountId
        token.email = user.email
        token.name = user.name
        token.picture = user.image

        // Check what type of user this is
        try {
          const existingUser = await db.prepare(
            'SELECT * FROM users WHERE google_id = ? OR email = ?'
          ).get(account.providerAccountId, user.email)

          if (existingUser) {
            token.userId = existingUser.id
            token.userType = 'teen'
            token.isNewUser = false
          } else {
            // Check if parent
            const parentConnection = await db.prepare(
              'SELECT * FROM parent_connections WHERE parent_email = ? AND connection_status = ?'
            ).get(user.email, 'verified')

            if (parentConnection) {
              token.userType = 'parent'
              token.parentEmail = user.email
              token.isNewUser = false
            } else {
              token.isNewUser = true
              token.userType = 'unknown'
            }
          }
        } catch (error) {
          console.error('Error in jwt callback:', error)
        }
      }

      return token
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string | undefined,
          googleId: token.googleId as string | undefined,
          userType: token.userType as string | undefined,
          isNewUser: token.isNewUser as boolean | undefined,
          parentEmail: token.parentEmail as string | undefined,
        },
      }
    },
  },
  session: {
    strategy: 'jwt',
  },
})

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      googleId?: string
      userType?: string
      isNewUser?: boolean
      parentEmail?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
