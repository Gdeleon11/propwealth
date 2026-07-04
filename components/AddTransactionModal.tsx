'use client'

import { useState, useEffect } from 'react'

type Props = { onClose: () => void; onSaved: (tx: any) => void }

export default function AddTransactionModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    entity: '',
    type: 'income',
    amount: '',
    status: 'processed',
    property_id: '',
    description: '',
  })
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
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
    if (!form.entity || !form.amount) {
      setError('Concepto y monto son obligatorios')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity: form.entity,
        type: form.type,
        amount: Number(form.amount),
        status: form.status,
        property_id: form.property_id || null,
        description: form.description || null,
      }),
    })
    const data = await res.json()
    if (res.ok) onSaved(data)
    else {
      setError(data.error || 'Error al guardar')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="text-2xl font-bold text-primary">Registrar Movimiento</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="bg-error-container text-on-error-container text-sm p-3 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => set('type', 'income')}
              className={`py-3 rounded-lg font-bold text-[11px] tracking-wider border ${form.type === 'income' ? 'bg-secondary text-white border-secondary' : 'border-outline text-on-surface-variant'}`}
            >
              INGRESO
            </button>
            <button
              onClick={() => set('type', 'expense')}
              className={`py-3 rounded-lg font-bold text-[11px] tracking-wider border ${form.type === 'expense' ? 'bg-error text-white border-error' : 'border-outline text-on-surface-variant'}`}
            >
              GASTO
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">CONCEPTO*</label>
            <input value={form.entity} onChange={(e) => set('entity', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" placeholder="Ej. Renta Apt 402, Reparación plomería" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">MONTO*</label>
              <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">ESTADO</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary bg-white">
                <option value="processed">Procesado</option>
                <option value="pending">Pendiente</option>
                <option value="failed">Fallido</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">PROPIEDAD</label>
            <select value={form.property_id} onChange={(e) => set('property_id', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary bg-white">
              <option value="">Sin asignar</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">NOTA</label>
            <input value={form.description} onChange={(e) => set('description', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" placeholder="Opcional" />
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-3 border border-outline text-primary rounded-lg font-bold text-[11px] tracking-wider hover:bg-surface-container-low">CANCELAR</button>
          <button onClick={save} disabled={saving} className="flex-[2] py-3 bg-primary text-white rounded-lg font-bold text-[11px] tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">{saving ? 'refresh' : 'save'}</span>
            {saving ? 'GUARDANDO...' : 'GUARDAR MOVIMIENTO'}
          </button>
        </div>
      </div>
    </div>
  )
}
