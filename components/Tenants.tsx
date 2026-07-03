'use client'

import { useState, useEffect } from 'react'
import type { Tenant } from '@/lib/db'
import AddTenantModal from './AddTenantModal'

const PAYMENT_STYLES: Record<string, string> = {
  paid: 'bg-secondary/10 text-secondary',
  pending: 'bg-error/10 text-error',
  overdue: 'bg-error/20 text-error',
}
const PAYMENT_LABELS: Record<string, string> = {
  paid: 'PAGADO', pending: 'PENDIENTE', overdue: 'VENCIDO',
}

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'current' | 'past'>('current')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/tenants?status=${tab}`)
      .then(r => r.json())
      .then(d => { setTenants(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [tab])

  const filtered = tenants.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    (t.property_name as string | undefined)?.toLowerCase().includes(search.toLowerCase())
  )

  const remove = async (id: string) => {
    if (!window.confirm('Eliminar este inquilino?')) return
    setDeletingId(id)
    const res = await fetch(`/api/tenants?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (res.ok) setTenants(current => current.filter(t => t.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="px-6 py-4">
      <section className="mb-6">
        <h2 className="text-[32px] font-semibold leading-tight text-primary mb-1">Inquilinos</h2>
        <p className="text-base text-on-surface-variant">Gestiona contratos de arrendamiento y salud de pagos.</p>
      </section>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-xl outline-none focus:border-primary text-base transition-colors"
            placeholder="Buscar por nombre, propiedad o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex p-1 bg-surface-container rounded-xl">
          <button
            onClick={() => setTab('current')}
            className={`px-6 py-2 rounded-lg font-bold text-[11px] tracking-wider transition-all ${tab === 'current' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
          >
            ACTUALES
          </button>
          <button
            onClick={() => setTab('past')}
            className={`px-6 py-2 rounded-lg font-bold text-[11px] tracking-wider transition-all ${tab === 'past' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-white/50'}`}
          >
            PASADOS
          </button>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 font-semibold text-[11px] tracking-wider"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          AGREGAR
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white border border-outline-variant rounded-xl animate-pulse"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[64px] text-outline-variant">person_off</span>
          <p className="text-on-surface-variant mt-4 font-semibold">No se encontraron inquilinos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(t => (
            <div key={t.id} className="flex flex-col lg:flex-row items-center justify-between p-4 bg-white border border-outline-variant rounded-xl card-shadow hover:shadow-md hover:border-primary transition-all">
              <div className="flex items-center gap-4 w-full lg:w-1/3">
                <div className="relative flex-shrink-0">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.full_name} className="w-14 h-14 rounded-full object-cover"/>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-lg">
                      {t.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    t.payment_status === 'paid' ? 'bg-secondary' : 'bg-error'
                  }`}/>
                </div>
                <div>
                  <p className="font-bold text-base text-primary">{t.full_name}</p>
                  <p className="text-[11px] font-semibold tracking-wider text-on-surface-variant">{t.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:flex items-center justify-between w-full lg:w-2/3 mt-4 lg:mt-0 gap-4 lg:gap-0">
                <div className="lg:px-4">
                  <p className="text-[11px] font-semibold tracking-wider text-outline uppercase mb-1">Propiedad</p>
                  <p className="font-semibold text-base text-primary">{t.property_name || '—'}</p>
                </div>
                <div className="lg:px-4">
                  <p className="text-[11px] font-semibold tracking-wider text-outline uppercase mb-1">Fin de Contrato</p>
                  <div className={`flex items-center gap-1 ${new Date(t.contract_end) < new Date() ? 'text-error' : 'text-on-surface'}`}>
                    <span className="material-symbols-outlined text-[17px]">
                      {new Date(t.contract_end) < new Date() ? 'event_busy' : 'calendar_month'}
                    </span>
                    <p className="font-mono font-bold text-sm">{new Date(t.contract_end).toLocaleDateString('es')}</p>
                  </div>
                </div>
                <div className="lg:px-4">
                  <p className="text-[11px] font-semibold tracking-wider text-outline uppercase mb-1">Pago</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${PAYMENT_STYLES[t.payment_status] || 'bg-surface-container text-on-surface-variant'}`}>
                    {PAYMENT_LABELS[t.payment_status] || t.payment_status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-end items-center lg:px-4">
                  <button
                    onClick={() => remove(t.id)}
                    disabled={deletingId === t.id}
                    className="p-2 text-error hover:bg-error hover:text-white rounded-lg disabled:opacity-50"
                    title="Eliminar inquilino"
                  >
                    <span className="material-symbols-outlined">{deletingId === t.id ? 'hourglass_top' : 'delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd && <AddTenantModal onClose={() => setShowAdd(false)} onSaved={(tenant) => { setShowAdd(false); setTenants(current => [tenant, ...current]) }} />}
    </div>
  )
}
