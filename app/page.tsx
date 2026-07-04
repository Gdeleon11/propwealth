'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Dashboard from '@/components/Dashboard'
import Properties from '@/components/Properties'
import Tenants from '@/components/Tenants'
import Providers from '@/components/Providers'
import Reports from '@/components/Reports'
import Settings from '@/components/Settings'
import Activity from '@/components/Activity'
import Calendar from '@/components/Calendar'

type Screen = 'dashboard' | 'calendar' | 'properties' | 'tenants' | 'providers' | 'payments' | 'reports' | 'settings' | 'activity'

const navItems: { id: Screen; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'properties', icon: 'domain', label: 'Propiedades' },
  { id: 'tenants', icon: 'group', label: 'Inquilinos' },
  { id: 'providers', icon: 'handyman', label: 'Proveedores' },
  { id: 'payments', icon: 'account_balance_wallet', label: 'Flujo' },
  { id: 'reports', icon: 'analytics', label: 'Reportes' },
  { id: 'settings', icon: 'settings', label: 'Ajustes' },
]

export default function Home() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const { data: session } = useSession()

  const user = session?.user
  const avatarUrl = user?.image || ''
  const displayName = user?.name || user?.email || 'Usuario'
  const initial = (displayName || 'U').charAt(0).toUpperCase()

  useEffect(() => {
    const setFromHash = () => {
      const next = window.location.hash.replace('#', '') as Screen
      if (next === 'activity' || navItems.some((item) => item.id === next)) setScreen(next)
    }
    setFromHash()
    window.addEventListener('hashchange', setFromHash)
    return () => window.removeEventListener('hashchange', setFromHash)
  }, [])

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <Dashboard onViewActivity={() => { setScreen('activity'); window.location.hash = 'activity' }} />
      case 'calendar':
        return <Calendar />
      case 'properties':
        return <Properties />
      case 'tenants':
        return <Tenants />
      case 'providers':
        return <Providers />
      case 'payments':
        return <Activity onBack={() => { setScreen('dashboard'); window.location.hash = 'dashboard' }} />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      case 'activity':
        return <Activity onBack={() => { setScreen('dashboard'); window.location.hash = 'dashboard' }} />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center bg-primary-container text-primary font-bold">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <span className="text-2xl font-bold text-primary">PropWealth</span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden sm:block text-sm text-on-surface-variant max-w-[160px] truncate">
                {displayName}
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              title="Cerrar sesión"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high text-primary"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-20 max-w-7xl mx-auto">
        {renderScreen()}
      </main>

      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-primary border-t border-outline-variant shadow-sm">
        {navItems.map((item) => {
          const isActive = screen === item.id
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all min-w-0 ${
                isActive ? 'text-secondary-fixed font-bold' : 'text-on-primary opacity-70 hover:opacity-100'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px] leading-none"
                style={{
                  fontFamily: '"Material Symbols Outlined"',
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold tracking-wide mt-0.5 leading-none whitespace-nowrap">{item.label}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}
