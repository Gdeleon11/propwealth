'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  preferred_language: string
  currency: string
  timezone: string
}

interface EditModalProps {
  isOpen: boolean
  title: string
  field: 'name' | 'language' | 'currency' | 'timezone'
  currentValue: string | null
  options?: { value: string; label: string }[]
  onSave: (value: string) => Promise<void>
  onClose: () => void
}

function EditModal({ isOpen, title, field, currentValue, options, onSave, onClose }: EditModalProps) {
  const [value, setValue] = useState(currentValue || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setValue(currentValue || '')
  }, [currentValue, isOpen])

  const handleSave = async () => {
    if (!value.trim()) {
      setError('Este campo no puede estar vacío')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSave(value)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-primary mb-4">{title}</h3>

        {options ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-2 border border-outline rounded-lg mb-4 text-base"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-2 border border-outline rounded-lg mb-4 text-base"
            placeholder={`Ingresa ${title.toLowerCase()}`}
          />
        )}

        {error && <p className="text-error text-sm mb-4">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-outline text-primary rounded-lg text-sm font-bold hover:bg-surface-container-low disabled:opacity-50"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'GUARDANDO...' : 'GUARDAR'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { data: session, update: updateSession } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<{
    isOpen: boolean
    field: 'name' | 'language' | 'currency' | 'timezone' | null
  }>({ isOpen: false, field: null })

  useEffect(() => {
    fetchProfile()
  }, [session])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/user/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      setProfile(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveField = async (field: string, value: string) => {
    try {
      const payload: any = {}
      if (field === 'name') payload.name = value
      if (field === 'language') payload.preferred_language = value
      if (field === 'currency') payload.currency = value
      if (field === 'timezone') payload.timezone = value

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to update profile')
      const updated = await res.json()
      setProfile(updated)
      await updateSession()
    } catch (err: any) {
      throw new Error(err.message || 'Error al guardar')
    }
  }

  const openModal = (field: 'name' | 'language' | 'currency' | 'timezone') => {
    setModal({ isOpen: true, field })
  }

  const closeModal = () => {
    setModal({ isOpen: false, field: null })
  }

  if (loading) {
    return (
      <div className="px-6 py-4 max-w-3xl mx-auto">
        <p className="text-center text-on-surface-variant">Cargando...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="px-6 py-4 max-w-3xl mx-auto">
        <p className="text-center text-error">{error || 'Error al cargar el perfil'}</p>
      </div>
    )
  }

  const languageOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ]

  const currencyOptions = [
    { value: 'USD', label: 'USD — Dólar Estadounidense' },
    { value: 'GTQ', label: 'GTQ — Quetzal Guatemalteco' },
    { value: 'MXN', label: 'MXN — Peso Mexicano' },
    { value: 'EUR', label: 'EUR — Euro' },
    { value: 'GBP', label: 'GBP — Libra Esterlina' },
    { value: 'CAD', label: 'CAD — Dólar Canadiense' },
    { value: 'COP', label: 'COP — Peso Colombiano' },
    { value: 'CRC', label: 'CRC — Colón Costarricense' },
    { value: 'HNL', label: 'HNL — Lempira Hondureño' },
    { value: 'NIO', label: 'NIO — Córdoba Nicaragüense' },
    { value: 'PAB', label: 'PAB — Balboa Panameño' },
    { value: 'DOP', label: 'DOP — Peso Dominicano' },
    { value: 'ARS', label: 'ARS — Peso Argentino' },
    { value: 'CLP', label: 'CLP — Peso Chileno' },
    { value: 'PEN', label: 'PEN — Sol Peruano' },
    { value: 'BRL', label: 'BRL — Real Brasileño' },
    { value: 'BOB', label: 'BOB — Boliviano' },
    { value: 'UYU', label: 'UYU — Peso Uruguayo' },
    { value: 'PYG', label: 'PYG — Guaraní Paraguayo' },
    { value: 'VES', label: 'VES — Bolívar Venezolano' },
  ]

  const timezoneOptions = [
    { value: 'America/Mexico_City', label: 'UTC-5, Ciudad de México' },
    { value: 'America/New_York', label: 'UTC-4, New York' },
    { value: 'America/Los_Angeles', label: 'UTC-7, Los Angeles' },
    { value: 'Europe/London', label: 'UTC+0, Londres' },
    { value: 'Europe/Madrid', label: 'UTC+1, Madrid' },
  ]

  const getLanguageLabel = (code: string) => {
    return languageOptions.find((opt) => opt.value === code)?.label || code
  }

  const getCurrencyLabel = (code: string) => {
    return currencyOptions.find((opt) => opt.value === code)?.label || code
  }

  const getTimezoneLabel = (code: string) => {
    return timezoneOptions.find((opt) => opt.value === code)?.label || code
  }

  return (
    <div className="px-6 py-4 max-w-3xl mx-auto">
      <section className="mb-6">
        <h2 className="text-[32px] font-semibold text-primary mb-1">Configuración</h2>
        <p className="text-base text-on-surface-variant">Administra tu cuenta, notificaciones y preferencias.</p>
      </section>

      {/* Profile */}
      <div className="bg-white border border-outline-variant rounded-xl p-6 card-shadow mb-4 flex items-center gap-4">
        {profile.image && (
          <img
            src={profile.image}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-primary-container"
          />
        )}
        {!profile.image && (
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center border-2 border-primary-container">
            <span className="text-2xl font-bold text-primary">
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-primary">{profile.name || 'Usuario'}</h3>
          <p className="text-on-surface-variant">{profile.email}</p>
          <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block">
            USUARIO ACTIVO
          </span>
        </div>
        <button
          onClick={() => openModal('name')}
          className="px-4 py-2 border border-outline text-primary rounded-lg text-[11px] font-bold tracking-wider hover:bg-surface-container-low"
        >
          EDITAR
        </button>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <div className="bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">NOTIFICACIONES</h3>
          </div>
          <div className="divide-y divide-outline-variant">
            {[
              { label: 'Alertas de pago', desc: 'Recibe notificaciones de pagos vencidos', on: true },
              { label: 'Recordatorios de mantenimiento', desc: 'Alertas 7 días antes del servicio', on: true },
              { label: 'Reportes semanales', desc: 'Resumen financiero cada lunes', on: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-base text-primary">{item.label}</p>
                  <p className="text-sm text-on-surface-variant">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.on} className="sr-only peer"/>
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"/>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">PREFERENCIAS</h3>
          </div>
          <div className="divide-y divide-outline-variant">
            {[
              {
                label: 'Idioma',
                val: getLanguageLabel(profile.preferred_language),
                field: 'language' as const,
              },
              {
                label: 'Moneda',
                val: getCurrencyLabel(profile.currency),
                field: 'currency' as const,
              },
              {
                label: 'Zona horaria',
                val: getTimezoneLabel(profile.timezone),
                field: 'timezone' as const,
              },
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => openModal(item.field)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low"
              >
                <div>
                  <p className="font-semibold text-base text-primary">{item.label}</p>
                  <p className="text-sm text-on-surface-variant">{item.val}</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden mb-4">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">SEGURIDAD</h3>
          </div>
          <div className="divide-y divide-outline-variant">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low">
              <p className="font-semibold text-base text-primary">Cambiar contraseña</p>
              <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low">
              <div>
                <p className="font-semibold text-base text-primary">Autenticación de dos factores</p>
                <p className="text-sm text-on-surface-variant">Activa para mayor seguridad</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low">
              <p className="font-semibold text-base text-error">Cerrar sesión</p>
              <span className="material-symbols-outlined text-error">logout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditModal
        isOpen={modal.isOpen && modal.field === 'name'}
        title="Editar nombre"
        field="name"
        currentValue={profile.name}
        onSave={(value) => handleSaveField('name', value)}
        onClose={closeModal}
      />

      <EditModal
        isOpen={modal.isOpen && modal.field === 'language'}
        title="Seleccionar idioma"
        field="language"
        currentValue={profile.preferred_language}
        options={languageOptions}
        onSave={(value) => handleSaveField('language', value)}
        onClose={closeModal}
      />

      <EditModal
        isOpen={modal.isOpen && modal.field === 'currency'}
        title="Seleccionar moneda"
        field="currency"
        currentValue={profile.currency}
        options={currencyOptions}
        onSave={(value) => handleSaveField('currency', value)}
        onClose={closeModal}
      />

      <EditModal
        isOpen={modal.isOpen && modal.field === 'timezone'}
        title="Seleccionar zona horaria"
        field="timezone"
        currentValue={profile.timezone}
        options={timezoneOptions}
        onSave={(value) => handleSaveField('timezone', value)}
        onClose={closeModal}
      />
    </div>
  )
}
