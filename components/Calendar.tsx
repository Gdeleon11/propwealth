'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Property, Tenant } from '@/lib/db'

type CalendarEvent = {
  id: string
  date: string
  type: 'rent' | 'maintenance' | 'service' | 'contract'
  title: string
  detail: string
  status: 'pending' | 'urgent' | 'done'
}

const TYPE_META = {
  rent: { label: 'Renta', icon: 'payments', color: 'bg-secondary-container text-secondary' },
  maintenance: { label: 'Mantenimiento', icon: 'build', color: 'bg-tertiary-fixed text-on-tertiary-container' },
  service: { label: 'Servicios', icon: 'bolt', color: 'bg-primary-fixed text-primary' },
  contract: { label: 'Contratos', icon: 'description', color: 'bg-error-container text-error' },
}

function dayKey(date: Date) {
  return date.toISOString().split('T')[0]
}

function fmtDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Calendar() {
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [filter, setFilter] = useState<'all' | CalendarEvent['type']>('all')
  const [monthOffset, setMonthOffset] = useState(0)
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([])
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/properties').then((res) => res.json()),
      fetch('/api/tenants').then((res) => res.json()),
    ])
      .then(([propertyRows, tenantRows]) => {
        setProperties(Array.isArray(propertyRows) ? propertyRows : [])
        setTenants(Array.isArray(tenantRows) ? tenantRows : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const baseMonth = useMemo(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + monthOffset)
    return date
  }, [monthOffset])

  const events = useMemo<CalendarEvent[]>(() => {
    const generated: CalendarEvent[] = []
    tenants.forEach((tenant, index) => {
      const rentDate = new Date()
      rentDate.setDate(Math.min(28, 5 + index * 3))
      generated.push({
        id: `rent-${tenant.id}`,
        date: dayKey(rentDate),
        type: 'rent',
        title: `Renta - ${tenant.full_name}`,
        detail: tenant.property_name || tenant.property_address || 'Propiedad sin asignar',
        status: tenant.payment_status === 'paid' ? 'done' : tenant.payment_status === 'overdue' ? 'urgent' : 'pending',
      })
      generated.push({
        id: `contract-${tenant.id}`,
        date: tenant.contract_end,
        type: 'contract',
        title: `Fin de contrato - ${tenant.full_name}`,
        detail: tenant.property_name || 'Contrato activo',
        status: new Date(tenant.contract_end) < new Date() ? 'urgent' : 'pending',
      })
    })
    properties.slice(0, 4).forEach((property, index) => {
      const serviceDate = new Date()
      serviceDate.setDate(12 + index * 4)
      generated.push({
        id: `maintenance-${property.id}`,
        date: dayKey(serviceDate),
        type: index % 2 === 0 ? 'maintenance' : 'service',
        title: index % 2 === 0 ? 'Mantenimiento preventivo' : 'Pago de servicios',
        detail: property.name,
        status: property.status === 'maintenance' ? 'urgent' : 'pending',
      })
    })
    return [...generated, ...customEvents].sort((a, b) => a.date.localeCompare(b.date))
  }, [customEvents, properties, tenants])

  const visibleEvents = events.filter((event) => filter === 'all' || event.type === filter)
  const monthStart = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), 1)
  const startOffset = monthStart.getDay()
  const daysInMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, index) => index < startOffset ? null : index - startOffset + 1)

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    setCustomEvents((current) => [{ ...event, id: `manual-${Date.now()}` }, ...current])
    setShowAdd(false)
  }

  return (
    <div className="px-6 py-4 space-y-4">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-[32px] font-semibold leading-tight text-primary">Calendario de Vencimientos</h2>
          <p className="text-base text-on-surface-variant">Pagos, contratos, servicios y mantenimiento conectados a tu portafolio.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-surface-container rounded-xl">
            <button onClick={() => setView('calendar')} className={`px-5 py-2 rounded-lg text-[11px] font-bold tracking-wider ${view === 'calendar' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>CALENDARIO</button>
            <button onClick={() => setView('list')} className={`px-5 py-2 rounded-lg text-[11px] font-bold tracking-wider ${view === 'list' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>LISTA</button>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-5 py-3 bg-primary text-white rounded-xl text-[11px] font-bold tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px]">add</span>
            AGREGAR
          </button>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {(['all', 'rent', 'maintenance', 'service', 'contract'] as const).map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2 rounded-full border text-[11px] font-bold tracking-wider whitespace-nowrap ${filter === item ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant text-on-surface-variant'}`}>
            {item === 'all' ? 'Todos' : TYPE_META[item].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-80 bg-white border border-outline-variant rounded-xl animate-pulse" />
      ) : view === 'calendar' ? (
        <section className="bg-white border border-outline-variant rounded-xl card-shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-primary capitalize">{baseMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-2">
              <button onClick={() => setMonthOffset((value) => value - 1)} className="w-9 h-9 border border-outline-variant rounded-lg flex items-center justify-center"><span className="material-symbols-outlined">chevron_left</span></button>
              <button onClick={() => setMonthOffset((value) => value + 1)} className="w-9 h-9 border border-outline-variant rounded-lg flex items-center justify-center"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold tracking-widest text-outline uppercase mb-2">
            {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((day, index) => {
              const date = day ? dayKey(new Date(baseMonth.getFullYear(), baseMonth.getMonth(), day)) : ''
              const dayEvents = visibleEvents.filter((event) => event.date === date)
              return (
                <div key={index} className={`min-h-28 border rounded-lg p-2 ${day ? 'bg-surface-container-lowest border-outline-variant' : 'bg-surface-container-low border-transparent'}`}>
                  {day && <span className="text-xs font-bold text-primary">{day}</span>}
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className={`truncate rounded px-2 py-1 text-[10px] font-bold ${TYPE_META[event.type].color}`}>{event.title}</div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-[10px] text-outline">+{dayEvents.length - 2} más</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <EventList events={visibleEvents} />
      )}

      <EventList events={visibleEvents.slice(0, 5)} compact />
      {showAdd && <AddCalendarEvent onClose={() => setShowAdd(false)} onSave={addEvent} />}
    </div>
  )
}

function EventList({ events, compact = false }: { events: CalendarEvent[]; compact?: boolean }) {
  return (
    <section className="bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden">
      <div className="p-4 border-b border-outline-variant bg-surface-container-low">
        <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">{compact ? 'PROXIMOS VENCIMIENTOS' : 'LISTA DE EVENTOS'}</h3>
      </div>
      <div className="divide-y divide-outline-variant">
        {events.length === 0 ? (
          <p className="p-6 text-center text-sm text-on-surface-variant">Sin eventos para este filtro</p>
        ) : events.map((event) => (
          <div key={event.id} className="p-4 flex items-center justify-between gap-4 hover:bg-surface-container-low">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_META[event.type].color}`}>
                <span className="material-symbols-outlined text-[18px]">{TYPE_META[event.type].icon}</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-primary truncate">{event.title}</p>
                <p className="text-sm text-on-surface-variant truncate">{event.detail}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-primary">{fmtDate(event.date)}</p>
              <span className={`pill-status ${event.status === 'urgent' ? 'bg-error-container text-error' : event.status === 'done' ? 'bg-secondary-container text-secondary' : 'bg-surface-container-high text-on-surface-variant'}`}>{event.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AddCalendarEvent({ onClose, onSave }: { onClose: () => void; onSave: (event: Omit<CalendarEvent, 'id'>) => void }) {
  const [form, setForm] = useState({ title: '', detail: '', date: dayKey(new Date()), type: 'maintenance' as CalendarEvent['type'], status: 'pending' as CalendarEvent['status'] })
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="text-2xl font-bold text-primary">Agregar Evento</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-6 space-y-4">
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary" placeholder="Titulo del evento" />
          <input value={form.detail} onChange={(e) => set('detail', e.target.value)} className="w-full border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary" placeholder="Detalle o propiedad" />
          <div className="grid grid-cols-3 gap-3">
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="border border-outline-variant rounded-lg px-3 py-3 outline-none focus:border-primary" />
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className="border border-outline-variant rounded-lg px-3 py-3 bg-white outline-none focus:border-primary">
              <option value="maintenance">Mantenimiento</option>
              <option value="rent">Renta</option>
              <option value="service">Servicios</option>
              <option value="contract">Contrato</option>
            </select>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className="border border-outline-variant rounded-lg px-3 py-3 bg-white outline-none focus:border-primary">
              <option value="pending">Pendiente</option>
              <option value="urgent">Urgente</option>
              <option value="done">Listo</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 py-3 border border-outline text-primary rounded-lg font-bold text-[11px] tracking-wider hover:bg-surface-container-low">CANCELAR</button>
          <button onClick={() => form.title && onSave(form)} className="flex-[2] py-3 bg-primary text-white rounded-lg font-bold text-[11px] tracking-wider">GUARDAR EVENTO</button>
        </div>
      </div>
    </div>
  )
}
