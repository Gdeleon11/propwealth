import { neon } from '@neondatabase/serverless'

// Lazy SQL client — created once per serverless instance
let _sql: ReturnType<typeof neon> | null = null

export function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('Missing DATABASE_URL environment variable')
    _sql = neon(url)
  }
  return _sql
}

// Typed query helper — avoids TS issues with neon's tagged template union return type
export async function query<T = Record<string, unknown>>(
  sql: ReturnType<typeof neon>,
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const result = await sql(strings, ...values)
  return result as unknown as T[]
}

// ─── Types ────────────────────────────────────────────────────────────────────

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
  property_id: string | null
  full_name: string
  email: string
  phone: string | null
  contract_start: string
  contract_end: string
  payment_status: 'paid' | 'pending' | 'overdue'
  avatar_url: string | null
  created_at: string
  property_name?: string
  property_address?: string
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
