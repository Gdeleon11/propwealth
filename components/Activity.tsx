'use client'

import { useMemo, useState, useEffect } from 'react'
import AddTransactionModal from './AddTransactionModal'

type ActivityItem = {
  id: string
  category: 'payments' | 'maintenance' | 'contracts' | 'alerts'
  title: string
  detail: string
  meta: string
  icon: string
  tone: 'success' | 'warning' | 'neutral' | 'danger'
  amount?: string
  status?: string
  group?: 'HOY' | 'AYER' | 'ESTA SEMANA'
}

// Transform database transactions into activity items
function getActivityFromTransactions(transactions: any[]): ActivityItem[] {
  return transactions.map(t => ({
    id: t.id,
    category: t.type === 'income' ? 'payments' : 'maintenance',
    title: t.type === 'income' ? 'Pago Recibido' : 'Gasto',
    detail: t.entity,
    meta: new Date(t.created_at).toLocaleString('es'),
    icon: t.type === 'income' ? 'check_circle' : 'remove',
    tone: t.status === 'processed' ? 'success' : t.type === 'income' ? 'success' : 'warning',
    amount: `${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}`,
  }))
}

const activity: ActivityItem[] = []

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'payments', label: 'Pagos' },
  { id: 'maintenance', label: 'Mantenimiento' },
  { id: 'contracts', label: 'Contratos' },
  { id: 'alerts', label: 'Alertas' },
] as const

const toneClasses = {
  success: 'bg-secondary-container text-secondary',
  warning: 'bg-tertiary-fixed text-on-tertiary-container',
  neutral: 'bg-surface-container-high text-primary',
  danger: 'bg-error-container text-error',
}

const borderClasses = {
  success: 'border-l-secondary',
  warning: 'border-l-tertiary-container',
  neutral: 'border-l-transparent',
  danger: 'border-l-error',
}

type Props = {
  onBack: () => void
}

export default function Activity({ onBack }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all')
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const loadTransactions = () => {
    fetch('/api/transactions')
      .then(r => r.json())
      .then(data => {
        const items = getActivityFromTransactions(Array.isArray(data) ? data : [])
        setActivities(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return activities.filter((item) => {
      const matchesFilter = filter === 'all' || item.category === filter
      const matchesQuery = !normalized || `${item.title} ${item.detail}`.toLowerCase().includes(normalized)
      return matchesFilter && matchesQuery
    })
  }, [filter, query, activities])

  const groups = ['HOY', 'AYER', 'ESTA SEMANA'] as const

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full hover:bg-surface-container-high flex items-center justify-center text-primary" title="Volver">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-[32px] font-bold leading-tight text-primary">Actividad Reciente</h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-surface-container-high rounded-lg text-[11px] font-bold tracking-wider">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Exportar
        </button>
      </div>

      <div className="relative mb-5">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
        <input
          className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-lg outline-none focus:border-primary text-base"
          placeholder="Buscar pagos, reparaciones o contratos..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 mb-6">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`px-6 py-2 rounded-lg border text-[11px] font-bold tracking-wider whitespace-nowrap ${
              filter === item.id ? 'bg-primary text-white border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {groups.map((group) => {
          const items = filtered.filter((item) => item.group === group)
          if (items.length === 0) return null
          return (
            <section key={group}>
              <h3 className="text-[11px] font-bold tracking-widest text-outline uppercase mb-3">{group}</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className={`bg-white border border-outline-variant border-l-4 ${borderClasses[item.tone]} rounded-lg p-4 card-shadow flex items-center justify-between gap-4`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${toneClasses[item.tone]}`}>
                        <span className="material-symbols-outlined text-[21px]">{item.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-base truncate ${item.tone === 'danger' ? 'text-error' : 'text-primary'}`}>{item.title}</p>
                        <p className="text-sm text-on-surface-variant truncate">{item.detail}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {item.amount && <p className={`text-sm font-bold ${item.tone === 'danger' ? 'text-error' : 'text-secondary'}`}>{item.amount}</p>}
                      {item.status && <span className={`pill-status ${item.tone === 'warning' ? 'bg-secondary-container text-secondary' : 'bg-surface-container-high text-on-surface-variant'}`}>{item.status}</span>}
                      <p className="text-[11px] text-outline mt-1">{item.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <button
        onClick={() => setShowAdd(true)}
        title="Registrar movimiento"
        className="fixed right-6 bottom-24 w-14 h-14 bg-secondary text-white rounded-xl shadow-lg flex items-center justify-center hover:brightness-95"
      >
        <span className="material-symbols-outlined">add</span>
      </button>

      {showAdd && (
        <AddTransactionModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); setLoading(true); loadTransactions() }}
        />
      )}
    </div>
  )
}
