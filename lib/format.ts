// Formato de moneda que respeta la divisa elegida por el usuario.
// Se guarda en localStorage para que todas las pantallas la usen sin recargar.

const KEY = 'propwealth_currency'

export function getCurrencyCode(): string {
  if (typeof window === 'undefined') return 'USD'
  try {
    return window.localStorage.getItem(KEY) || 'USD'
  } catch {
    return 'USD'
  }
}

export function setCurrencyCode(code: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, code)
  } catch {
    /* noop */
  }
}

// Formatea un número como moneda en la divisa actual del usuario.
export function formatMoney(n: number, opts?: { maximumFractionDigits?: number }): string {
  const code = getCurrencyCode()
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: opts?.maximumFractionDigits ?? 0,
    }).format(Number(n) || 0)
  } catch {
    // Si el código no es válido para Intl, mostramos el número con el código
    return `${code} ${(Number(n) || 0).toLocaleString('es')}`
  }
}

// Versión abreviada ($42.8k) usada en algunos widgets.
export function formatMoneyShort(n: number): string {
  const value = Number(n) || 0
  const code = getCurrencyCode()
  let symbol = '$'
  try {
    const parts = new Intl.NumberFormat('es', { style: 'currency', currency: code }).formatToParts(0)
    symbol = parts.find(p => p.type === 'currency')?.value || '$'
  } catch { /* noop */ }
  if (Math.abs(value) >= 1000) return `${symbol}${(value / 1000).toFixed(1)}k`
  return `${symbol}${value.toFixed(0)}`
}
