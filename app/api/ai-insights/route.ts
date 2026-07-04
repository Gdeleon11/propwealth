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
      db`SELECT name, status, monthly_rent, purchase_value, roi_pct, cash_flow, occupancy_pct FROM properties WHERE user_id = ${userId}`,
      db`SELECT full_name, payment_status, contract_end, property_id FROM tenants WHERE user_id = ${userId}`,
      db`SELECT amount, type, entity, created_at FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 100`,
    ])) as [any[], any[], any[]]

    // Sin datos suficientes: no gastamos una llamada al modelo
    if (properties.length === 0 && tenants.length === 0 && transactions.length === 0) {
      return NextResponse.json(FALLBACK)
    }

    const portfolio = {
      propiedades: properties.map((p: any) => ({
        nombre: p.name,
        estado: p.status,
        renta_mensual: Number(p.monthly_rent),
        valor: Number(p.purchase_value),
        roi_pct: Number(p.roi_pct),
        flujo_caja: Number(p.cash_flow),
        ocupacion_pct: Number(p.occupancy_pct),
      })),
      inquilinos: tenants.map((t: any) => ({
        nombre: t.full_name,
        estado_pago: t.payment_status,
        fin_contrato: t.contract_end,
      })),
      transacciones_recientes: transactions.slice(0, 25).map((t: any) => ({
        entidad: t.entity,
        tipo: t.type,
        monto: Number(t.amount),
        fecha: t.created_at,
      })),
    }

    const prompt = `Eres un analista financiero inmobiliario. Analiza este portafolio y responde SOLO con un objeto JSON válido con exactamente dos campos: "title" (un titular corto y accionable, máx 8 palabras) e "insight" (una recomendación concreta basada en los datos, máx 45 palabras, en español). No inventes datos que no estén presentes. Portafolio: ${JSON.stringify(portfolio)}`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 300,
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
