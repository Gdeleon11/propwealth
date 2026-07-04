'use client'

import { useEffect, useState } from 'react'
import type { Property, Tenant } from '@/lib/db'
import { fileToResizedDataUrl, fileToDataUrl } from '@/lib/media'
import MapPicker from './MapPicker'

type Props = {
  property: Property
  imageUrl: string
  onBack: () => void
  onSaved: (property: Property) => void
}

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function fmtDate(d?: string) {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PropertyDetail({ property, imageUrl, onBack, onSaved }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: property.name,
    address: property.address,
    type: property.type,
    status: property.status,
    monthly_rent: String(property.monthly_rent),
    purchase_value: String(property.purchase_value),
    security_deposit: String(property.security_deposit),
    roi_pct: String(property.roi_pct),
    cash_flow: String(property.cash_flow),
    occupancy_pct: String(property.occupancy_pct),
  })
  const [photos, setPhotos] = useState<string[]>(
    property.image_url ? [property.image_url, ...(property.gallery || [])] : [...(property.gallery || [])]
  )
  const [services, setServices] = useState<{ name: string; active: boolean }[]>(property.services || [])
  const [maintenance, setMaintenance] = useState<{ title: string; date: string; cost?: number }[]>(property.maintenance || [])
  const [documents, setDocuments] = useState<{ name: string; data: string }[]>(property.documents || [])
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    property.lat != null && property.lng != null ? { lat: Number(property.lat), lng: Number(property.lng) } : null
  )
  const [serviceInput, setServiceInput] = useState('')
  const [maintTitle, setMaintTitle] = useState('')
  const [maintDate, setMaintDate] = useState('')
  const [maintCost, setMaintCost] = useState('')

  // Inquilinos
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [assignId, setAssignId] = useState('')

  const loadTenants = () => {
    fetch('/api/tenants')
      .then(r => r.json())
      .then(d => setTenants(Array.isArray(d) ? d : []))
      .catch(() => setTenants([]))
  }
  useEffect(() => { loadTenants() }, [])

  const assignedTenants = tenants.filter(t => (t as any).property_id === property.id)

  const set = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }))

  const onPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true); setError('')
    try {
      const urls: string[] = []
      for (const file of Array.from(files).slice(0, 8)) urls.push(await fileToResizedDataUrl(file))
      setPhotos(p => [...p, ...urls].slice(0, 8))
    } catch (e: any) { setError(e.message || 'Error al procesar imágenes') }
    finally { setUploading(false) }
  }

  const onDocs = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true); setError('')
    try {
      const added: { name: string; data: string }[] = []
      for (const file of Array.from(files)) {
        added.push({ name: file.name, data: await fileToDataUrl(file) })
      }
      const next = [...documents, ...added]
      setDocuments(next)
      await patchProperty({ documents: next })
    } catch (e: any) { setError(e.message || 'Error al subir documento') }
    finally { setUploading(false) }
  }

  // Crea una transacción (ingreso/gasto)
  const addTransaction = async (tx: { type: 'income' | 'expense'; entity: string; amount: number; tenant_id?: string }) => {
    if (!tx.amount || tx.amount <= 0) return
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: tx.type,
        entity: tx.entity,
        amount: tx.amount,
        status: 'processed',
        property_id: property.id,
        tenant_id: tx.tenant_id || null,
      }),
    })
  }

  const assignTenant = async () => {
    if (!assignId) return
    await fetch('/api/tenants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: assignId, property_id: property.id }),
    })
    // Si la propiedad está rentada y tiene renta, registramos el ingreso del mes
    const rent = Number(form.monthly_rent) || 0
    if (form.status === 'rented' && rent > 0) {
      await addTransaction({ type: 'income', entity: `Renta · ${form.name}`, amount: rent, tenant_id: assignId })
    }
    setAssignId('')
    loadTenants()
  }

  const unassignTenant = async (id: string) => {
    await fetch('/api/tenants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, property_id: '' }),
    })
    loadTenants()
  }

  // Construye el payload actual; `over` permite sobreescribir listas recién modificadas
  const buildPayload = (over: Record<string, any> = {}) => ({
    id: property.id,
    name: form.name,
    address: form.address,
    type: form.type,
    status: form.status,
    monthly_rent: Number(form.monthly_rent) || 0,
    purchase_value: Number(form.purchase_value) || 0,
    security_deposit: Number(form.security_deposit) || 0,
    roi_pct: Number(form.roi_pct) || 0,
    cash_flow: Number(form.cash_flow) || 0,
    occupancy_pct: Number(form.occupancy_pct) || 0,
    image_url: photos[0] || null,
    gallery: photos.slice(1),
    services,
    maintenance,
    documents,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    ...over,
  })

  const patchProperty = async (over: Record<string, any> = {}) => {
    const res = await fetch('/api/properties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(over)),
    })
    const data = await res.json()
    if (res.ok && !data.error) { onSaved(data); return true }
    setError(data.error || 'Error al guardar')
    return false
  }

  const save = async () => {
    setSaving(true); setError('')
    const ok = await patchProperty()
    if (ok) setEditing(false)
    setSaving(false)
  }

  // Agrega mantenimiento (guarda de inmediato) y crea el gasto si tiene costo
  const addMaintenance = async () => {
    if (!maintTitle.trim()) return
    const cost = Number(maintCost) || 0
    const item = { title: maintTitle.trim(), date: maintDate, cost }
    const next = [...maintenance, item]
    setMaintenance(next)
    setMaintTitle(''); setMaintDate(''); setMaintCost('')
    await patchProperty({ maintenance: next })
    if (cost > 0) await addTransaction({ type: 'expense', entity: `Mantenimiento · ${item.title}`, amount: cost })
  }

  const removeMaintenance = async (i: number) => {
    const next = maintenance.filter((_, idx) => idx !== i)
    setMaintenance(next)
    await patchProperty({ maintenance: next })
  }

  const removeDocument = async (i: number) => {
    const next = documents.filter((_, idx) => idx !== i)
    setDocuments(next)
    await patchProperty({ documents: next })
  }

  const displayed = {
    name: form.name,
    type: form.type,
    status: form.status,
    address: form.address,
    monthly_rent: Number(form.monthly_rent) || 0,
    roi_pct: Number(form.roi_pct) || 0,
    cash_flow: Number(form.cash_flow) || 0,
  }
  const cover = photos[0] || imageUrl
  const statusLabel = displayed.status === 'rented' ? 'RENTADA' : displayed.status === 'maintenance' ? 'MANTENIMIENTO' : 'DISPONIBLE'

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-primary" title="Volver">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-[28px] font-bold text-primary leading-tight">{displayed.name}</h2>
            <p className="text-sm text-on-surface-variant">{displayed.type} · {statusLabel.toLowerCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing && (
            <button onClick={save} disabled={saving || uploading} className="px-5 py-2 rounded-lg bg-primary text-white text-[11px] font-bold tracking-wider disabled:opacity-50">
              {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </button>
          )}
          <button onClick={() => setEditing(v => !v)} className="px-4 py-2 rounded-lg bg-secondary text-white text-[11px] font-bold tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">{editing ? 'close' : 'edit'}</span>
            {editing ? 'CANCELAR' : 'EDITAR'}
          </button>
        </div>
      </div>

      {error && <p className="bg-error-container text-on-error-container text-sm p-3 rounded-lg">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 space-y-4">
          {/* Galería */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:h-[320px]">
            <div className="md:col-span-2 relative overflow-hidden rounded-xl border border-outline-variant min-h-[260px] bg-surface-container-high">
              {cover ? <img src={cover} alt={displayed.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined text-[48px]">image</span></div>}
              <span className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">{statusLabel}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              {photos.slice(1, 3).map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border border-outline-variant h-32 md:h-full">
                  <img src={src} alt={`Foto ${i + 2}`} className="w-full h-full object-cover" />
                  {i === 1 && photos.length > 3 && <span className="absolute bottom-3 right-3 bg-black/65 text-white px-3 py-1 rounded-full text-[10px] font-bold">+{photos.length - 3} Fotos</span>}
                </div>
              ))}
              {photos.length < 2 && !editing && (
                <div className="rounded-xl border border-dashed border-outline-variant h-32 md:h-full flex items-center justify-center text-on-surface-variant text-xs">Sin más fotos</div>
              )}
            </div>
          </div>

          {editing && (
            <div className="bg-white border border-outline-variant rounded-xl p-5 card-shadow space-y-4">
              {/* Fotos editables */}
              <div>
                <p className="text-[11px] font-bold tracking-wider text-outline uppercase mb-2">Fotos</p>
                <div className="grid grid-cols-5 gap-2">
                  {photos.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-outline-variant">
                      <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute top-1 left-1 bg-secondary text-white text-[8px] font-bold px-1 rounded">PORTADA</span>}
                      <button onClick={() => setPhotos(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </div>
                  ))}
                  {photos.length < 8 && (
                    <label className="aspect-square rounded-lg border border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-primary text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined">{uploading ? 'hourglass_top' : 'add_a_photo'}</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => onPhotos(e.target.files)} />
                    </label>
                  )}
                </div>
              </div>

              {/* Campos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="md:col-span-2 text-[11px] font-bold tracking-wider text-outline uppercase">Nombre
                  <input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2 text-base text-primary outline-none focus:border-primary" />
                </label>
                <label className="text-[11px] font-bold tracking-wider text-outline uppercase">Estado
                  <select value={form.status} onChange={e => set('status', e.target.value)} className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2 text-base text-primary outline-none focus:border-primary bg-white">
                    <option value="rented">Rentada</option>
                    <option value="available">Disponible</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </label>
                <label className="md:col-span-3 text-[11px] font-bold tracking-wider text-outline uppercase">Dirección
                  <input value={form.address} onChange={e => set('address', e.target.value)} className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2 text-base text-primary outline-none focus:border-primary" />
                </label>
                {[
                  ['monthly_rent', 'Renta mensual'],
                  ['purchase_value', 'Precio / valor'],
                  ['security_deposit', 'Depósito'],
                  ['roi_pct', 'ROI %'],
                  ['cash_flow', 'Flujo de caja'],
                  ['occupancy_pct', 'Ocupación %'],
                ].map(([key, label]) => (
                  <label key={key} className="text-[11px] font-bold tracking-wider text-outline uppercase">{label}
                    <input type="number" value={(form as any)[key]} onChange={e => set(key, e.target.value)} className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2 text-base text-primary outline-none focus:border-primary" />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Metric label="RENTA MENSUAL" value={money(displayed.monthly_rent)} />
            <Metric label="ROI ANUAL" value={`${displayed.roi_pct}%`} tone="green" />
            <Metric label="FLUJO DE CAJA" value={money(displayed.cash_flow)} sub="NETO DESPUÉS DE GASTOS" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ubicación */}
            <div className="bg-white border border-outline-variant rounded-xl p-5 card-shadow">
              <h3 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[17px]">location_on</span> Ubicación
              </h3>
              <p className="text-sm text-primary mb-4">{displayed.address}</p>
              {editing ? (
                <MapPicker editable lat={coords?.lat} lng={coords?.lng} onChange={(lat, lng) => setCoords({ lat, lng })} height={200} />
              ) : coords ? (
                <MapPicker lat={coords.lat} lng={coords.lng} height={176} />
              ) : (
                <div className="h-44 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant text-sm">Sin ubicación definida</div>
              )}
            </div>

            {/* Servicios */}
            <div className="bg-white border border-outline-variant rounded-xl p-5 card-shadow">
              <h3 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[17px]">bolt</span> Servicios incluidos
              </h3>
              {services.length === 0 && !editing && <p className="text-sm text-on-surface-variant">Sin servicios registrados</p>}
              {services.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-surface-variant last:border-0">
                  <span className="flex items-center gap-2 text-sm text-primary"><span className="material-symbols-outlined text-[17px]">radio_button_checked</span>{s.name}</span>
                  {editing ? (
                    <button onClick={() => setServices(list => list.filter((_, idx) => idx !== i))} className="text-error"><span className="material-symbols-outlined text-[17px]">delete</span></button>
                  ) : (
                    <span className="pill-status bg-secondary-container text-secondary">ACTIVO</span>
                  )}
                </div>
              ))}
              {editing && (
                <div className="flex gap-2 mt-3">
                  <input value={serviceInput} onChange={e => setServiceInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (serviceInput.trim()) { setServices(s => [...s, { name: serviceInput.trim(), active: true }]); setServiceInput('') } } }}
                    placeholder="Agregar servicio..." className="flex-1 border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                  <button onClick={() => { if (serviceInput.trim()) { setServices(s => [...s, { name: serviceInput.trim(), active: true }]); setServiceInput('') } }} className="px-3 py-2 bg-primary text-white rounded-lg text-[11px] font-bold">+</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          {/* Inquilino */}
          <Panel title="INFORMACIÓN DEL INQUILINO">
            {assignedTenants.length === 0 ? (
              <div>
                <p className="text-sm text-on-surface-variant mb-3">Sin inquilino asignado.</p>
                <label className="block text-[11px] font-bold tracking-wider text-outline uppercase mb-1">Asignar existente</label>
                <div className="flex gap-2">
                  <select value={assignId} onChange={e => setAssignId(e.target.value)} className="flex-1 border border-outline-variant rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-primary">
                    <option value="">Elegir inquilino...</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                  <button onClick={assignTenant} disabled={!assignId} className="px-3 py-2 bg-primary text-white rounded-lg text-[11px] font-bold disabled:opacity-50">OK</button>
                </div>
                {tenants.length === 0 && <p className="text-[11px] text-on-surface-variant mt-2">No tienes inquilinos aún. Créalos en la sección Inquilinos.</p>}
              </div>
            ) : (
              assignedTenants.map(t => (
                <div key={t.id} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
                      {t.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{t.full_name}</p>
                      <p className="text-xs text-on-surface-variant">{t.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <Row label="Contrato desde" value={fmtDate((t as any).contract_start)} />
                    <Row label="Expiración" value={fmtDate((t as any).contract_end)} />
                    <Row label="Pago" value={((t as any).payment_status || '').toUpperCase()} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <a href={`mailto:${t.email}`} className="flex-1 py-2 bg-primary text-white rounded text-[11px] font-bold tracking-wider flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">mail</span> CONTACTAR
                    </a>
                    <button onClick={() => unassignTenant(t.id)} className="px-3 py-2 border border-outline text-on-surface-variant rounded text-[11px] font-bold tracking-wider" title="Quitar de esta propiedad">
                      <span className="material-symbols-outlined text-[16px]">link_off</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </Panel>

          {/* Mantenimientos */}
          <Panel title="PRÓXIMOS MANTENIMIENTOS" accent>
            {maintenance.length === 0 && <p className="text-sm text-on-surface-variant mb-3">Sin mantenimientos programados</p>}
            <div className="space-y-2">
              {maintenance.map((m, i) => (
                <div key={i} className="bg-surface-container-low p-3 rounded-lg flex items-start justify-between">
                  <div>
                    <p className="font-bold text-primary text-sm">{m.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Programado: {fmtDate(m.date)}{m.cost ? ` · ${money(Number(m.cost))}` : ''}
                    </p>
                  </div>
                  <button onClick={() => removeMaintenance(i)} className="text-error"><span className="material-symbols-outlined text-[17px]">delete</span></button>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2 border-t border-surface-variant pt-3">
              <input value={maintTitle} onChange={e => setMaintTitle(e.target.value)} placeholder="Título (ej: Revisión A/C)" className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
              <div className="flex gap-2">
                <input type="date" value={maintDate} onChange={e => setMaintDate(e.target.value)} className="flex-1 border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" title="Fecha" />
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-outline text-sm">$</span>
                  <input type="number" value={maintCost} onChange={e => setMaintCost(e.target.value)} placeholder="Costo" className="w-full border border-outline-variant rounded-lg pl-5 pr-2 py-2 text-sm outline-none focus:border-primary" title="Costo (crea un gasto)" />
                </div>
              </div>
              <button onClick={addMaintenance} className="w-full py-2 bg-primary text-white rounded-lg text-[11px] font-bold tracking-wider">AGREGAR MANTENIMIENTO</button>
              <p className="text-[11px] text-on-surface-variant">Si pones un costo, se registra automáticamente como gasto en el Flujo.</p>
            </div>
          </Panel>

          {/* Documentos */}
          <Panel title="DOCUMENTOS">
            {documents.length === 0 && <p className="text-sm text-on-surface-variant mb-2">Sin documentos</p>}
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-surface-variant last:border-0">
                <span className="flex items-center gap-2 text-sm text-primary truncate max-w-[70%]">
                  <span className="material-symbols-outlined text-error text-[17px]">description</span>{doc.name}
                </span>
                <div className="flex items-center gap-1">
                  <a href={doc.data} download={doc.name} className="text-outline hover:text-primary"><span className="material-symbols-outlined text-[17px]">download</span></a>
                  <button onClick={() => removeDocument(i)} className="text-error"><span className="material-symbols-outlined text-[17px]">delete</span></button>
                </div>
              </div>
            ))}
            <label className="mt-3 w-full py-3 border border-dashed border-outline-variant rounded-lg text-[11px] font-bold tracking-wider text-on-surface-variant hover:border-primary hover:text-primary flex items-center justify-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">upload</span> {uploading ? 'SUBIENDO...' : '+ SUBIR DOCUMENTO'}
              <input type="file" className="hidden" multiple onChange={e => onDocs(e.target.files)} />
            </label>
            <p className="text-[11px] text-on-surface-variant mt-2">Máx 3MB por archivo. Se guardan automáticamente.</p>
          </Panel>
        </aside>
      </div>
    </div>
  )
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'green' }) {
  return (
    <div className="bg-white border border-outline-variant rounded-xl p-5 card-shadow">
      <p className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">{label}</p>
      <p className={`text-[28px] font-bold mt-2 ${tone === 'green' ? 'text-secondary' : 'text-primary'}`}>{value}</p>
      <div className={`mt-3 h-1 rounded-full ${tone === 'green' ? 'bg-secondary' : 'bg-primary'} w-3/4`} />
      {sub && <p className="text-[11px] text-on-surface-variant mt-2">{sub}</p>}
    </div>
  )
}

function Panel({ title, accent, children }: { title: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className={`bg-white border border-outline-variant rounded-xl p-5 card-shadow ${accent ? 'border-l-4 border-l-tertiary-fixed-dim' : ''}`}>
      <h3 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  )
}
