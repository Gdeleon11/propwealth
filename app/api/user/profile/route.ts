import { NextResponse, NextRequest } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getServerSession } from 'next-auth/next'

export const dynamic = 'force-dynamic'

function sql() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = sql()
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const users = (await db`SELECT id, email, name, image, preferred_language, currency, timezone FROM users WHERE email = ${session.user.email}`) as any[]
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      preferred_language: user.preferred_language,
      currency: user.currency,
      timezone: user.timezone,
    })
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = sql()
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    const body = await req.json()
    const { name, preferred_language, currency, timezone } = body

    // Validate input
    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }
    if (preferred_language && !['es', 'en'].includes(preferred_language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }
    if (currency && typeof currency !== 'string') {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
    }
    if (timezone && typeof timezone !== 'string') {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 })
    }

    // Get user first
    const users = (await db`SELECT id, email, image FROM users WHERE email = ${session.user.email}`) as any[]
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update with provided fields (using template literals with Neon)
    const result = (await db`
      UPDATE users
      SET
        name = ${name !== undefined ? name : user.name},
        preferred_language = ${preferred_language !== undefined ? preferred_language : user.preferred_language || 'es'},
        currency = ${currency !== undefined ? currency : user.currency || 'USD'},
        timezone = ${timezone !== undefined ? timezone : user.timezone || 'America/Mexico_City'},
        updated_at = NOW()
      WHERE id = ${user.id}
      RETURNING id, email, name, image, preferred_language, currency, timezone
    `) as any[]

    const updatedUser = result[0]

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      image: updatedUser.image,
      preferred_language: updatedUser.preferred_language,
      currency: updatedUser.currency,
      timezone: updatedUser.timezone,
    })
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
