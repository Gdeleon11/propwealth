import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { DEMO_PROVIDERS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

function sql() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

export async function GET(req: NextRequest) {
  const db = sql()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''

  if (!db) {
    const rows = DEMO_PROVIDERS.filter((provider) => {
      const q = search.toLowerCase()
      const matchesSearch = !q || provider.name.toLowerCase().includes(q) || provider.category.toLowerCase().includes(q)
      const matchesCategory = !category || category === 'all' || provider.category.toLowerCase().includes(category.toLowerCase())
      return matchesSearch && matchesCategory
    })
    return NextResponse.json(rows)
  }

  try {
    let rows: any[]
    if (search) {
      rows = (await db`
        SELECT * FROM providers
        WHERE name ILIKE ${'%' + search + '%'} OR category ILIKE ${'%' + search + '%'}
        ORDER BY rating DESC
      `) as any[]
    } else if (category && category !== 'all') {
      rows = (await db`
        SELECT * FROM providers WHERE category ILIKE ${'%' + category + '%'} ORDER BY rating DESC
      `) as any[]
    } else {
      rows = (await db`SELECT * FROM providers ORDER BY rating DESC`) as any[]
    }
    return NextResponse.json(rows)
  } catch (e: any) {
    return NextResponse.json(DEMO_PROVIDERS)
  }
}

export async function POST(req: NextRequest) {
  const db = sql()
  const body = await req.json()
  if (!body.name || !body.category)
    return NextResponse.json({ error: 'name and category required' }, { status: 400 })

  if (!db) {
    return NextResponse.json(
      {
        id: `demo-${Date.now()}`,
        name: body.name,
        category: body.category,
        rating: Number(body.rating) || 5,
        properties_count: 0,
        phone: body.phone || null,
        email: body.email || null,
        avatar_url: body.avatar_url || null,
        created_at: new Date().toISOString(),
      },
      { status: 201 },
    )
  }

  try {
    const rows = (await db`
      INSERT INTO providers (name, category, rating, properties_count, phone, email, avatar_url)
      VALUES (${body.name}, ${body.category}, ${Number(body.rating) || 5.0}, 0,
              ${body.phone || null}, ${body.email || null}, ${body.avatar_url || null})
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
    await db`DELETE FROM providers WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
