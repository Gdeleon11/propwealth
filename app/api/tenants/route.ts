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

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const today = new Date().toISOString().split('T')[0]

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json([])

    let rows: any[]
    if (status === 'current') {
      rows = (await db`
        SELECT t.*, p.name AS property_name, p.address AS property_address
        FROM tenants t LEFT JOIN properties p ON p.id = t.property_id
        WHERE t.user_id = ${userId} AND t.contract_end >= ${today} ORDER BY t.created_at DESC
      `) as any[]
    } else if (status === 'past') {
      rows = (await db`
        SELECT t.*, p.name AS property_name, p.address AS property_address
        FROM tenants t LEFT JOIN properties p ON p.id = t.property_id
        WHERE t.user_id = ${userId} AND t.contract_end < ${today} ORDER BY t.created_at DESC
      `) as any[]
    } else {
      rows = (await db`
        SELECT t.*, p.name AS property_name, p.address AS property_address
        FROM tenants t LEFT JOIN properties p ON p.id = t.property_id
        WHERE t.user_id = ${userId}
        ORDER BY t.created_at DESC
      `) as any[]
    }
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
  if (!body.full_name || !body.email || !body.contract_start || !body.contract_end)
    return NextResponse.json({ error: 'full_name, email, contract_start, contract_end required' }, { status: 400 })

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const rows = (await db`
      INSERT INTO tenants (user_id, property_id, full_name, email, phone, contract_start, contract_end, payment_status, avatar_url)
      VALUES (${userId}, ${body.property_id || null}, ${body.full_name}, ${body.email},
              ${body.phone || null}, ${body.contract_start}, ${body.contract_end},
              ${body.payment_status || 'pending'}, ${body.avatar_url || null})
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
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await db`DELETE FROM tenants WHERE id = ${id} AND user_id = ${userId}`
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

    // Solo actualizamos los campos enviados; el resto se conserva.
    const current = (await db`SELECT * FROM tenants WHERE id = ${body.id} AND user_id = ${userId}`) as any[]
    const t = current[0]
    if (!t) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    const rows = (await db`
      UPDATE tenants
      SET property_id = ${body.property_id !== undefined ? (body.property_id || null) : t.property_id},
          full_name = ${body.full_name ?? t.full_name},
          email = ${body.email ?? t.email},
          phone = ${body.phone ?? t.phone},
          contract_start = ${body.contract_start ?? t.contract_start},
          contract_end = ${body.contract_end ?? t.contract_end},
          payment_status = ${body.payment_status ?? t.payment_status}
      WHERE id = ${body.id} AND user_id = ${userId}
      RETURNING *
    `) as any[]
    return NextResponse.json(rows[0])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
