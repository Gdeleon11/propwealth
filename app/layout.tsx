import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'PropWealth | Executive Asset Intelligence',
  description: 'Gestión inteligente de portafolio inmobiliario',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-background text-on-background min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
