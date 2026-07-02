import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const db = getSupabase()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = db.from('providers').select('*').order('rating', { ascending: false })
  if (category && category !== 'all') query = query.ilike('category', `%${category}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const db = getSupabase()
  const body = await req.json()

  const row = {
    name: body.name,
    category: body.category,
    rating: Number(body.rating) || 5.0,
    properties_count: 0,
    phone: body.phone || null,
    email: body.email || null,
    avatar_url: body.avatar_url || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from('providers') as any).insert([row]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
