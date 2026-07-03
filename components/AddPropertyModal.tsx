'use client'

import { useState } from 'react'
import type { Property } from '@/lib/db'

type Props = { onClose: () => void; onSaved: (property: Property) => void }

export default function AddPropertyModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: '', address: '', type: 'Apartamento', status: 'available',
    monthly_rent: '', purchase_value: '', security_deposit: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name || !form.address) { setError('Nombre y dirección son obligatorios'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) { onSaved(data) }
    else { setError(data.error || 'Error al guardar'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="text-2xl font-bold text-primary">Agregar Propiedad</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="bg-error-container text-on-error-container text-sm p-3 rounded-lg">{error}</p>}

          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">NOMBRE*</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary transition-colors"
              placeholder="Ej: Skyline Loft 402"/>
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">DIRECCIÓN*</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary"
              placeholder="Calle, Número, Ciudad"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">TIPO</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary bg-white">
                {['Apartamento','Casa','Local Comercial','Oficina','Terreno'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">ESTADO</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary bg-white">
                <option value="available">Disponible</option>
                <option value="rented">Rentado</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'purchase_value', label: 'VALOR COMPRA' },
              { key: 'monthly_rent', label: 'RENTA MENSUAL' },
              { key: 'security_deposit', label: 'DEPÓSITO' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-outline">$</span>
                  <input
                    type="number"
                    value={(form as any)[key]}
                    onChange={e => set(key, e.target.value)}
                    className="w-full border border-outline-variant rounded-lg pl-7 pr-3 py-3 text-sm font-mono outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-3 border border-outline text-primary rounded-lg font-bold text-[11px] tracking-wider hover:bg-surface-container-low">
            CANCELAR
          </button>
          <button onClick={save} disabled={saving}
            className="flex-[2] py-3 bg-primary text-white rounded-lg font-bold text-[11px] tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> GUARDANDO...</> : <><span className="material-symbols-outlined text-sm">save</span> GUARDAR PROPIEDAD</>}
          </button>
        </div>
      </div>
    </div>
  )
}
