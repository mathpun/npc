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
        setInsight("Today is yours to shape. Go make something cool happen!")
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchInsight()
    }
  }, [userId])

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.colors.background }}
    >
      <NavBar />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
          <p className="text-sm opacity-70">your daily card, {userName}</p>
        </div>

        {/* Tarot Card */}
        <div
          className="w-64 sm:w-72 rounded-2xl overflow-hidden"
          style={{
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
          }}
        >
          {!isRevealed ? (
            /* Card Back */
            <button
              onClick={() => setIsRevealed(true)}
              className="w-full p-6 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform active:scale-100"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.accent1} 0%, ${theme.colors.accent5} 50%, ${theme.colors.accent4} 100%)`,
                minHeight: '320px',
              }}
            >
              {/* Decorative border */}
              <div
                className="absolute inset-3 rounded-xl pointer-events-none"
                style={{ border: '2px solid rgba(0,0,0,0.15)' }}
              />

              <div className="text-6xl mb-4 animate-pulse">🔮</div>
              <div
                className="px-5 py-2 rounded-full font-bold"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  border: '2px solid black',
                }}
              >
                tap to reveal
              </div>

              {/* Corner stars */}
              <div className="absolute top-3 left-3 text-lg opacity-60">✦</div>
              <div className="absolute top-3 right-3 text-lg opacity-60">✦</div>
              <div className="absolute bottom-3 left-3 text-lg opacity-60">✦</div>
              <div className="absolute bottom-3 right-3 text-lg opacity-60">✦</div>
            </button>
          ) : (
            /* Card Front - Revealed */
            <div
              className="w-full p-5 animate-fadeIn"
              style={{
                background: `linear-gradient(180deg, ${theme.colors.backgroundAlt} 0%, white 100%)`,
                minHeight: '320px',
              }}
            >
              {/* Header */}
              <div className="text-center mb-3">
                <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                  ✧ today's insight ✧
                </span>
              </div>

              {/* Emoji */}
              <div className="text-center mb-4">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.accent1} 0%, ${theme.colors.accent3} 100%)`,
                    border: '3px solid black',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  {isLoading ? '✨' : emoji}
                </div>
              </div>

              {/* Insight */}
              <div className="text-center mb-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 rounded-full animate-pulse mx-auto w-4/5" style={{ backgroundColor: theme.colors.accent4 }} />
                    <div className="h-3 rounded-full animate-pulse mx-auto w-3/5" style={{ backgroundColor: theme.colors.accent4 }} />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed font-medium italic">
                    "{insight}"
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="text-center pt-3 border-t border-dashed border-black/20">
                <p className="text-[10px] font-bold opacity-40">
                  ✨ for {userName} ✨
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        {isRevealed && (
          <div className="mt-6 text-center animate-fadeIn">
            <p className="text-xs opacity-60 mb-3">carry this with you today</p>
            <button
              onClick={() => router.push('/chat')}
              className="px-5 py-2.5 font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
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
    </main>
  )
}
