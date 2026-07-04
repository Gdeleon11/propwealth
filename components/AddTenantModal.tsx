'use client'

import { useState, useEffect } from 'react'
import type { Tenant } from '@/lib/db'

type Props = { onClose: () => void; onSaved: (tenant: Tenant) => void; tenant?: Tenant }

function dateOnly(d?: string) {
  if (!d) return ''
  return String(d).split('T')[0]
}

export default function AddTenantModal({ onClose, onSaved, tenant }: Props) {
  const editing = !!tenant
  const [form, setForm] = useState({
    full_name: tenant?.full_name || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    property_id: (tenant as any)?.property_id || '',
    contract_start: dateOnly((tenant as any)?.contract_start) || new Date().toISOString().split('T')[0],
    contract_end: dateOnly((tenant as any)?.contract_end) || '',
    payment_status: (tenant as any)?.payment_status || 'pending',
  })
  const [properties, setProperties] = useState<{ id: string; name: string; address: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((rows) => setProperties(Array.isArray(rows) ? rows : []))
      .catch(() => setProperties([]))
  }, [])

  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const save = async () => {
    if (!form.full_name || !form.email || !form.contract_start || !form.contract_end) {
      setError('Nombre, email y fechas de contrato son obligatorios')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/tenants', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ...(editing ? { id: tenant!.id } : {}) }),
    })
    const data = await res.json()
    if (res.ok && !data.error) onSaved(data)
    else {
      setError(data.error || 'Error al guardar')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="text-2xl font-bold text-primary">{editing ? 'Editar Inquilino' : 'Agregar Inquilino'}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="bg-error-container text-on-error-container text-sm p-3 rounded-lg">{error}</p>}
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">NOMBRE*</label>
            <input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" placeholder="Nombre completo" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">EMAIL*</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">TELEFONO</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">PROPIEDAD ASIGNADA</label>
            <select value={form.property_id} onChange={(e) => set('property_id', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary bg-white">
              <option value="">Sin asignar</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.address ? ` — ${p.address}` : ''}</option>
              ))}
            </select>
            {properties.length === 0 && (
              <p className="text-[11px] text-on-surface-variant mt-1">Agrega una propiedad primero para poder asignarla.</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">INICIO*</label>
              <input type="date" value={form.contract_start} onChange={(e) => set('contract_start', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">FIN*</label>
              <input type="date" value={form.contract_end} onChange={(e) => set('contract_end', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">PAGO</label>
              <select value={form.payment_status} onChange={(e) => set('payment_status', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary bg-white">
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-3 border border-outline text-primary rounded-lg font-bold text-[11px] tracking-wider hover:bg-surface-container-low">CANCELAR</button>
          <button onClick={save} disabled={saving} className="flex-[2] py-3 bg-primary text-white rounded-lg font-bold text-[11px] tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">{saving ? 'refresh' : 'save'}</span>
            {saving ? 'GUARDANDO...' : (editing ? 'GUARDAR CAMBIOS' : 'GUARDAR INQUILINO')}
          </button>
        </div>
      </div>
    </div>
  )
}
