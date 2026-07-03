'use client'

import { useState } from 'react'
import type { Property } from '@/lib/db'

type Props = {
  property: Property
  imageUrl: string
  onBack: () => void
  onSaved: (property: Property) => void
}

const tabs = ['Resumen', 'Finanzas', 'Mantenimiento', 'Documentos']

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export default function PropertyDetail({ property, imageUrl, onBack, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState('Resumen')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    ...property,
    monthly_rent: String(property.monthly_rent),
    purchase_value: String(property.purchase_value),
    security_deposit: String(property.security_deposit),
    roi_pct: String(property.roi_pct),
    cash_flow: String(property.cash_flow),
    occupancy_pct: String(property.occupancy_pct),
  })

  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const save = async () => {
    setSaving(true)
    const payload = {
      ...form,
      monthly_rent: Number(form.monthly_rent) || 0,
      purchase_value: Number(form.purchase_value) || 0,
      security_deposit: Number(form.security_deposit) || 0,
      roi_pct: Number(form.roi_pct) || 0,
      cash_flow: Number(form.cash_flow) || 0,
      occupancy_pct: Number(form.occupancy_pct) || 0,
    }
    const res = await fetch('/api/properties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (res.ok) {
      onSaved(data)
      setEditing(false)
    }
    setSaving(false)
  }

  const displayed = {
    ...property,
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
  }

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-primary" title="Volver">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-[28px] font-bold text-primary leading-tight">{displayed.name}</h2>
            <p className="text-sm text-on-surface-variant">{displayed.type} · {displayed.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-wider border ${activeTab === tab ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant text-on-surface-variant'}`}
            >
              {tab}
            </button>
          ))}
          <button onClick={() => setEditing((value) => !value)} className="px-4 py-2 rounded-lg bg-secondary text-white text-[11px] font-bold tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">{editing ? 'close' : 'edit'}</span>
            {editing ? 'CANCELAR' : 'EDITAR'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-auto md:h-[320px]">
            <div className="md:col-span-2 relative overflow-hidden rounded-xl border border-outline-variant min-h-[260px]">
              <img src={imageUrl} alt={displayed.name} className="w-full h-full object-cover" />
              <span className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">RENTADA</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbQra04Nwc4df0SeIWQUKKsC3TCyqvtdPV38h8EF4FyM2oX4EADN4FNx0ZrxGA4b7m5peMJwxkLm6HJFhNcmE-qjDc1Ayg5zZc4EAwphNN2cTt0471aQtDopef3WWwHOxHJ3C0TvaP4Je-Ip3v1O_tt3-JDIWx_On9inzzRWniDWAqNeExyyeACL-2qk7_60FuIh6oAvwIYTQ_3A1DxAYFmQzB175_bF8f2RquxBvmd3J3ZSpGiu6Ekg" alt="Interior" className="rounded-xl border border-outline-variant h-32 md:h-full w-full object-cover" />
              <div className="relative rounded-xl overflow-hidden border border-outline-variant">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuANGh1A3N52AFgxtakTAMuipLEnt_Dc8sFfGG1xdnnQuzDkKhGW-hL3PC20u9xm7-NK-RS2dJaw3V-Z6PRSzANXH6_0IKw_xzD9Lc32LWg-MSflD3Jmh8AVkBa99aJDdZLNawoaGNwe_DbyYchwZj5GLYN5LotSeZl4Xxa8LBBADnAOSkFETwbckFkVh6VDrhYAGUT9pdurAAXz4lB9Ko0TT24xkN0QDboKD8cquZEyBjydUpfOniHx1A" alt="Habitacion" className="h-32 md:h-full w-full object-cover" />
                <span className="absolute bottom-3 right-3 bg-black/65 text-white px-3 py-1 rounded-full text-[10px] font-bold">+12 Fotos</span>
              </div>
            </div>
          </div>

          {editing && (
            <div className="bg-white border border-outline-variant rounded-xl p-5 card-shadow grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="md:col-span-2 text-[11px] font-bold tracking-wider text-outline uppercase">Nombre
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2 text-base text-primary outline-none focus:border-primary" />
              </label>
              <label className="text-[11px] font-bold tracking-wider text-outline uppercase">Estado
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2 text-base text-primary outline-none focus:border-primary bg-white">
                  <option value="rented">Rentada</option>
                  <option value="available">Disponible</option>
                  <option value="maintenance">Mantenimiento</option>
                </select>
              </label>
              <label className="md:col-span-3 text-[11px] font-bold tracking-wider text-outline uppercase">Direccion
                <input value={form.address} onChange={(e) => set('address', e.target.value)} className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2 text-base text-primary outline-none focus:border-primary" />
              </label>
              {[
                ['monthly_rent', 'Renta mensual'],
                ['purchase_value', 'Precio / valor'],
                ['security_deposit', 'Deposito'],
                ['roi_pct', 'ROI %'],
                ['cash_flow', 'Flujo de caja'],
                ['occupancy_pct', 'Ocupacion %'],
              ].map(([key, label]) => (
                <label key={key} className="text-[11px] font-bold tracking-wider text-outline uppercase">{label}
                  <input type="number" value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2 text-base text-primary outline-none focus:border-primary" />
                </label>
              ))}
              <div className="md:col-span-3 flex justify-end">
                <button onClick={save} disabled={saving} className="px-5 py-3 bg-primary text-white rounded-lg text-[11px] font-bold tracking-wider disabled:opacity-60">
                  {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Metric label="RENTA MENSUAL" value={money(displayed.monthly_rent)} />
            <Metric label="ROI ANUAL" value={`${displayed.roi_pct}%`} sub="+ 0.4% vs mes anterior" tone="green" />
            <Metric label="FLUJO DE CAJA" value={money(displayed.cash_flow)} sub="NETO DESPUES DE GASTOS" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-outline-variant rounded-xl p-5 card-shadow">
              <h3 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[17px]">location_on</span> Ubicacion
              </h3>
              <p className="text-sm text-primary mb-4">{displayed.address}</p>
              <div className="h-44 rounded-lg bg-[linear-gradient(135deg,#dfe7ee,#f5f7f9)] border border-outline-variant relative overflow-hidden">
                <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(#cbd5df 1px, transparent 1px), linear-gradient(90deg, #cbd5df 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-primary">
                  <span className="material-symbols-outlined text-[34px]">location_on</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-outline-variant rounded-xl p-5 card-shadow">
              <h3 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[17px]">bolt</span> Servicios incluidos
              </h3>
              {['Agua Potable', 'Luz Electrica', 'Internet Fibra'].map((service) => (
                <div key={service} className="flex items-center justify-between py-3 border-b border-surface-variant last:border-0">
                  <span className="flex items-center gap-2 text-sm text-primary"><span className="material-symbols-outlined text-[17px]">radio_button_checked</span>{service}</span>
                  <span className="pill-status bg-secondary-container text-secondary">ACTIVO</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <Panel title="INFORMACION DEL INQUILINO">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">AS</div>
              <div>
                <p className="font-bold text-primary">Alexander Sterling</p>
                <p className="text-xs text-on-surface-variant">Consultor Senior</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Contrato desde" value="15 Ene, 2023" />
              <Row label="Expiracion" value="14 Ene, 2025" />
            </div>
            <button className="mt-4 w-full py-3 bg-primary text-white rounded text-[11px] font-bold tracking-wider flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">mail</span> CONTACTAR
            </button>
          </Panel>

          <Panel title="PROXIMO MANTENIMIENTO" accent>
            <div className="bg-surface-container-low p-4 rounded-lg">
              <p className="font-bold text-primary">Revision de A/C</p>
              <p className="text-sm text-on-surface-variant mt-1">Programada para: 22 Oct, 2023</p>
            </div>
            <button className="mt-3 text-primary text-[11px] font-bold tracking-wider">REPROGRAMAR &gt;</button>
          </Panel>

          <Panel title="DOCUMENTOS">
            {['Contrato_Arrendamiento.pdf', 'Seguro_Propiedad_2023.pdf', 'Reglamento_Copropiedad.docx'].map((document) => (
              <div key={document} className="flex items-center justify-between py-3 border-b border-surface-variant last:border-0">
                <span className="flex items-center gap-2 text-sm text-primary truncate">
                  <span className="material-symbols-outlined text-error text-[17px]">description</span>{document}
                </span>
                <button className="text-outline hover:text-primary"><span className="material-symbols-outlined text-[17px]">download</span></button>
              </div>
            ))}
            <button className="mt-3 w-full py-3 border border-dashed border-outline-variant rounded-lg text-[11px] font-bold tracking-wider text-on-surface-variant hover:border-primary hover:text-primary">+ SUBIR NUEVO DOCUMENTO</button>
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
