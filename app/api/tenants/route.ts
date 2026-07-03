import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { DEMO_TENANTS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

function sql() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

export async function GET(req: NextRequest) {
  const db = sql()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const today = new Date().toISOString().split('T')[0]

  if (!db) {
    const rows = DEMO_TENANTS.filter((tenant) => {
      if (status === 'current') return tenant.contract_end >= today
      if (status === 'past') return tenant.contract_end < today
      return true
    })
    return NextResponse.json(rows)
  }

  try {
    let rows: any[]
    if (status === 'current') {
      rows = (await db`
        SELECT t.*, p.name AS property_name, p.address AS property_address
        FROM tenants t LEFT JOIN properties p ON p.id = t.property_id
        WHERE t.contract_end >= ${today} ORDER BY t.created_at DESC
      `) as any[]
    } else if (status === 'past') {
      rows = (await db`
        SELECT t.*, p.name AS property_name, p.address AS property_address
        FROM tenants t LEFT JOIN properties p ON p.id = t.property_id
        WHERE t.contract_end < ${today} ORDER BY t.created_at DESC
      `) as any[]
    } else {
      rows = (await db`
        SELECT t.*, p.name AS property_name, p.address AS property_address
        FROM tenants t LEFT JOIN properties p ON p.id = t.property_id
        ORDER BY t.created_at DESC
      `) as any[]
    }
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json(DEMO_TENANTS)
  }
}

export async function POST(req: NextRequest) {
  const db = sql()
  const body = await req.json()
  if (!body.full_name || !body.email || !body.contract_start || !body.contract_end)
    return NextResponse.json({ error: 'full_name, email, contract_start, contract_end required' }, { status: 400 })

  if (!db) {
    return NextResponse.json(
      {
        id: `demo-${Date.now()}`,
        property_id: body.property_id || null,
        full_name: body.full_name,
        email: body.email,
        phone: body.phone || null,
        contract_start: body.contract_start,
        contract_end: body.contract_end,
        payment_status: body.payment_status || 'pending',
        avatar_url: body.avatar_url || null,
        created_at: new Date().toISOString(),
      },
      { status: 201 },
    )
  }

  try {
    const rows = (await db`
      INSERT INTO tenants (property_id, full_name, email, phone, contract_start, contract_end, payment_status, avatar_url)
      VALUES (${body.property_id || null}, ${body.full_name}, ${body.email},
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
  const db = sql()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (!db) return NextResponse.json({ ok: true })

  try {
    await db`DELETE FROM tenants WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
