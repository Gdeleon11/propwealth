import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = getSupabase()

  const [propertiesRes, tenantsRes, transactionsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.from('properties') as any).select('purchase_value, monthly_rent, cash_flow, roi_pct, status'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.from('tenants') as any).select('payment_status'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.from('transactions') as any).select('amount, type, entity, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  if (propertiesRes.error || tenantsRes.error) {
    return NextResponse.json({ error: 'Error fetching dashboard data' }, { status: 500 })
  }

  const properties = propertiesRes.data || []
  const tenants = tenantsRes.data || []
  const transactions = transactionsRes.data || []

  const totalPortfolioValue = properties.reduce((s: number, p: any) => s + (p.purchase_value || 0), 0)
  const monthlyIncome = properties.filter((p: any) => p.status === 'rented').reduce((s: number, p: any) => s + (p.monthly_rent || 0), 0)
  const netCashFlow = properties.reduce((s: number, p: any) => s + (p.cash_flow || 0), 0)
  const avgRoi = properties.length ? properties.reduce((s: number, p: any) => s + (p.roi_pct || 0), 0) / properties.length : 0
  const totalProperties = properties.length
  const rentedProperties = properties.filter((p: any) => p.status === 'rented').length
  const occupancyRate = totalProperties ? (rentedProperties / totalProperties) * 100 : 0
  const overduePayments = tenants.filter((t: any) => t.payment_status === 'overdue').length
  const pendingPayments = tenants.filter((t: any) => t.payment_status === 'pending').length

  return NextResponse.json({
    totalPortfolioValue,
    monthlyIncome,
    netCashFlow,
    avgRoi: Number(avgRoi.toFixed(1)),
    occupancyRate: Number(occupancyRate.toFixed(1)),
    totalProperties,
    overduePayments,
    pendingPayments,
    recentTransactions: transactions,
  })
}
