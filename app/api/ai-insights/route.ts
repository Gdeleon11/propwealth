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

const FALLBACK = {
  title: 'Configura tus datos para recibir análisis',
  insight:
    'Agrega propiedades, inquilinos y movimientos para que el análisis con IA genere recomendaciones basadas en tu portafolio real.',
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json(FALLBACK)
  }

  const apiKey = process.env.GROQ_API_KEY
  const db = sql()
  if (!apiKey || !db) {
    return NextResponse.json(FALLBACK)
  }

  try {
    const users = (await db`SELECT id FROM users WHERE email = ${session.user.email}`) as any[]
    const userId = users[0]?.id
    if (!userId) return NextResponse.json(FALLBACK)

    const [properties, tenants, transactions] = (await Promise.all([
      db`SELECT name, status, monthly_rent, purchase_value, roi_pct, cash_flow, occupancy_pct, maintenance FROM properties WHERE user_id = ${userId}`,
      db`SELECT full_name, payment_status, contract_end, property_id FROM tenants WHERE user_id = ${userId}`,
      db`SELECT amount, type, entity, created_at FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 200`,
    ])) as [any[], any[], any[]]

    // Sin datos suficientes: no gastamos una llamada al modelo
    if (properties.length === 0 && tenants.length === 0 && transactions.length === 0) {
      return NextResponse.json(FALLBACK)
    }

    // Métricas calculadas para que el análisis sea concreto y cuantitativo
    const num = (x: any) => Number(x || 0)
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + num(t.amount), 0)
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + num(t.amount), 0)
    const net = totalIncome - totalExpenses
    const rented = properties.filter(p => p.status === 'rented').length
    const available = properties.filter(p => p.status === 'available')
    const portfolioValue = properties.reduce((s, p) => s + num(p.purchase_value), 0)
    const monthlyRentPotential = properties.reduce((s, p) => s + num(p.monthly_rent), 0)
    const overdueTenants = tenants.filter(t => t.payment_status === 'overdue').map(t => t.full_name)
    const pendingTenants = tenants.filter(t => t.payment_status === 'pending').map(t => t.full_name)
    const soon = new Date(); soon.setDate(soon.getDate() + 60)
    const expiringContracts = tenants
      .filter(t => t.contract_end && new Date(t.contract_end) <= soon)
      .map(t => ({ inquilino: t.full_name, vence: t.contract_end }))
    const rankedRoi = [...properties].sort((a, b) => num(b.roi_pct) - num(a.roi_pct))
    const upcomingMaintenance = properties.flatMap((p: any) =>
      (Array.isArray(p.maintenance) ? p.maintenance : []).map((m: any) => ({ propiedad: p.name, tarea: m.title, fecha: m.date, costo: num(m.cost) }))
    )

    const portfolio = {
      resumen: {
        propiedades_total: properties.length,
        rentadas: rented,
        disponibles_vacias: available.map(p => p.name),
        ocupacion_pct: properties.length ? Math.round((rented / properties.length) * 100) : 0,
        valor_portafolio: portfolioValue,
        renta_mensual_potencial: monthlyRentPotential,
        ingresos_totales_registrados: totalIncome,
        gastos_totales_registrados: totalExpenses,
        flujo_neto: net,
        inquilinos_en_mora: overdueTenants,
        inquilinos_pago_pendiente: pendingTenants,
        contratos_por_vencer_60d: expiringContracts,
        mantenimientos_programados: upcomingMaintenance,
      },
      propiedades_por_roi: rankedRoi.map((p: any) => ({ nombre: p.name, roi_pct: num(p.roi_pct), estado: p.status, renta: num(p.monthly_rent), flujo: num(p.cash_flow) })),
    }

    const prompt = `Eres un asesor financiero inmobiliario senior. Analiza los datos REALES de este portafolio y da un diagnóstico específico y cuantitativo (usa nombres de propiedades/inquilinos y cifras concretas que aparezcan en los datos; nunca inventes).

Detecta el punto más importante a atender ahora mismo: por ejemplo inquilinos en mora, propiedades vacías que no generan renta, contratos por vencer, o gastos que superan ingresos.

Responde SOLO con un objeto JSON con dos campos:
- "title": titular accionable y específico, máx 9 palabras (ej. "Cobra la renta vencida de Fernando").
- "insight": 2 recomendaciones concretas con cifras/nombres reales, máx 60 palabras, en español, tono profesional y directo. Si faltan datos para un buen análisis, dilo y sugiere qué registrar.

Datos: ${JSON.stringify(portfolio)}`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 450,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Responde únicamente con JSON válido. Sé preciso y no inventes cifras.' },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!res.ok) {
      return NextResponse.json(FALLBACK)
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) return NextResponse.json(FALLBACK)

    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch {
      return NextResponse.json(FALLBACK)
    }

    return NextResponse.json({
      title: parsed.title || FALLBACK.title,
      insight: parsed.insight || FALLBACK.insight,
    })
  } catch (e: any) {
    return NextResponse.json(FALLBACK)
  }
}
