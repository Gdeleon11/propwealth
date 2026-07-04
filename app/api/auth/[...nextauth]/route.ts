import NextAuth from 'next-auth'
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

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
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
    async session({ session, token }) {
      if (session.user && session.user.email) {
        const user = await getUser(session.user.email)
        if (user) {
          session.user.id = user.id
        }
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
