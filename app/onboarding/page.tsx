'use client'

import OnboardingForm from '@/components/OnboardingForm'
import NavBar from '@/components/NavBar'

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFB6C1' }}>
      {/* Doodle decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 text-5xl rotate-12 animate-bounce">⭐</div>
        <div className="absolute top-40 left-10 text-4xl -rotate-12">🌸</div>
        <div className="absolute bottom-40 right-20 text-4xl rotate-6">✨</div>
        <div className="absolute bottom-20 left-20 text-5xl -rotate-6">🌈</div>
        <div className="absolute top-1/3 left-5 text-3xl">☀️</div>
      </div>

      {/* Nav */}
      <NavBar />

      {/* Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-8 px-4">
        <OnboardingForm />
      </div>
    </main>
  )
}
