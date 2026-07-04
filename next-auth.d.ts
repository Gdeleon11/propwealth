import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      preferred_language?: string
      currency?: string
      timezone?: string
    }
  }

  interface User {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    preferred_language?: string
    currency?: string
    timezone?: string
  }
}
