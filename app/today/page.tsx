'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import { useTheme } from '@/lib/ThemeContext'

export default function TodayPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [insight, setInsight] = useState<string | null>(null)
  const [emoji, setEmoji] = useState<string>('✨')
  const [isLoading, setIsLoading] = useState(true)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const profile = localStorage.getItem('youthai_profile')
    const storedUserId = localStorage.getItem('npc_user_id')

    if (!profile) {
      router.push('/onboarding')
      return
    }

    const parsed = JSON.parse(profile)
    setUserName(parsed.name || '')
    setUserId(storedUserId)
  }, [router])

  useEffect(() => {
    const fetchInsight = async () => {
      if (!userId) return

      try {
        const res = await fetch(`/api/daily-insight?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setInsight(data.insight)
          setEmoji(data.emoji || '✨')
        }
      } catch (err) {
        console.error('Failed to fetch daily insight:', err)
        setInsight("Today is full of possibilities. What will you make of it?")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchInsight()
    }
  }, [userId])

  const handleReveal = () => {
    setIsRevealed(true)
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.colors.background }}
    >
      <NavBar />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
          <p className="text-sm opacity-70">your daily card awaits, {userName}</p>
        </div>

        {/* Tarot Card */}
        <div
          className="relative w-72 sm:w-80 perspective-1000"
          style={{ perspective: '1000px' }}
        >
          <div
            className={`relative transition-all duration-700 cursor-pointer ${
              isRevealed ? '' : 'hover:scale-105'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
            onClick={!isRevealed ? handleReveal : undefined}
          >
            {/* Card Back (shown first) */}
            <div
              className="absolute inset-0 w-full rounded-3xl p-6 flex flex-col items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                background: `linear-gradient(135deg, ${theme.colors.accent1} 0%, ${theme.colors.accent5} 50%, ${theme.colors.accent4} 100%)`,
                border: '4px solid black',
                boxShadow: '8px 8px 0 black',
                minHeight: '420px',
              }}
            >
              {/* Decorative pattern */}
              <div className="absolute inset-4 rounded-2xl border-2 border-black/20" />
              <div className="absolute inset-8 rounded-xl border border-black/10" />

              {/* Center mystical symbol */}
              <div className="relative z-10 text-center">
                <div className="text-7xl mb-4 animate-pulse">🔮</div>
                <div
                  className="px-6 py-3 rounded-full font-bold text-lg"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    border: '2px solid black',
                  }}
                >
                  tap to reveal
                </div>
              </div>

              {/* Corner decorations */}
              <div className="absolute top-4 left-4 text-2xl">✦</div>
              <div className="absolute top-4 right-4 text-2xl">✦</div>
              <div className="absolute bottom-4 left-4 text-2xl">✦</div>
              <div className="absolute bottom-4 right-4 text-2xl">✦</div>
            </div>

            {/* Card Front (revealed) */}
            <div
              className="w-full rounded-3xl p-6 flex flex-col"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: `linear-gradient(180deg, ${theme.colors.backgroundAlt} 0%, white 50%, ${theme.colors.accent5}30 100%)`,
                border: '4px solid black',
                boxShadow: '8px 8px 0 black',
                minHeight: '420px',
              }}
            >
              {/* Top decoration */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold opacity-50 uppercase tracking-widest">
                  <span>✧</span>
                  <span>today's insight</span>
                  <span>✧</span>
                </div>
              </div>

              {/* Main emoji */}
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.accent1}50 0%, ${theme.colors.accent3}50 100%)`,
                    border: '3px solid black',
                    boxShadow: '4px 4px 0 black',
                  }}
                >
                  {isLoading ? '✨' : emoji}
                </div>
              </div>

              {/* Insight text */}
              <div className="flex-1 flex items-center justify-center px-2">
                {isLoading ? (
                  <div className="space-y-2 w-full">
                    <div className="h-4 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.accent4 }} />
                    <div className="h-4 rounded-full animate-pulse w-4/5 mx-auto" style={{ backgroundColor: theme.colors.accent4 }} />
                    <div className="h-4 rounded-full animate-pulse w-3/5 mx-auto" style={{ backgroundColor: theme.colors.accent4 }} />
                  </div>
                ) : (
                  <p
                    className="text-center text-lg leading-relaxed font-medium"
                    style={{ fontStyle: 'italic' }}
                  >
                    "{insight}"
                  </p>
                )}
              </div>

              {/* Bottom decoration */}
              <div className="text-center mt-4 pt-4 border-t-2 border-dashed border-black/20">
                <p className="text-xs font-bold opacity-50">
                  ✨ made for {userName} ✨
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subtext */}
        {isRevealed && (
          <div className="mt-8 text-center animate-fadeIn">
            <p className="text-sm opacity-70 mb-4">carry this with you today</p>
            <button
              onClick={() => router.push('/chat')}
              className="px-6 py-3 font-bold hover:scale-105 active:scale-95 transition-transform"
              style={{
                backgroundColor: theme.colors.accent1,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '4px 4px 0 black',
              }}
            >
              💬 start chatting
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </main>
  )
}
