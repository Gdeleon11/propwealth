'use client'

import { useState } from 'react'
import type { Property } from '@/lib/db'
import { fileToResizedDataUrl } from '@/lib/media'
import MapPicker from './MapPicker'

type Props = { onClose: () => void; onSaved: (property: Property) => void }

export default function AddPropertyModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: '', address: '', type: 'Apartamento', status: 'available',
    monthly_rent: '', purchase_value: '', security_deposit: '',
  })
  const [gallery, setGallery] = useState<string[]>([])
  const [services, setServices] = useState<{ name: string; active: boolean }[]>([])
  const [serviceInput, setServiceInput] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const onPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    try {
      const urls: string[] = []
      for (const file of Array.from(files).slice(0, 8)) {
        urls.push(await fileToResizedDataUrl(file))
      }
      setGallery(g => [...g, ...urls].slice(0, 8))
    } catch (e: any) {
      setError(e.message || 'Error al procesar imágenes')
    } finally {
      setUploading(false)
    }
  }

  const addService = () => {
    const name = serviceInput.trim()
    if (!name) return
    setServices(s => [...s, { name, active: true }])
    setServiceInput('')
  }

  const save = async () => {
    if (!form.name || !form.address) { setError('Nombre y dirección son obligatorios'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        image_url: gallery[0] || null,
        gallery: gallery.slice(1),
        services,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      }),
    })
    const data = await res.json()
    if (res.ok) { onSaved(data) }
    else { setError(data.error || 'Error al guardar'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-primary">Agregar Propiedad</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-5">
          {error && <p className="bg-error-container text-on-error-container text-sm p-3 rounded-lg">{error}</p>}

          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">NOMBRE*</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary"
              placeholder="Ej: Skyline Loft 402"/>
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-1">DIRECCIÓN*</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-4 py-3 text-base outline-none focus:border-primary"
              placeholder="Calle, Número, Ciudad"/>
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">FOTOS (hasta 8)</label>
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-outline-variant">
                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 bg-secondary text-white text-[8px] font-bold px-1.5 py-0.5 rounded">PORTADA</span>}
                  <button onClick={() => setGallery(g => g.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </div>
              ))}
              {gallery.length < 8 && (
                <label className="aspect-square rounded-lg border border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">{uploading ? 'hourglass_top' : 'add_a_photo'}</span>
                  <span className="text-[9px] font-bold mt-1">{uploading ? 'PROCESANDO' : 'SUBIR'}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => onPhotos(e.target.files)} />
                </label>
              )}
            </div>
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
                  <input type="number" value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                    className="w-full border border-outline-variant rounded-lg pl-7 pr-3 py-3 text-sm font-mono outline-none focus:border-primary"
                    placeholder="0" />
                </div>
              </div>
            ))}
          </div>

          {/* Servicios incluidos */}
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">SERVICIOS INCLUIDOS</label>
            <div className="flex gap-2 mb-2">
              <input value={serviceInput} onChange={e => setServiceInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addService() } }}
                placeholder="Ej: Agua potable, Internet..."
                className="flex-1 border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary" />
              <button type="button" onClick={addService} className="px-4 py-2 bg-primary text-white rounded-lg text-[11px] font-bold tracking-wider">AGREGAR</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.map((s, i) => (
                <span key={i} className="flex items-center gap-1 bg-secondary-container text-secondary text-xs font-semibold px-3 py-1 rounded-full">
                  {s.name}
                  <button onClick={() => setServices(list => list.filter((_, idx) => idx !== i))}><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
              ))}
            </div>
          </div>

          {/* Ubicación en mapa */}
          <div>
            <label className="block text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">UBICACIÓN EN EL MAPA</label>
            <MapPicker editable lat={coords?.lat} lng={coords?.lng} onChange={(lat, lng) => setCoords({ lat, lng })} />
            {coords && <p className="text-[11px] text-on-surface-variant mt-1">Coordenadas: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>}
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-3 border border-outline text-primary rounded-lg font-bold text-[11px] tracking-wider hover:bg-surface-container-low">
            CANCELAR
          </button>
          <button onClick={save} disabled={saving || uploading}
            className="flex-[2] py-3 bg-primary text-white rounded-lg font-bold text-[11px] tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> GUARDANDO...</> : <><span className="material-symbols-outlined text-sm">save</span> GUARDAR PROPIEDAD</>}
          </button>
        </div>
      </div>
    </div>
  )
}
