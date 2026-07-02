'use client'

import { useState, useEffect } from 'react'
import type { Provider } from '@/lib/supabase'

const PLACEHOLDER_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBzVvkYigU0AYyYm65nbljTG3G8dAyNcbdyiBagjvY08qtk9xhy8A6WEXwEZ9iakwpFgcV4et6hDXkV2oA__KMEPm_5jEdAwrfbgXoi69GRKbozRwLbNSeYUmCiVXmGVhL5so-aGSZ0QmZ_u2kI6Q1KK1VHI4ew3obLvdLkkmC2v6RnOpeXitMbYWo5DIplMYsQhnwgi3wxfGhtY9Na50c85e7rYj9icHNvQRNXLF7CB6jPK8ijz27xHA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAorYAURssVQyBu8BdySENu967swSGNhe5quh-JeHeZcYeN_GkI5rGdQtY0QdF7s4i6kqfEruLonySZ-0l-LrCXx1mKNrz1niWfwXGhx9cgHqWUfI0dORBWQW3KKI3pV4PI4o2aeArFabjENlMydRL067PDJY3ZtRmUYOYr3hhaPrc3RN3U6qwLoTYrdbesbIcpnriap2vr7UzqrvwOUzAnVsuZZ1TzS2x9KINI19gx0tZMQ0UydQBshg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCV2MwUoK9U6AEieKm0CygIq8I9Kum1P6Biu_77aaYDDT9NShegt5d91w2MOlZOIu6zPROLQKdN-JZdWtn-A5uZpdOtXVsTcGVjm4PoLrsp20j_u_V7Py4LpP9iMX-LGKDU8Pat8OrXfJFydUZ8TunXooqOKAt_u2prE9y4DzkQcPM4GUffO7d0lfDwEUymrgvyUfzKRwM18sfFuo-OzV8vmMlYFS9G1Dxodq2aYEXNLgo9AwTypBXlsw',
]

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/providers')
      .then(r => r.json())
      .then(d => { setProviders(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-6 py-4">
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
        <input
          className="w-full h-12 pl-12 pr-4 bg-white border border-outline-variant rounded-lg outline-none focus:border-primary text-base"
          placeholder="Buscar proveedores..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white border border-outline-variant rounded-xl animate-pulse"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-[64px] text-outline-variant">handyman</span>
          <p className="text-on-surface-variant mt-4 font-semibold">No hay proveedores registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((p, idx) => (
            <div key={p.id} className="bg-white border border-outline-variant rounded-xl p-4 card-shadow flex flex-col gap-3 hover:border-primary transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                    <img src={p.avatar_url || PLACEHOLDER_AVATARS[idx % PLACEHOLDER_AVATARS.length]} alt={p.name} className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-sm leading-tight">{p.name}</h3>
                    <span className="text-[10px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded tracking-wider">{p.category.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-sm font-bold">{p.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">apartment</span>
                <span className="text-sm">{p.properties_count} Propiedades</span>
              </div>
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 h-10 border border-outline-variant rounded-lg flex items-center justify-center gap-2 text-primary text-[11px] font-bold tracking-wider hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-lg">call</span>Llamar
                </button>
                <button className="flex-1 h-10 bg-primary text-white rounded-lg flex items-center justify-center text-[11px] font-bold tracking-wider hover:opacity-90">
                  Ver Perfil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
