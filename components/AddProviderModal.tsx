'use client'

import { useState } from 'react'
import type { Provider } from '@/lib/db'
import { fileToResizedDataUrl } from '@/lib/media'

type Props = {
  onClose: () => void
  onSaved: (provider: Provider) => void
  provider?: Provider // si viene, es edición
}

export default function AddProviderModal({ onClose, onSaved, provider }: Props) {
  const editing = !!provider
  const [form, setForm] = useState({
    name: provider?.name || '',
    category: provider?.category || '',
    rating: provider ? String(provider.rating) : '5',
    phone: provider?.phone || '',
    email: provider?.email || '',
  })
  const [avatar, setAvatar] = useState<string | null>(provider?.avatar_url || null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const onAvatar = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true); setError('')
    try {
      setAvatar(await fileToResizedDataUrl(files[0], 400, 0.75))
    } catch (e: any) { setError(e.message || 'Error con la imagen') }
    finally { setUploading(false) }
  }

  const save = async () => {
    if (!form.name || !form.category) {
      setError('Nombre y categoría son obligatorios')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/providers', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, avatar_url: avatar, ...(editing ? { id: provider!.id } : {}) }),
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
          <h2 className="text-2xl font-bold text-primary">{editing ? 'Editar Proveedor' : 'Agregar Proveedor'}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="bg-error-container text-on-error-container text-sm p-3 rounded-lg">{error}</p>}

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant flex items-center justify-center">
              {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-outline">handyman</span>}
            </div>
            <label className="px-4 py-2 border border-outline rounded-lg text-[11px] font-bold tracking-wider text-primary cursor-pointer hover:bg-surface-container-low flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">{uploading ? 'hourglass_top' : 'photo_camera'}</span>
              {uploading ? 'PROCESANDO' : (avatar ? 'CAMBIAR FOTO' : 'SUBIR FOTO')}
              <input type="file" accept="image/*" className="hidden" onChange={e => onAvatar(e.target.files)} />
            </label>
            {avatar && <button onClick={() => setAvatar(null)} className="text-error text-[11px] font-bold tracking-wider">QUITAR</button>}
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">NOMBRE*</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" placeholder="Ej: Apex Legal Partners" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">CATEGORÍA*</label>
              <input value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" placeholder="Legal, Limpieza..." />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">RATING</label>
              <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">TELÉFONO</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">EMAIL</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-3 border border-outline text-primary rounded-lg font-bold text-[11px] tracking-wider hover:bg-surface-container-low">CANCELAR</button>
          <button onClick={save} disabled={saving || uploading} className="flex-[2] py-3 bg-primary text-white rounded-lg font-bold text-[11px] tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">{saving ? 'refresh' : 'save'}</span>
            {saving ? 'GUARDANDO...' : (editing ? 'GUARDAR CAMBIOS' : 'GUARDAR PROVEEDOR')}
          </button>
        </div>
      </div>
    </div>
  )
}
