'use client'

import { useEffect, useState } from 'react'
import Dashboard from '@/components/Dashboard'
import Properties from '@/components/Properties'
import Reports from '@/components/Reports'
import Settings from '@/components/Settings'
import Activity from '@/components/Activity'
import Calendar from '@/components/Calendar'

type Screen = 'dashboard' | 'calendar' | 'properties' | 'payments' | 'reports' | 'settings' | 'activity'

const navItems: { id: Screen; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', icon: 'calendar_month', label: 'Calendario' },
  { id: 'properties', icon: 'domain', label: 'Propiedades' },
  { id: 'payments', icon: 'payments', label: 'Pagos' },
  { id: 'reports', icon: 'analytics', label: 'Reportes' },
  { id: 'settings', icon: 'settings', label: 'Ajustes' },
]

export default function Home() {
  const [screen, setScreen] = useState<Screen>('dashboard')

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
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVBGi0X1dH9qvZS8AqkFZalRpMDg5Zdm_z34dLrEIZ4mGMs5SOM8EMEJlcmTP0BiJbIUD4rBgH2DbRhy-v1Y1tabOY-LThrvWKu52m0tFXKo2RJIvB3V3jFe2RwygIny88L1qBeQ8_Nr1QokRghP2K3kezEkO_UQIU0y5CXVJQIqvO5Dkzn-6jMTmn23U70widlG51yC-wrkLp_S-aVMNCq8FodcoKfUh78dw8RKJlaeLwexU0-gZyKg"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl font-bold text-primary">PropWealth</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high text-primary relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
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
