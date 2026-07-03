import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { DEMO_PROPERTIES } from '@/lib/demo-data'

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
  const search = searchParams.get('search') || ''

  if (!db) {
    const rows = DEMO_PROPERTIES.filter((property) => {
      const matchesStatus = !status || status === 'all' || property.status === status
      const q = search.toLowerCase()
      const matchesSearch = !q || property.name.toLowerCase().includes(q) || property.address.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
    return NextResponse.json(rows)
  }

  try {
    let rows: any[]
    if (status && status !== 'all' && search) {
      rows = (await db`
        SELECT * FROM properties
        WHERE status = ${status}
          AND (name ILIKE ${'%' + search + '%'} OR address ILIKE ${'%' + search + '%'})
        ORDER BY created_at DESC
      `) as any[]
    } else if (status && status !== 'all') {
      rows = (await db`SELECT * FROM properties WHERE status = ${status} ORDER BY created_at DESC`) as any[]
    } else if (search) {
      rows = (await db`
        SELECT * FROM properties
        WHERE name ILIKE ${'%' + search + '%'} OR address ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
      `) as any[]
    } else {
      rows = (await db`SELECT * FROM properties ORDER BY created_at DESC`) as any[]
    }
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json(DEMO_PROPERTIES)
  }
}

export async function POST(req: NextRequest) {
  const db = sql()
  const body = await req.json()
  if (!body.name || !body.address)
    return NextResponse.json({ error: 'name and address required' }, { status: 400 })

  if (!db) {
    return NextResponse.json(
      {
        id: `demo-${Date.now()}`,
        name: body.name,
        address: body.address,
        type: body.type || 'Apartamento',
        status: body.status || 'available',
        monthly_rent: Number(body.monthly_rent) || 0,
        purchase_value: Number(body.purchase_value) || 0,
        security_deposit: Number(body.security_deposit) || 0,
        occupancy_pct: 0,
        roi_pct: 0,
        cash_flow: 0,
        image_url: body.image_url || null,
        created_at: new Date().toISOString(),
      },
      { status: 201 },
    )
  }

  try {
    const rows = (await db`
      INSERT INTO properties
        (name, address, type, status, monthly_rent, purchase_value, security_deposit, occupancy_pct, roi_pct, cash_flow, image_url)
      VALUES
        (${body.name}, ${body.address}, ${body.type || 'Apartamento'},
         ${body.status || 'available'},
         ${Number(body.monthly_rent) || 0}, ${Number(body.purchase_value) || 0},
         ${Number(body.security_deposit) || 0}, 0, 0, 0, ${body.image_url || null})
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
    await db`DELETE FROM properties WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const db = sql()
  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  if (!body.name || !body.address) return NextResponse.json({ error: 'name and address required' }, { status: 400 })

  const property = {
    id: body.id,
    name: body.name,
    address: body.address,
    type: body.type || 'Apartamento',
    status: body.status || 'available',
    monthly_rent: Number(body.monthly_rent) || 0,
    purchase_value: Number(body.purchase_value) || 0,
    security_deposit: Number(body.security_deposit) || 0,
    occupancy_pct: Number(body.occupancy_pct) || 0,
    roi_pct: Number(body.roi_pct) || 0,
    cash_flow: Number(body.cash_flow) || 0,
    image_url: body.image_url || null,
    created_at: body.created_at || new Date().toISOString(),
  }

  if (!db) return NextResponse.json(property)

  try {
    const rows = (await db`
      UPDATE properties
      SET name = ${property.name},
          address = ${property.address},
          type = ${property.type},
          status = ${property.status},
          monthly_rent = ${property.monthly_rent},
          purchase_value = ${property.purchase_value},
          security_deposit = ${property.security_deposit},
          occupancy_pct = ${property.occupancy_pct},
          roi_pct = ${property.roi_pct},
          cash_flow = ${property.cash_flow},
          image_url = ${property.image_url}
      WHERE id = ${property.id}
      RETURNING *
    `) as any[]
    return NextResponse.json(rows[0] || property)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
