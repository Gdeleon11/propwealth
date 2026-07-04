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

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({
      totalPortfolioValue: 0,
      monthlyIncome: 0,
      netCashFlow: 0,
      avgRoi: 0,
      occupancyRate: 0,
      totalProperties: 0,
      overduePayments: 0,
      pendingPayments: 0,
      recentTransactions: [],
    })
  }

  const db = sql()
  if (!db) {
    return NextResponse.json({
      totalPortfolioValue: 0,
      monthlyIncome: 0,
      netCashFlow: 0,
      avgRoi: 0,
      occupancyRate: 0,
      totalProperties: 0,
      overduePayments: 0,
      pendingPayments: 0,
      recentTransactions: [],
    })
  }

  try {
    // Get user ID
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) {
      return NextResponse.json({
        totalPortfolioValue: 0,
        monthlyIncome: 0,
        netCashFlow: 0,
        avgRoi: 0,
        occupancyRate: 0,
        totalProperties: 0,
        overduePayments: 0,
        pendingPayments: 0,
        recentTransactions: [],
      })
    }

    const [properties, tenants, transactions] = (await Promise.all([
      db`SELECT purchase_value, monthly_rent, cash_flow, roi_pct, status FROM properties WHERE user_id = ${userId}`,
      db`SELECT payment_status FROM tenants WHERE user_id = ${userId}`,
      db`SELECT amount, type, entity, status, created_at FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 500`,
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
    const totalTenants     = tenants.length
    const delinquencyRate  = totalTenants ? (overduePayments / totalTenants) * 100 : 0

    // Serie mensual (últimos 6 meses) de ingresos vs gastos a partir de transacciones reales
    const now = new Date()
    const monthly: { month: string; income: number; expense: number }[] = []
    const monthLabels = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const income = transactions
        .filter((t: any) => t.type === 'income' && new Date(t.created_at).getFullYear() === d.getFullYear() && new Date(t.created_at).getMonth() === d.getMonth())
        .reduce((s: number, t: any) => s + Number(t.amount || 0), 0)
      const expense = transactions
        .filter((t: any) => t.type === 'expense' && new Date(t.created_at).getFullYear() === d.getFullYear() && new Date(t.created_at).getMonth() === d.getMonth())
        .reduce((s: number, t: any) => s + Number(t.amount || 0), 0)
      monthly.push({ month: monthLabels[d.getMonth()], income, expense })
    }

    // Desglose de gastos por entidad (top 4 + otros)
    const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + Number(t.amount || 0), 0)
    const totalExpenses = transactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + Number(t.amount || 0), 0)
    const byEntity: Record<string, number> = {}
    transactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
      byEntity[t.entity] = (byEntity[t.entity] || 0) + Number(t.amount || 0)
    })
    const sortedExpenses = Object.entries(byEntity).sort((a, b) => b[1] - a[1])
    const topExpenses = sortedExpenses.slice(0, 4)
    const otherSum = sortedExpenses.slice(4).reduce((s, [, v]) => s + v, 0)
    const expenseBreakdown = [
      ...topExpenses.map(([label, amount]) => ({ label, amount, pct: totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0 })),
      ...(otherSum > 0 ? [{ label: 'Otros', amount: otherSum, pct: totalExpenses ? Math.round((otherSum / totalExpenses) * 100) : 0 }] : []),
    ]

    return NextResponse.json({
      totalPortfolioValue,
      monthlyIncome,
      netCashFlow,
      avgRoi:           Number(avgRoi.toFixed(1)),
      occupancyRate:    Number(occupancyRate.toFixed(1)),
      totalProperties,
      overduePayments,
      pendingPayments,
      delinquencyRate:  Number(delinquencyRate.toFixed(1)),
      totalIncome,
      totalExpenses,
      monthly,
      expenseBreakdown,
      recentTransactions: transactions.slice(0, 5),
    })
  } catch (e: any) {
    return NextResponse.json({
      totalPortfolioValue: 0,
      monthlyIncome: 0,
      netCashFlow: 0,
      avgRoi: 0,
      occupancyRate: 0,
      totalProperties: 0,
      overduePayments: 0,
      pendingPayments: 0,
      recentTransactions: [],
    })
  }
}
