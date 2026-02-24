'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import NavBar from '@/components/NavBar'
import { useTheme } from '@/lib/ThemeContext'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import AppleSignInButton from '@/components/AppleSignInButton'

type UserType = 'teen' | 'parent'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [userType, setUserType] = useState<UserType>('teen')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [parentNeedsPassword, setParentNeedsPassword] = useState(false)
  const [parentHasPassword, setParentHasPassword] = useState(false)
  const [parentPassword, setParentPassword] = useState('')
  const [parentConfirmPassword, setParentConfirmPassword] = useState('')
  const [parentLinkSent, setParentLinkSent] = useState(false)
  const [debugToken, setDebugToken] = useState('')
  const { theme } = useTheme()

  // Handle error from OAuth
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'NoEmail') {
        setError('Could not get email from Google account')
      } else if (errorParam === 'DatabaseError') {
        setError('Something went wrong, please try again')
      } else {
        setError('Sign in failed, please try again')
      }
    }
  }, [searchParams])

  // Handle successful Google auth session
  useEffect(() => {
    async function handleGoogleSession() {
      if (status === 'authenticated' && session?.user) {
        const { email, googleId, userType: sessionUserType, isNewUser } = session.user

        if (isNewUser) {
          // New user - redirect to onboarding with Google info
          const params = new URLSearchParams({
            google: 'true',
            email: email || '',
            name: session.user.name || '',
          })
          router.push(`/onboarding?${params}`)
          return
        }

        if (sessionUserType === 'parent') {
          // Parent user - redirect to parent dashboard
          router.push('/parent')
          return
        }

        if (sessionUserType === 'teen' && session.user.id) {
          // Existing teen user - set up localStorage and redirect
          try {
            const res = await fetch(`/api/users/${session.user.id}`)
            if (res.ok) {
              const data = await res.json()
              const profile = {
                name: data.user.nickname || data.user.name,
                currentAge: data.user.age,
                interests: data.user.interests?.split(', ') || [],
                currentGoals: data.user.goals || '',
              }
              localStorage.setItem('youthai_profile', JSON.stringify(profile))
              localStorage.setItem('npc_user_id', data.user.id)
              router.push('/dashboard')
            }
          } catch (err) {
            console.error('Error fetching user data:', err)
            setError('Failed to load your profile')
          }
        }
      }
    }

    handleGoogleSession()
  }, [session, status, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('please enter your name')
      return
    }

    setLoading(true)
    setError('')

    try {
      // If we're in password creation mode
      if (needsPassword) {
        if (!password) {
          setError('please create a password')
          setLoading(false)
          return
        }
        if (password.length < 4) {
          setError('password must be at least 4 characters')
          setLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setError('passwords don\'t match')
          setLoading(false)
          return
        }

        // Set the password
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), password, setPassword: true }),
        })
        const data = await res.json()

        if (res.ok && data.user) {
          const profile = {
            name: data.user.nickname || data.user.name, // use nickname for AI
            currentAge: data.user.age,
            interests: data.user.interests?.split(', ') || [],
            currentGoals: data.user.goals || '',
          }
          localStorage.setItem('youthai_profile', JSON.stringify(profile))
          localStorage.setItem('npc_user_id', data.user.id)
          router.push('/dashboard')
        } else {
          setError(data.error || 'something went wrong')
        }
        setLoading(false)
        return
      }

      // Normal login - first check if user exists and needs password
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password }),
      })
      const data = await res.json()

      if (data.needsPassword) {
        // User exists but needs to create a password
        setNeedsPassword(true)
        setPassword('')
        setLoading(false)
        return
      }

      if (res.ok && data.user) {
        // Save to localStorage
        const profile = {
          name: data.user.nickname || data.user.name, // use nickname for AI
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

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('please enter your email')
      return
    }

    setLoading(true)
    setError('')

    try {
      // If setting a new password
      if (parentNeedsPassword) {
        if (!parentPassword) {
          setError('please create a password')
          setLoading(false)
          return
        }
        if (parentPassword.length < 4) {
          setError('password must be at least 4 characters')
          setLoading(false)
          return
        }
        if (parentPassword !== parentConfirmPassword) {
          setError('passwords don\'t match')
          setLoading(false)
          return
        }

        const res = await fetch('/api/parent/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password: parentPassword, setPassword: true }),
        })
        const data = await res.json()

        if (res.ok && data.success) {
          // Store parent session info and redirect
          localStorage.setItem('parent_email', data.parentEmail)
          localStorage.setItem('parent_teens', JSON.stringify(data.connectedTeens))
          router.push('/parent')
        } else {
          setError(data.error || 'something went wrong')
        }
        setLoading(false)
        return
      }

      // Normal login flow
      const res = await fetch('/api/parent/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: parentPassword || undefined }),
      })
      const data = await res.json()

      if (data.hasPassword && !parentPassword) {
        // They have a password set, show password field
        setParentHasPassword(true)
        setLoading(false)
        return
      }

      if (data.needsPassword) {
        // They don't have a password yet, prompt to create one
        setParentNeedsPassword(true)
        setLoading(false)
        return
      }

      if (res.ok && data.success) {
        if (data.parentEmail) {
          // Password login successful
          localStorage.setItem('parent_email', data.parentEmail)
          localStorage.setItem('parent_teens', JSON.stringify(data.connectedTeens))
          router.push('/parent')
        } else {
          // Magic link sent
          setParentLinkSent(true)
          if (data.token) {
            setDebugToken(data.token)
          }
        }
      } else {
        setError(data.error || 'something went wrong')
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
          className="w-full max-w-md p-8 text-black"
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

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setUserType('teen')
                setError('')
                setParentLinkSent(false)
              }}
              className="flex-1 py-3 font-bold transition-transform hover:scale-105"
              style={{
                backgroundColor: userType === 'teen' ? theme.colors.accent1 : 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: userType === 'teen' ? '4px 4px 0 black' : '2px 2px 0 black',
              }}
            >
              I&apos;m a teen
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType('parent')
                setError('')
                setNeedsPassword(false)
              }}
              className="flex-1 py-3 font-bold transition-transform hover:scale-105"
              style={{
                backgroundColor: userType === 'parent' ? theme.colors.accent3 : 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: userType === 'parent' ? '4px 4px 0 black' : '2px 2px 0 black',
              }}
            >
              I&apos;m a parent
            </button>
          </div>

          <h1
            className="text-2xl font-bold text-center mb-2 inline-block w-full px-4 py-2"
            style={{
              backgroundColor: userType === 'parent'
                ? theme.colors.accent3
                : needsPassword ? theme.colors.accent1 : theme.colors.accent2,
              border: '3px solid black',
              boxShadow: '4px 4px 0 black',
            }}
          >
            {userType === 'parent'
              ? parentNeedsPassword
                ? 'create password'
                : 'parent portal'
              : needsPassword ? `hey ${name}!` : 'welcome back!'}
          </h1>
          <p className="text-center text-gray-600 mb-6 mt-4">
            {userType === 'parent'
              ? parentNeedsPassword
                ? 'create a password to make logging in easier!'
                : parentHasPassword
                ? 'enter your password to log in'
                : 'enter your email to log in'
              : needsPassword
              ? 'we added passwords! create one to keep your account secure'
              : 'enter your name and password to log in'}
          </p>

          {/* Parent Login Form */}
          {userType === 'parent' && !parentLinkSent && (
            <form onSubmit={handleParentLogin}>
              {/* Email input - always shown unless we're in password entry mode */}
              {!parentHasPassword && !parentNeedsPassword && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your email..."
                  className="w-full px-4 py-3 text-lg mb-4"
                  style={{
                    backgroundColor: '#FFFACD',
                    border: '3px solid black',
                    borderRadius: '12px',
                  }}
                  autoFocus
                />
              )}

              {/* Show email as readonly when entering password */}
              {(parentHasPassword || parentNeedsPassword) && (
                <div
                  className="w-full px-4 py-3 text-lg mb-4 text-gray-600"
                  style={{
                    backgroundColor: '#f0f0f0',
                    border: '3px solid black',
                    borderRadius: '12px',
                  }}
                >
                  {email}
                </div>
              )}

              {/* Password field when user has a password */}
              {parentHasPassword && (
                <input
                  type="password"
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value)}
                  placeholder="your password..."
                  className="w-full px-4 py-3 text-lg mb-4"
                  style={{
                    backgroundColor: '#FFFACD',
                    border: '3px solid black',
                    borderRadius: '12px',
                  }}
                  autoFocus
                />
              )}

              {/* Password creation fields when user needs to set password */}
              {parentNeedsPassword && (
                <>
                  <input
                    type="password"
                    value={parentPassword}
                    onChange={(e) => setParentPassword(e.target.value)}
                    placeholder="create a password..."
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
                    value={parentConfirmPassword}
                    onChange={(e) => setParentConfirmPassword(e.target.value)}
                    placeholder="confirm password..."
                    className="w-full px-4 py-3 text-lg mb-4"
                    style={{
                      backgroundColor: '#FFFACD',
                      border: '3px solid black',
                      borderRadius: '12px',
                    }}
                  />
                  <p
                    className="text-sm text-center mb-4 px-3 py-2"
                    style={{
                      backgroundColor: theme.colors.accent3,
                      border: '2px dashed black',
                      borderRadius: '8px',
                    }}
                  >
                    password must be at least 4 characters
                  </p>
                </>
              )}

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
                {loading
                  ? (parentNeedsPassword ? 'saving...' : parentHasPassword ? 'logging in...' : 'checking...')
                  : parentNeedsPassword
                  ? 'save password & log in →'
                  : parentHasPassword
                  ? 'log in →'
                  : 'continue →'}
              </button>

              {/* Back button when in password mode */}
              {(parentHasPassword || parentNeedsPassword) && (
                <button
                  type="button"
                  onClick={() => {
                    setParentHasPassword(false)
                    setParentNeedsPassword(false)
                    setParentPassword('')
                    setParentConfirmPassword('')
                    setError('')
                  }}
                  className="w-full mt-3 py-2 font-bold text-sm hover:underline"
                >
                  ← use a different email
                </button>
              )}
            </form>
          )}

          {/* Parent Link Sent Confirmation */}
          {userType === 'parent' && parentLinkSent && (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <p className="font-bold text-lg mb-2">check your email!</p>
              <p className="text-gray-600 mb-4">
                we sent a login link to <strong>{email}</strong>
              </p>
              {debugToken && (
                <div
                  className="p-3 mb-4 text-sm"
                  style={{
                    backgroundColor: '#E6E6FA',
                    border: '2px dashed black',
                    borderRadius: '8px',
                  }}
                >
                  <p className="font-bold mb-1">dev mode: click to login</p>
                  <button
                    onClick={() => router.push(`/parent?token=${debugToken}`)}
                    className="underline text-blue-600"
                  >
                    /parent?token={debugToken.slice(0, 8)}...
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setParentLinkSent(false)
                  setEmail('')
                  setDebugToken('')
                }}
                className="text-sm underline"
              >
                use a different email
              </button>
            </div>
          )}

          {/* Teen Login Form */}
          {userType === 'teen' && (
          <>
          {/* Social Sign In Buttons */}
          <div className="space-y-3 mb-4">
            <AppleSignInButton callbackUrl="/api/auth/google-callback" />
            <GoogleSignInButton callbackUrl="/api/auth/google-callback" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-1 bg-black rounded" style={{ opacity: 0.2 }} />
            <span className="text-sm font-bold text-gray-500">or continue with</span>
            <div className="flex-1 h-1 bg-black rounded" style={{ opacity: 0.2 }} />
          </div>

          <form onSubmit={handleLogin}>
            {!needsPassword && (
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
            )}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={needsPassword ? 'create a password...' : 'your password...'}
              className="w-full px-4 py-3 text-lg mb-4"
              style={{
                backgroundColor: '#FFFACD',
                border: '3px solid black',
                borderRadius: '12px',
              }}
              autoFocus={needsPassword}
            />

            {needsPassword && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="confirm password..."
                className="w-full px-4 py-3 text-lg mb-4"
                style={{
                  backgroundColor: '#FFFACD',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              />
            )}

            {needsPassword && (
              <p
                className="text-sm text-center mb-4 px-3 py-2"
                style={{
                  backgroundColor: theme.colors.accent3,
                  border: '2px dashed black',
                  borderRadius: '8px',
                }}
              >
                password must be at least 4 characters
              </p>
            )}

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
              {loading
                ? (needsPassword ? 'saving...' : 'logging in...')
                : (needsPassword ? 'save password & log in →' : 'log in →')}
            </button>

            {needsPassword && (
              <button
                type="button"
                onClick={() => {
                  setNeedsPassword(false)
                  setPassword('')
                  setConfirmPassword('')
                  setError('')
                }}
                className="w-full mt-3 py-2 font-bold text-sm hover:underline"
              >
                ← back to login
              </button>
            )}
          </form>
          </>
          )}

          {/* Sign up link - only for teens */}
          {userType === 'teen' && (
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
          )}

          {/* Info for parents */}
          {userType === 'parent' && !parentLinkSent && (
            <div className="mt-6 text-center">
              <p
                className="text-sm p-3"
                style={{
                  backgroundColor: '#E6E6FA',
                  border: '2px dashed black',
                  borderRadius: '8px',
                }}
              >
                your teen needs to add your email in their app first. ask them to connect you in their growth section!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
