import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const db = getSupabase()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = db.from('properties').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const db = getSupabase()
  const body = await req.json()

  const row = {
    name: body.name,
    address: body.address,
    type: body.type,
    status: body.status || 'available',
    monthly_rent: Number(body.monthly_rent) || 0,
    purchase_value: Number(body.purchase_value) || 0,
    security_deposit: Number(body.security_deposit) || 0,
    occupancy_pct: 0,
    roi_pct: 0,
    cash_flow: 0,
    image_url: body.image_url || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from('properties') as any).insert([row]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
