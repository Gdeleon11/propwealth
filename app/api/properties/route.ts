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
  const search = searchParams.get('search') || ''

  try {
    // Get user ID from email
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json([])

    let rows: any[]
    if (status && status !== 'all' && search) {
      rows = (await db`
        SELECT * FROM properties
        WHERE user_id = ${userId}
          AND status = ${status}
          AND (name ILIKE ${'%' + search + '%'} OR address ILIKE ${'%' + search + '%'})
        ORDER BY created_at DESC
      `) as any[]
    } else if (status && status !== 'all') {
      rows = (await db`
        SELECT * FROM properties
        WHERE user_id = ${userId} AND status = ${status}
        ORDER BY created_at DESC
      `) as any[]
    } else if (search) {
      rows = (await db`
        SELECT * FROM properties
        WHERE user_id = ${userId}
          AND (name ILIKE ${'%' + search + '%'} OR address ILIKE ${'%' + search + '%'})
        ORDER BY created_at DESC
      `) as any[]
    } else {
      rows = (await db`
        SELECT * FROM properties WHERE user_id = ${userId} ORDER BY created_at DESC
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
  if (!body.name || !body.address)
    return NextResponse.json({ error: 'name and address required' }, { status: 400 })

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const gallery = Array.isArray(body.gallery) ? body.gallery : []
    const services = Array.isArray(body.services) ? body.services : []
    const maintenance = Array.isArray(body.maintenance) ? body.maintenance : []
    const documents = Array.isArray(body.documents) ? body.documents : []

    const rows = (await db`
      INSERT INTO properties
        (user_id, name, address, type, status, monthly_rent, purchase_value, security_deposit, occupancy_pct, roi_pct, cash_flow,
         image_url, lat, lng, gallery, services, maintenance, documents)
      VALUES
        (${userId}, ${body.name}, ${body.address}, ${body.type || 'Apartamento'},
         ${body.status || 'available'},
         ${Number(body.monthly_rent) || 0}, ${Number(body.purchase_value) || 0},
         ${Number(body.security_deposit) || 0}, 0, 0, 0,
         ${body.image_url || null},
         ${body.lat != null ? Number(body.lat) : null}, ${body.lng != null ? Number(body.lng) : null},
         ${JSON.stringify(gallery)}, ${JSON.stringify(services)}, ${JSON.stringify(maintenance)}, ${JSON.stringify(documents)})
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

    await db`DELETE FROM properties WHERE id = ${id} AND user_id = ${userId}`
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
  if (!body.name || !body.address) return NextResponse.json({ error: 'name and address required' }, { status: 400 })

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const gallery = Array.isArray(body.gallery) ? body.gallery : []
    const services = Array.isArray(body.services) ? body.services : []
    const maintenance = Array.isArray(body.maintenance) ? body.maintenance : []
    const documents = Array.isArray(body.documents) ? body.documents : []

    const rows = (await db`
      UPDATE properties
      SET name = ${body.name},
          address = ${body.address},
          type = ${body.type || 'Apartamento'},
          status = ${body.status || 'available'},
          monthly_rent = ${Number(body.monthly_rent) || 0},
          purchase_value = ${Number(body.purchase_value) || 0},
          security_deposit = ${Number(body.security_deposit) || 0},
          occupancy_pct = ${Number(body.occupancy_pct) || 0},
          roi_pct = ${Number(body.roi_pct) || 0},
          cash_flow = ${Number(body.cash_flow) || 0},
          image_url = ${body.image_url || null},
          lat = ${body.lat != null ? Number(body.lat) : null},
          lng = ${body.lng != null ? Number(body.lng) : null},
          gallery = ${JSON.stringify(gallery)},
          services = ${JSON.stringify(services)},
          maintenance = ${JSON.stringify(maintenance)},
          documents = ${JSON.stringify(documents)}
      WHERE id = ${body.id} AND user_id = ${userId}
      RETURNING *
    `) as any[]
    return NextResponse.json(rows[0] || { error: 'Property not found' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
