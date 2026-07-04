import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getServerSession } from 'next-auth/next'

export const dynamic = 'force-dynamic'

function sql() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = sql()
  if (!db) return NextResponse.json([])

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json([])

    let rows: any[]
    if (search) {
      rows = (await db`
        SELECT * FROM providers
        WHERE user_id = ${userId}
          AND (name ILIKE ${'%' + search + '%'} OR category ILIKE ${'%' + search + '%'})
        ORDER BY rating DESC
      `) as any[]
    } else if (category && category !== 'all') {
      rows = (await db`
        SELECT * FROM providers
        WHERE user_id = ${userId} AND category ILIKE ${'%' + category + '%'}
        ORDER BY rating DESC
      `) as any[]
    } else {
      rows = (await db`SELECT * FROM providers WHERE user_id = ${userId} ORDER BY rating DESC`) as any[]
    }
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = sql()
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 500 })

  const body = await req.json()
  if (!body.name || !body.category)
    return NextResponse.json({ error: 'name and category required' }, { status: 400 })

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const rows = (await db`
      INSERT INTO providers (user_id, name, category, rating, properties_count, phone, email, avatar_url)
      VALUES (${userId}, ${body.name}, ${body.category}, ${Number(body.rating) || 5.0}, 0,
              ${body.phone || null}, ${body.email || null}, ${body.avatar_url || null})
      RETURNING *
    `) as any[]
    return NextResponse.json(rows[0], { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = sql()
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await db`DELETE FROM providers WHERE id = ${id} AND user_id = ${userId}`
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
