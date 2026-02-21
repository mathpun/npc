'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import { useTheme } from '@/lib/ThemeContext'

interface WorldPreview {
  id: number
  world_name: string
  world_emoji: string
  world_vibe: string | null
  world_description: string | null
  color_theme: string
  owner_name: string
  owner_nickname: string | null
  element_count: number
  collaborator_count: number
}

export default function JoinWorldPage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const { inviteCode } = use(params)
  const router = useRouter()
  const { theme } = useTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [world, setWorld] = useState<WorldPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const savedUserId = localStorage.getItem('npc_user_id')
    if (savedUserId) {
      setUserId(savedUserId)
    }
    fetchWorldPreview()
  }, [inviteCode])

  const fetchWorldPreview = async () => {
    try {
      const res = await fetch(`/api/world/join/${inviteCode}`)
      if (res.status === 404) {
        setError('Invalid invite code')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (data.world) {
        setWorld(data.world)
      }
    } catch (err) {
      console.error('Failed to fetch world preview:', err)
      setError('Something went wrong')
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!userId || !world) return

    setJoining(true)
    setError(null)

    try {
      const res = await fetch(`/api/world/join/${inviteCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/create/${data.worldId}`)
        }, 1500)
      } else {
        setError(data.error || 'Failed to join')
      }
    } catch (err) {
      console.error('Failed to join world:', err)
      setError('Something went wrong')
    }
    setJoining(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🌍</div>
          <p className="text-xl font-bold" style={{ color: theme.colors.text }}>Loading invite...</p>
        </div>
      </div>
    )
  }

  if (error && !world) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
            {error}
          </h1>
          <p className="mb-6" style={{ color: theme.colors.textMuted }}>
            This invite link may be expired or invalid
          </p>
          <Link
            href="/create"
            className="px-6 py-3 font-bold rounded-full inline-block hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              border: '3px solid black',
              boxShadow: '3px 3px 0 black',
              color: theme.colors.text,
            }}
          >
            Go to World Builder
          </Link>
        </div>
      </div>
    )
  }

  if (!world) return null

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <NavBar />

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
            You&apos;ve been invited!
          </h1>
          <p style={{ color: theme.colors.textMuted }}>
            Join this world and start creating together
          </p>
        </div>

        {/* World Preview Card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: world.color_theme,
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="text-center mb-4">
            <span className="text-6xl">{world.world_emoji}</span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: theme.colors.text }}>
            {world.world_name}
          </h2>

          {world.world_vibe && (
            <div className="flex justify-center mb-3">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  color: theme.colors.text,
                }}
              >
                {world.world_vibe}
              </span>
            </div>
          )}

          {world.world_description && (
            <p
              className="text-center mb-4"
              style={{ color: theme.colors.text, opacity: 0.9 }}
            >
              {world.world_description}
            </p>
          )}

          <div className="flex justify-center gap-3 text-sm">
            <span
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: theme.colors.text }}
            >
              {world.element_count} elements
            </span>
            <span
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: theme.colors.text }}
            >
              {world.collaborator_count + 1} creators
            </span>
          </div>

          <div className="text-center mt-4 pt-4 border-t border-black/20">
            <span className="text-sm" style={{ color: theme.colors.text, opacity: 0.7 }}>
              Created by {world.owner_nickname || world.owner_name}
            </span>
          </div>
        </div>

        {/* Join Button or Login Prompt */}
        {userId ? (
          <div className="space-y-4">
            {success ? (
              <div
                className="p-4 rounded-xl text-center"
                style={{
                  backgroundColor: theme.colors.buttonSuccess,
                  border: '3px solid black',
                }}
              >
                <div className="text-2xl mb-2">🎉</div>
                <p className="font-bold" style={{ color: theme.colors.text }}>
                  You&apos;re in! Redirecting...
                </p>
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full py-4 text-lg font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: theme.colors.buttonSuccess,
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                  color: theme.colors.text,
                }}
              >
                {joining ? 'Joining...' : 'Join This World'}
              </button>
            )}

            {error && (
              <p className="text-center text-sm" style={{ color: theme.colors.buttonDanger }}>
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center" style={{ color: theme.colors.textMuted }}>
              You need to be logged in to join worlds
            </p>
            <Link
              href="/login"
              className="block w-full py-4 text-lg font-bold rounded-xl text-center hover:scale-105 transition-transform"
              style={{
                backgroundColor: theme.colors.buttonPrimary,
                border: '3px solid black',
                boxShadow: '4px 4px 0 black',
                color: theme.colors.text,
              }}
            >
              Log In to Join
            </Link>
            <Link
              href="/onboarding"
              className="block w-full py-3 font-bold rounded-xl text-center hover:scale-105 transition-transform"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px solid black',
                color: theme.colors.text,
              }}
            >
              Create Account
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
