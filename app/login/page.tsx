'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import { useTheme } from '@/lib/ThemeContext'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { theme } = useTheme()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('please enter your name')
      return
    }
    if (!password) {
      setError('please enter your password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password }),
      })
      const data = await res.json()

      if (res.ok && data.user) {
        // Save to localStorage
        const profile = {
          name: data.user.name,
          currentAge: data.user.age,
          interests: data.user.interests?.split(', ') || [],
          currentGoals: data.user.goals || '',
        }
        localStorage.setItem('youthai_profile', JSON.stringify(profile))
        localStorage.setItem('npc_user_id', data.user.id)

        router.push('/dashboard')
      } else {
        setError(data.error || 'user not found - maybe sign up first?')
      }
    } catch (err) {
      setError('something went wrong, try again')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background }}>
      {/* Doodle decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 text-5xl rotate-12 animate-bounce">⭐</div>
        <div className="absolute top-40 left-10 text-4xl -rotate-12">🌸</div>
        <div className="absolute bottom-40 right-20 text-4xl rotate-6">✨</div>
        <div className="absolute bottom-20 left-20 text-5xl -rotate-6">🌈</div>
      </div>

      <NavBar />

      <div className="relative z-10 flex-1 flex items-center justify-center py-8 px-4">
        <div
          className="w-full max-w-md p-8"
          style={{
            backgroundColor: 'white',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '8px 8px 0 black',
          }}
        >
          {/* Blob character */}
          <div className="flex justify-center mb-6">
            <svg width="100" height="120" viewBox="0 0 60 70">
              <ellipse cx="30" cy="45" rx="20" ry="25" fill={theme.colors.accent4} stroke="black" strokeWidth="3"/>
              <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
              <circle cx="24" cy="18" r="4" fill="black"/>
              <circle cx="36" cy="18" r="4" fill="black"/>
              <circle cx="25" cy="17" r="1.5" fill="white"/>
              <circle cx="37" cy="17" r="1.5" fill="white"/>
              <path d="M24 28 Q30 32 36 28" stroke="black" strokeWidth="2" fill="none"/>
            </svg>
          </div>

          <h1
            className="text-2xl font-bold text-center mb-2 inline-block w-full px-4 py-2"
            style={{
              backgroundColor: theme.colors.accent2,
              border: '3px solid black',
              boxShadow: '4px 4px 0 black',
            }}
          >
            welcome back!
          </h1>
          <p className="text-center text-gray-600 mb-6 mt-4">enter your name and password to log in</p>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name..."
              className="w-full px-4 py-3 text-lg mb-4"
              style={{
                backgroundColor: '#FFFACD',
                border: '3px solid black',
                borderRadius: '12px',
              }}
              autoFocus
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="your password..."
              className="w-full px-4 py-3 text-lg mb-4"
              style={{
                backgroundColor: '#FFFACD',
                border: '3px solid black',
                borderRadius: '12px',
              }}
            />

            {error && (
              <div
                className="mb-4 p-3 text-center font-bold"
                style={{
                  backgroundColor: theme.colors.buttonDanger,
                  border: '2px solid black',
                  borderRadius: '8px',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-bold text-lg hover:scale-105 transition-transform"
              style={{
                backgroundColor: theme.colors.buttonSuccess,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '4px 4px 0 black',
              }}
            >
              {loading ? 'logging in...' : 'log in →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">don&apos;t have an account?</p>
            <Link
              href="/onboarding"
              className="inline-block px-6 py-2 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: theme.colors.buttonPrimary,
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              sign up!
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
