import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { DEMO_DASHBOARD } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

function sql() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

export async function GET() {
  const db = sql()
  if (!db) return NextResponse.json(DEMO_DASHBOARD)

  try {
    const [properties, tenants, transactions] = (await Promise.all([
      db`SELECT purchase_value, monthly_rent, cash_flow, roi_pct, status FROM properties`,
      db`SELECT payment_status FROM tenants`,
      db`SELECT amount, type, entity, status, created_at FROM transactions ORDER BY created_at DESC LIMIT 5`,
    ])) as [any[], any[], any[]]

    const totalPortfolioValue = properties.reduce((s: number, p: any) => s + Number(p.purchase_value || 0), 0)
    const monthlyIncome       = properties.filter((p: any) => p.status === 'rented').reduce((s: number, p: any) => s + Number(p.monthly_rent || 0), 0)
    const netCashFlow         = properties.reduce((s: number, p: any) => s + Number(p.cash_flow || 0), 0)
    const avgRoi              = properties.length
      ? properties.reduce((s: number, p: any) => s + Number(p.roi_pct || 0), 0) / properties.length
      : 0
    const totalProperties  = properties.length
    const rentedProperties = properties.filter((p: any) => p.status === 'rented').length
    const occupancyRate    = totalProperties ? (rentedProperties / totalProperties) * 100 : 0
    const overduePayments  = tenants.filter((t: any) => t.payment_status === 'overdue').length
    const pendingPayments  = tenants.filter((t: any) => t.payment_status === 'pending').length

    return NextResponse.json({
      totalPortfolioValue,
      monthlyIncome,
      netCashFlow,
      avgRoi:           Number(avgRoi.toFixed(1)),
      occupancyRate:    Number(occupancyRate.toFixed(1)),
      totalProperties,
      overduePayments,
      pendingPayments,
      recentTransactions: transactions,
    })
  } catch (e: any) {
    return NextResponse.json(DEMO_DASHBOARD)
  }
}
