'use client'

import { useState, useEffect } from 'react'
import type { Property } from '@/lib/db'
import { formatMoney } from '@/lib/format'
import AddPropertyModal from './AddPropertyModal'
import PropertyDetail from './PropertyDetail'

const STATUS_LABELS: Record<string, string> = {
  rented: 'Rentado',
  available: 'Disponible',
  maintenance: 'Mantenimiento',
}
const STATUS_COLORS: Record<string, string> = {
  rented: 'bg-secondary-container text-on-secondary-container',
  available: 'bg-primary-fixed text-on-primary-fixed-variant',
  maintenance: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
}

const PLACEHOLDER_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAN1BgAK_yAFFe0r4r2sZSjB--p1ZFWrf3OJcy23n7gqi-fxHG4vGB6vZTE1IvFaSM1RTyWmjdD31ZL5jS6gzOGLt72Ph0zHw_W_mEVZw3NPMntF736WpOmR9Nj50jGTMOxBEhELt2nYuiV5pi2QhNlJgBcyunU0ZEkPUgceVhW_IVmX4c9aAkgIL35ntmb_BTGEqO00KKjxNOMcPCLkH37hfUT_bg0nTIQg-IiALeLCVTWfrL7UKFspw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuANGh1A3N52AFgxtakTAMuipLEnt_Dc8sFfGG1xdnnQuzDkKhGW-hL3PC20u9xm7-NK-RS2dJaw3V-Z6PRSzANXH6_0IKw_xzD9Lc32LWg-MSflD3Jmh8AVkBa99aJDdZLNawoaGNwe_DbyYchwZj5GLYN5LotSeZl4Xxa8LBBADnAOSkFETwbckFkVh6VDrhYAGUT9pdurAAXz4lB9Ko0TT24xkN0QDboKD8cquZEyBjydUpfOniHx1A',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDbQra04Nwc4df0SeIWQUKKsC3TCyqvtdPV38h8EF4FyM2oX4EADN4FNx0ZrxGA4b7m5peMJwxkLm6HJFhNcmE-qjDc1Ayg5zZc4EAwphNN2cTt0471aQtDopef3WWwHOxHJ3C0TvaP4Je-Ip3v1O_tt3-JDIWx_On9inzzRWniDWAqNeExyyeACL-2qk7_60FuIh6oAvwIYTQ_3A1DxAYFmQzB175_bF8f2RquxBvmd3J3ZSpGiu6Ekg',
]

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<{ property: Property; imageUrl: string } | null>(null)

  const load = (f = 'all') => {
    setLoading(true)
    fetch(`/api/properties?status=${f}`)
      .then(r => r.json())
      .then(d => { setProperties(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  )

  const remove = async (id: string) => {
    if (!window.confirm('Eliminar esta propiedad?')) return
    setDeletingId(id)
    const res = await fetch(`/api/properties?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (res.ok) setProperties(current => current.filter(p => p.id !== id))
    setDeletingId(null)
  }

  if (selectedProperty) {
    return (
      <PropertyDetail
        property={selectedProperty.property}
        imageUrl={selectedProperty.imageUrl}
        onBack={() => setSelectedProperty(null)}
        onSaved={(updated) => {
          setProperties(current => current.map(property => property.id === updated.id ? updated : property))
          setSelectedProperty({ property: updated, imageUrl: selectedProperty.imageUrl })
        }}
      />
    )
  }

  return (
    <div className="px-6 py-4">
      {/* Search + filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow border border-outline-variant rounded-xl bg-white overflow-hidden">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full py-3 pl-12 pr-4 border-none focus:ring-0 text-base bg-transparent outline-none"
            placeholder="Buscar propiedad o dirección..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 font-semibold text-[11px] tracking-wider"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          AGREGAR
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-4">
        {[['all','Todos'],['rented','Rentados'],['available','Disponibles'],['maintenance','Mantenimiento']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setFilter(val); load(val) }}
            className={`px-5 py-2 rounded-full font-semibold text-[11px] tracking-wider whitespace-nowrap transition-all ${
              filter === val ? 'bg-primary text-white' : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-outline-variant rounded-xl overflow-hidden animate-pulse">
              <div className="h-52 bg-surface-container-high"/>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-surface-container-high rounded w-3/4"/>
                <div className="h-3 bg-surface-container-high rounded w-1/2"/>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[64px] text-outline-variant">domain_disabled</span>
          <p className="text-on-surface-variant mt-4 font-semibold">No se encontraron propiedades</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 px-6 py-3 bg-primary text-white rounded-xl text-[11px] font-bold tracking-wider">
            AGREGAR PRIMERA PROPIEDAD
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => setSelectedProperty({ property: p, imageUrl: p.image_url || PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length] })}
              className="bg-white border border-outline-variant rounded-xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="h-52 relative overflow-hidden">
                <img
                  src={p.image_url || PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${STATUS_COLORS[p.status] || 'bg-surface-container text-on-surface-variant'}`}>
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </div>
                <button
                  onClick={(event) => { event.stopPropagation(); remove(p.id) }}
                  disabled={deletingId === p.id}
                  className="absolute top-3 left-3 w-9 h-9 bg-white/95 text-error rounded-full flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                  title="Eliminar propiedad"
                >
                  <span className="material-symbols-outlined text-[18px]">{deletingId === p.id ? 'hourglass_top' : 'delete'}</span>
                </button>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-primary leading-tight">{p.name}</h3>
                  <div className="text-right ml-2 flex-shrink-0">
                    <span className="block text-[11px] font-semibold tracking-wider text-outline uppercase">Renta Mensual</span>
                    <span className="block text-[26px] font-bold leading-tight text-primary">
                      {formatMoney(Number(p.monthly_rent || 0))}
                    </span>
                  </div>
                </div>
                <p className="text-base text-on-surface-variant mb-4">{p.address}</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant">
                  <div>
                    <span className="block text-[11px] font-semibold tracking-wider text-outline uppercase mb-1">Ocupación</span>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full" style={{ width: `${p.occupancy_pct}%` }}/>
                      </div>
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">{p.occupancy_pct}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="block text-[11px] font-semibold tracking-wider text-outline uppercase mb-1">ROI</span>
                      <span className="text-sm font-bold text-secondary">{p.roi_pct}%</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] font-semibold tracking-wider text-outline uppercase mb-1">Flujo</span>
                      <span className="text-sm font-bold text-primary">{formatMoney(Number(p.cash_flow || 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {showAdd && <AddPropertyModal onClose={() => setShowAdd(false)} onSaved={(property) => { setShowAdd(false); setProperties(current => [property, ...current]) }} />}
    </div>
  )
}
