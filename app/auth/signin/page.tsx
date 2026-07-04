'use client'

import { Suspense } from 'react'
import SignInContent from './signin-content'

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary flex items-center justify-center"><p className="text-white">Cargando...</p></div>}>
      <SignInContent />
    </Suspense>
  )
}
