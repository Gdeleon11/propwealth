'use client'

import { useState, useEffect } from 'react'
import type { Property } from '@/lib/db'

type DashData = {
  totalPortfolioValue: number
  monthlyIncome: number
  avgRoi: number
  occupancyRate: number
  recentTransactions: { entity: string; type: string; amount: number; status: string; created_at: string }[]
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function Reports() {
  const [data, setData] = useState<DashData | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/properties').then(r => r.json()),
    ])
      .then(([dashboard, propertyRows]) => {
        setData(dashboard)
        setProperties(Array.isArray(propertyRows) ? propertyRows : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const topRoi = [...properties]
    .sort((a, b) => Number(b.roi_pct || 0) - Number(a.roi_pct || 0))
    .slice(0, 5)
  const maxRoi = Math.max(...topRoi.map(p => Number(p.roi_pct || 0)), 1)

  return (
    <div className="px-6 py-4 space-y-4">
      {/* Summary cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-outline-variant p-4 rounded-xl card-shadow">
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">PORTAFOLIO DE INVERSIÓN TOTAL</span>
          <div className="text-[26px] font-bold mt-2 text-primary">{loading ? '—' : fmt(data?.totalPortfolioValue || 0)}</div>
          <div className="mt-3 flex items-center gap-1 text-secondary text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px]">trending_up</span>+4.2% ANUAL
          </div>
        </div>
        <div className="bg-white border border-outline-variant p-4 rounded-xl card-shadow">
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">INGRESOS MENSUALES</span>
          <div className="text-[26px] font-bold mt-2 text-secondary">{loading ? '—' : fmt(data?.monthlyIncome || 0)}</div>
          <div className="mt-3 text-on-surface-variant text-[11px] font-mono">ROI PROMEDIO: {data?.avgRoi || 0}%</div>
        </div>
      </section>

      {/* ROI Bar Chart */}
      <section className="bg-white border border-outline-variant p-4 rounded-xl card-shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">ROI POR PROPIEDAD (TOP 5)</h3>
          <span className="material-symbols-outlined text-outline cursor-pointer">more_vert</span>
        </div>
        <div className="h-52 flex items-end justify-between px-4 pt-4 gap-2">
          {(topRoi.length ? topRoi : [
            { id: 'empty-1', name: 'Sin datos', roi_pct: 0 },
          ] as Partial<Property>[]).map((property, index) => (
            <div key={property.id || property.name} className="flex flex-col items-center gap-2 flex-1 cursor-pointer group">
              <div
                className={`w-full rounded-t-lg ${index === 0 ? 'bg-primary' : 'bg-primary-container'}`}
                style={{ height: `${Math.max(8, (Number(property.roi_pct || 0) / maxRoi) * 100)}%` }}
              />
              <span className="text-[9px] font-semibold tracking-wide text-on-surface-variant text-center leading-tight">
                {property.name}<br/>{Number(property.roi_pct || 0).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Expense Breakdown */}
        <section className="md:col-span-4 bg-white border border-outline-variant p-4 rounded-xl card-shadow">
          <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase mb-4">DESGLOSE DE GASTOS</h3>
          <div className="relative flex justify-center items-center py-4">
            <div className="w-36 h-36 rounded-full border-[12px] border-surface-container-high flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-[12px] border-primary border-t-transparent border-l-transparent border-r-transparent rotate-45"/>
              <div className="absolute inset-0 rounded-full border-[12px] border-secondary border-b-transparent border-l-transparent border-r-transparent -rotate-12"/>
              <span className="text-[10px] font-semibold text-on-surface-variant">TOTAL</span>
              <span className="text-[20px] font-bold">$42.8k</span>
            </div>
          </div>
          <ul className="space-y-2 mt-2">
            {[['bg-primary','Servicios','50%'],['bg-secondary','Mantenimiento','25%'],['bg-primary-fixed-dim','Administración','15%'],['bg-outline-variant','Impuestos','10%']].map(([color, label, pct]) => (
              <li key={label} className="flex justify-between items-center text-base">
                <span className="flex items-center gap-2"><div className={`w-3 h-3 rounded-sm ${color}`}/>{label}</span>
                <span className="font-bold">{pct}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Cash Flow SVG */}
        <section className="md:col-span-8 bg-white border border-outline-variant p-4 rounded-xl card-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">FLUJO DE CAJA MENSUAL</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-secondary"/>INGRESOS</div>
              <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-error"/>GASTOS</div>
            </div>
          </div>
          <div className="h-40 w-full">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
              <defs>
                <linearGradient id="incGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#006e25', stopOpacity: 1 }}/>
                  <stop offset="100%" style={{ stopColor: '#006e25', stopOpacity: 0 }}/>
                </linearGradient>
              </defs>
              <path d="M0,80 L200,60 L400,65 L600,40 L800,45 L1000,20 L1000,100 L0,100 Z" fill="url(#incGrad)" opacity="0.1"/>
              <path d="M0,80 L200,60 L400,65 L600,40 L800,45 L1000,20" fill="none" stroke="#006e25" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
            </svg>
          </div>
          <div className="flex justify-between mt-2 border-t border-outline-variant pt-2">
            {['ENE','FEB','MAR','ABR','MAY','JUN'].map(m => (
              <span key={m} className="text-[10px] font-semibold tracking-wider text-outline">{m}</span>
            ))}
          </div>
        </section>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-outline-variant p-4 rounded-xl card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">TASA DE OCUPACIÓN</span>
              <div className="text-[26px] font-bold mt-2">{loading ? '—' : `${data?.occupancyRate || 0}%`}</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[32px]">home_work</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: `${data?.occupancyRate || 0}%` }}/>
          </div>
          <p className="mt-2 text-[12px] text-on-surface-variant">+0.8% vs trimestre anterior</p>
        </div>
        <div className="bg-white border border-outline-variant p-4 rounded-xl card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">TASA DE MOROSIDAD</span>
              <div className="text-[26px] font-bold mt-2 text-error">2.1%</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-error h-full" style={{ width: '2%' }}/>
          </div>
          <p className="mt-2 text-[12px] text-on-surface-variant">Umbral de bajo riesgo mantenido</p>
        </div>
      </div>

      {/* Transactions table */}
      <section className="bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden mb-4">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">TRANSACCIONES RECIENTES</h3>
          <button className="text-primary text-[11px] font-bold tracking-wider flex items-center gap-1 hover:underline">
            VER TODO <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface text-[10px] font-bold tracking-widest text-outline-variant uppercase">
                <th className="px-4 py-3">ENTIDAD</th>
                <th className="px-4 py-3">TIPO</th>
                <th className="px-4 py-3">MONTO</th>
                <th className="px-4 py-3">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant text-sm">Cargando...</td></tr>
              ) : (data?.recentTransactions || []).length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant text-sm">Sin transacciones aún</td></tr>
              ) : (data?.recentTransactions || []).map((t, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{t.entity}</td>
                  <td className="px-4 py-3 text-[11px] font-bold tracking-wider">{t.type === 'income' ? 'INGRESOS' : 'GASTOS'}</td>
                  <td className={`px-4 py-3 font-mono font-semibold ${t.type === 'income' ? 'text-secondary' : 'text-error'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(Math.abs(t.amount))}
                  </td>
                  <td className="px-4 py-3">
                    <span className="pill-status bg-secondary/10 text-secondary">{t.status.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
