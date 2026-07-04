import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function sql() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = sql()
  if (!db) return NextResponse.json([])

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json([])

    const rows = (await db`
      SELECT * FROM transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 100
    `) as any[]
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = sql()
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 500 })

  const body = await req.json()
  if (!body.amount || !body.type || !body.entity) {
    return NextResponse.json(
      { error: 'amount, type, entity required' },
      { status: 400 }
    )
  }

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const rows = (await db`
      INSERT INTO transactions (user_id, property_id, tenant_id, amount, type, entity, status, description)
      VALUES (
        ${userId},
        ${body.property_id || null},
        ${body.tenant_id || null},
        ${Number(body.amount)},
        ${body.type},
        ${body.entity},
        ${body.status || 'pending'},
        ${body.description || null}
      )
      RETURNING *
    `) as any[]
    return NextResponse.json(rows[0], { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = sql()
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await db`DELETE FROM transactions WHERE id = ${id} AND user_id = ${userId}`
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = sql()
  if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 500 })

  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const current = (await db`SELECT * FROM transactions WHERE id = ${body.id} AND user_id = ${userId}`) as any[]
    const t = current[0]
    if (!t) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    const rows = (await db`
      UPDATE transactions
      SET entity = ${body.entity ?? t.entity},
          type = ${body.type ?? t.type},
          amount = ${body.amount != null ? Number(body.amount) : t.amount},
          status = ${body.status ?? t.status},
          property_id = ${body.property_id !== undefined ? (body.property_id || null) : t.property_id}
      WHERE id = ${body.id} AND user_id = ${userId}
      RETURNING *
    `) as any[]
    return NextResponse.json(rows[0])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
