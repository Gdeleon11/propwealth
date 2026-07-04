'use client'

import { useState, useEffect } from 'react'
import { formatMoney as fmt } from '@/lib/format'

type DashboardData = {
  totalPortfolioValue: number
  monthlyIncome: number
  netCashFlow: number
  avgRoi: number
  occupancyRate: number
  totalProperties: number
  overduePayments: number
  pendingPayments: number
  monthly?: { month: string; income: number; expense: number }[]
  recentTransactions: {
    entity: string
    type: string
    amount: number
    status: string
    created_at: string
  }[]
}

type AiInsight = { title: string; insight: string }

type Props = {
  onViewActivity?: () => void
}

export default function Dashboard({ onViewActivity }: Props) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [ai, setAi] = useState<AiInsight | null>(null)
  const [aiLoading, setAiLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/ai-insights')
      .then(r => r.json())
      .then(d => { setAi(d); setAiLoading(false) })
      .catch(() => setAiLoading(false))
  }, [])

  const kpis = data ? [
    { label: 'VALOR TOTAL DEL PORTAFOLIO', value: fmt(data.totalPortfolioValue), sub: null, bar: data.totalPortfolioValue > 0 ? 75 : 0 },
    { label: 'INGRESOS MENSUALES', value: fmt(data.monthlyIncome), sub: null, bar: null },
    { label: 'FLUJO DE CAJA NETO', value: fmt(data.netCashFlow), sub: null, bar: null },
    { label: 'ROI GLOBAL', value: `${data.avgRoi}%`, sub: null, bar: null },
  ] : Array(4).fill(null)

  const monthly = data?.monthly || []
  const maxBar = Math.max(...monthly.flatMap(m => [m.income, m.expense]), 1)

  return (
    <div className="px-6 py-4 space-y-4">
      {/* KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-surface-container-lowest p-4 border border-outline-variant rounded-xl card-shadow">
            {loading || !kpi ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-surface-container-high rounded w-3/4"/>
                <div className="h-7 bg-surface-container-high rounded w-1/2 mt-2"/>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-semibold tracking-widest text-on-surface-variant uppercase">{kpi.label}</p>
                <h2 className="text-[26px] font-bold leading-tight text-primary mt-1">{kpi.value}</h2>
                {kpi.bar && (
                  <div className="mt-2 h-1 w-full bg-primary-fixed overflow-hidden rounded-full">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${kpi.bar}%` }}/>
                  </div>
                )}
                {kpi.sub && !kpi.bar && (
                  <span className="inline-flex items-center text-secondary text-[11px] font-bold mt-2">
                    <span className="material-symbols-outlined text-[13px] mr-0.5">arrow_upward</span>
                    {kpi.sub}
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </section>

      {/* Alerts */}
      {data && (data.overduePayments > 0 || data.pendingPayments > 0) && (
        <section>
          <h3 className="text-[11px] font-semibold tracking-widest text-on-surface-variant uppercase mb-3 flex items-center gap-2">
            ALERTAS CRÍTICAS <span className="w-1.5 h-1.5 bg-error rounded-full animate-pulse"/>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.overduePayments > 0 && (
              <div className="bg-white border-l-4 border-error p-4 rounded-lg card-shadow flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-error-container rounded-full flex items-center justify-center text-error">
                    <span className="material-symbols-outlined">error</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[17px] text-primary">{data.overduePayments} {data.overduePayments === 1 ? 'Pago Vencido' : 'Pagos Vencidos'}</p>
                    <p className="text-on-surface-variant text-sm">Inquilinos con pago vencido</p>
                  </div>
                </div>
                <button onClick={() => { window.location.hash = 'tenants' }} className="text-primary hover:underline text-[11px] font-bold tracking-wider">RESOLVER</button>
              </div>
            )}
            {data.pendingPayments > 0 && (
              <div className="bg-white border-l-4 border-tertiary-container p-4 rounded-lg card-shadow flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-tertiary-fixed rounded-full flex items-center justify-center text-on-tertiary-container">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[17px] text-primary">{data.pendingPayments} {data.pendingPayments === 1 ? 'Pago Pendiente' : 'Pagos Pendientes'}</p>
                    <p className="text-on-surface-variant text-sm">Inquilinos con pago por cobrar</p>
                  </div>
                </div>
                <button onClick={() => { window.location.hash = 'tenants' }} className="text-primary hover:underline text-[11px] font-bold tracking-wider">VER</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Chart + Recent Payments */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl card-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[11px] font-semibold tracking-widest text-on-surface-variant uppercase">INGRESOS VS GASTOS (ÚLTIMOS 6 MESES)</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold"><span className="w-2 h-2 bg-primary rounded-full"/> INGRESOS</div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold"><span className="w-2 h-2 bg-outline-variant rounded-full"/> GASTOS</div>
            </div>
          </div>
          {monthly.length === 0 || monthly.every(m => m.income === 0 && m.expense === 0) ? (
            <div className="h-36 flex items-center justify-center text-sm text-on-surface-variant">Sin datos de transacciones aún</div>
          ) : (
            <div className="flex items-end justify-around h-36 gap-3 pt-4">
              {monthly.map((m) => (
                <div key={m.month} className="flex flex-col items-center flex-1 h-full">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div className="w-1/3 bg-primary rounded-t-sm" style={{ height: `${Math.max(2, (m.income / maxBar) * 100)}%` }} title={fmt(m.income)}/>
                    <div className="w-1/3 bg-outline-variant rounded-t-sm" style={{ height: `${Math.max(2, (m.expense / maxBar) * 100)}%` }} title={fmt(m.expense)}/>
                  </div>
                  <span className="mt-2 text-[10px] font-semibold tracking-wider text-on-surface-variant">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl card-shadow">
          <h3 className="text-[11px] font-semibold tracking-widest text-on-surface-variant uppercase mb-4">PAGOS RECIENTES</h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-surface-container-high rounded"/>)}
            </div>
          ) : (
            <div className="space-y-4">
              {(data?.recentTransactions || []).slice(0, 3).map((t, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-surface-variant last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                      <span className="material-symbols-outlined text-[15px]">{t.type === 'income' ? 'check' : 'remove'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary truncate max-w-[120px]">{t.entity}</p>
                      <p className="text-[10px] text-on-surface-variant">{new Date(t.created_at).toLocaleDateString('es')}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${t.type === 'income' ? 'text-secondary' : 'text-error'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(Math.abs(t.amount))}
                  </p>
                </div>
              ))}
              {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                <p className="text-sm text-on-surface-variant text-center py-4">Sin transacciones aún</p>
              )}
            </div>
          )}
          <button
            onClick={onViewActivity}
            className="w-full mt-3 py-2 text-primary border border-primary text-[11px] font-bold tracking-wider hover:bg-primary hover:text-white transition-all rounded"
          >
            VER TODA LA ACTIVIDAD
          </button>
        </div>
      </section>

      {/* AI Banner */}
      <section className="relative overflow-hidden rounded-xl h-44 border border-outline-variant bg-primary-container mb-4">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px,transparent 0)', backgroundSize: '24px 24px' }}/>
        <div className="relative z-10 p-6 flex flex-col h-full justify-center text-white">
          <span className="bg-secondary px-3 py-1 rounded-full text-[10px] font-bold w-fit mb-3">POTENCIADO POR IA</span>
          <h2 className="text-2xl font-bold">
            {aiLoading ? 'Analizando tu portafolio…' : (ai?.title || 'Maximiza la Eficiencia de tu Portafolio')}
          </h2>
          <p className="text-on-primary-container max-w-md mt-2 text-sm">
            {aiLoading ? 'La IA está revisando tus propiedades, inquilinos y movimientos.' : (ai?.insight || 'Agrega datos para recibir recomendaciones personalizadas.')}
          </p>
        </div>
        <div className="absolute right-[-5%] bottom-[-20%] w-64 h-64 opacity-20">
          <span className="material-symbols-outlined text-[120px]">trending_up</span>
        </div>
      </section>
    </div>
  )
}
