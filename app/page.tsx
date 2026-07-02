'use client'

import { useState, useEffect, useCallback } from 'react'
import Dashboard from '@/components/Dashboard'
import Properties from '@/components/Properties'
import Tenants from '@/components/Tenants'
import Reports from '@/components/Reports'
import Settings from '@/components/Settings'
import Providers from '@/components/Providers'

type Screen = 'dashboard' | 'properties' | 'payments' | 'reports' | 'settings'

export default function Home() {
  const [screen, setScreen] = useState<Screen>('dashboard')

  const navItems: { id: Screen; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'properties', icon: 'domain', label: 'Propiedades' },
    { id: 'payments', icon: 'payments', label: 'Pagos' },
    { id: 'reports', icon: 'analytics', label: 'Reportes' },
    { id: 'settings', icon: 'settings', label: 'Ajustes' },
  ]

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <Dashboard />
      case 'properties': return <Properties />
      case 'payments': return <Tenants />
      case 'reports': return <Reports />
      case 'settings': return <Settings />
      default: return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top App Bar */}
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

      {/* Main Content */}
      <main className="pt-16 pb-20 max-w-7xl mx-auto">
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-primary border-t border-outline-variant shadow-sm">
        {navItems.map((item) => {
          const isActive = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
                isActive
                  ? 'text-secondary-fixed font-bold'
                  : 'text-on-primary opacity-70 hover:opacity-100'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold tracking-wide mt-0.5">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
