import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { neon } from '@neondatabase/serverless'

async function getUser(email: string) {
  const db = neon(process.env.DATABASE_URL!)
  const users = await db`SELECT * FROM users WHERE email = ${email}`
  return users[0] || null
}

async function createUser(email: string, name: string, image: string, googleId: string) {
  const db = neon(process.env.DATABASE_URL!)
  const result = await db`
    INSERT INTO users (email, name, image, google_id)
    VALUES (${email}, ${name}, ${image}, ${googleId})
    RETURNING *
  `
  return result[0]
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      let dbUser = await getUser(user.email)

      if (!dbUser && account?.provider === 'google') {
        dbUser = await createUser(
          user.email,
          user.name || 'Usuario',
          user.image || '',
          account.providerAccountId
        )
      }

      return !!dbUser
    },
    async session({ session }) {
      if (session.user && session.user.email) {
        const user = await getUser(session.user.email)
        if (user) {
          ;(session.user as any).id = user.id
          ;(session.user as any).name = user.name || session.user.name
          ;(session.user as any).image = user.image || session.user.image
          ;(session.user as any).preferred_language = user.preferred_language || 'es'
          ;(session.user as any).currency = user.currency || 'USD'
          ;(session.user as any).timezone = user.timezone || 'America/Mexico_City'
        }
      }
      return session
    },
  },
}
