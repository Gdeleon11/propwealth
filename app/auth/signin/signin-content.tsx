'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setError('Error al iniciar sesión. Intenta de nuevo.')
    }
  }, [searchParams])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/dashboard',
      })

      if (result?.error) {
        setError('Error al iniciar sesión con Google')
        setLoading(false)
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-container flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">PropWealth</h1>
            <p className="text-on-surface-variant">Executive Asset Intelligence</p>
          </div>

          {/* Description */}
          <p className="text-on-surface-variant mb-8">
            Gestión inteligente de tu portafolio inmobiliario
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-error rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold text-base flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-70 mb-4"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Conectando...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="white"
                  />
                </svg>
                Iniciar sesión con Google
              </>
            )}
          </button>

          {/* Info */}
          <p className="text-xs text-on-surface-variant mt-8">
            Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 gap-4 text-white">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-semibold">Dashboard Completo</h3>
              <p className="text-sm opacity-90">Visualiza todas tus propiedades y métricas</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏘️</span>
            <div>
              <h3 className="font-semibold">Gestión de Propiedades</h3>
              <p className="text-sm opacity-90">Administra tus activos inmobiliarios</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h3 className="font-semibold">Análisis Financiero</h3>
              <p className="text-sm opacity-90">ROI, flujo de caja y reportes detallados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
