import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function sql() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

// Genera (una vez por mes) el ingreso de renta para cada propiedad rentada
// que tenga un inquilino asignado. Es idempotente: si ya existe el ingreso
// de renta de este mes para la propiedad, no lo duplica.
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ created: 0 })
  }

  const db = sql()
  if (!db) return NextResponse.json({ created: 0 })

  try {
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json({ created: 0 })

    const [properties, tenants] = (await Promise.all([
      db`SELECT id, name, monthly_rent FROM properties WHERE user_id = ${userId} AND status = 'rented' AND monthly_rent > 0`,
      db`SELECT id, property_id FROM tenants WHERE user_id = ${userId} AND property_id IS NOT NULL`,
    ])) as [any[], any[]]

    let created = 0
    for (const p of properties) {
      const tenant = tenants.find((t: any) => t.property_id === p.id)
      if (!tenant) continue // solo si hay inquilino asignado

      // ¿Ya existe el ingreso de renta de este mes para esta propiedad?
      const existing = (await db`
        SELECT 1 FROM transactions
        WHERE user_id = ${userId}
          AND property_id = ${p.id}
          AND type = 'income'
          AND entity LIKE 'Renta%'
          AND date_trunc('month', created_at) = date_trunc('month', now())
        LIMIT 1
      `) as any[]

      if (existing.length === 0) {
        await db`
          INSERT INTO transactions (user_id, property_id, tenant_id, amount, type, entity, status)
          VALUES (${userId}, ${p.id}, ${tenant.id}, ${Number(p.monthly_rent)}, 'income', ${'Renta · ' + p.name}, 'processed')
        `
        created++
      }
    }

    return NextResponse.json({ created })
  } catch (e: any) {
    return NextResponse.json({ created: 0, error: e.message })
  }
}
