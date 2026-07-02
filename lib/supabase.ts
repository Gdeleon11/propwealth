import { createClient } from '@supabase/supabase-js'

// Lazy client — only instantiated at runtime when env vars are available
let _client: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Missing Supabase env vars')
    _client = createClient(url, key)
  }
  return _client
}

// Convenience alias
export const supabase = {
  get from() { return getSupabase().from.bind(getSupabase()) }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type Property = {
  id: string
  name: string
  address: string
  type: string
  status: 'rented' | 'available' | 'maintenance'
  monthly_rent: number
  purchase_value: number
  security_deposit: number
  occupancy_pct: number
  roi_pct: number
  cash_flow: number
  image_url: string | null
  created_at: string
}

export type Tenant = {
  id: string
  property_id: string
  full_name: string
  email: string
  phone: string | null
  contract_start: string
  contract_end: string
  payment_status: 'paid' | 'pending' | 'overdue'
  avatar_url: string | null
  created_at: string
  property?: Property
}

export type Provider = {
  id: string
  name: string
  category: string
  rating: number
  properties_count: number
  phone: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
}

export type Transaction = {
  id: string
  property_id: string | null
  entity: string
  type: 'income' | 'expense'
  amount: number
  status: 'processed' | 'pending' | 'failed'
  created_at: string
}
