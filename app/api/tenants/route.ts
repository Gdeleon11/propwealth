import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const db = getSupabase()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const today = new Date().toISOString().split('T')[0]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = db.from('tenants').select('*, property:properties(name, address)').order('created_at', { ascending: false })
  if (status === 'current') query = query.gte('contract_end', today)
  else if (status === 'past') query = query.lt('contract_end', today)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const db = getSupabase()
  const body = await req.json()

  const row = {
    property_id: body.property_id,
    full_name: body.full_name,
    email: body.email,
    phone: body.phone || null,
    contract_start: body.contract_start,
    contract_end: body.contract_end,
    payment_status: body.payment_status || 'pending',
    avatar_url: body.avatar_url || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from('tenants') as any).insert([row]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
