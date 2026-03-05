'use client'

import { useTheme } from '@/lib/ThemeContext'

import { useState, useEffect } from 'react'

interface Challenge {
  id: string
  title: string
  description: string
  duration: string
  xp: number
  emoji: string
}

interface Props {
  completedChallengeIds?: string[]
  onChallengeToggle?: () => void
}

export default function RealWorldChallenges({ completedChallengeIds = [], onChallengeToggle }: Props) {
  const { theme } = useTheme()
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [showReflection, setShowReflection] = useState(false)
  const [reflection, setReflection] = useState('')
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(completedChallengeIds))

  useEffect(() => {
    setCompletedIds(new Set(completedChallengeIds))
  }, [completedChallengeIds])

  const challenges: Challenge[] = [
    { id: '1', title: 'Perspective Switch', description: 'Listen to someone you disagree with', duration: '1-2 days', xp: 50, emoji: '🔄' },
    { id: '2', title: 'Notice Reactions', description: 'Track what triggers strong feelings', duration: '1 day', xp: 25, emoji: '👀' },
    { id: '3', title: 'Ask an Adult', description: 'Get advice from a parent or mentor', duration: '1 week', xp: 40, emoji: '💬' },
    { id: '4', title: 'Compliment x3', description: 'Give 3 genuine compliments today', duration: '1 day', xp: 20, emoji: '💝' },
    { id: '5', title: 'Phone-Free Hour', description: 'One hour with your thoughts', duration: '1 hour', xp: 30, emoji: '📵' },
  ]

  const completedCount = completedIds.size
  const totalXP = challenges.filter(c => completedIds.has(c.id)).reduce((sum, c) => sum + c.xp, 0)

  const startChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge)
    setShowReflection(false)
    setReflection('')
  }

  const submitReflection = async () => {
    if (!activeChallenge) return

    const userId = localStorage.getItem('npc_user_id')
    if (userId) {
      try {
        await fetch('/api/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            challengeId: activeChallenge.id,
            notes: reflection,
          }),
        })

        setCompletedIds(prev => new Set([...Array.from(prev), activeChallenge.id]))
        onChallengeToggle?.()
      } catch (err) {
        console.error('Failed to save challenge:', err)
      }
    }

    setActiveChallenge(null)
    setShowReflection(false)
    setReflection('')
  }

  const getColor = (index: number) => {
    const colors = [theme.colors.accent1, theme.colors.accent2, theme.colors.accent3, theme.colors.accent4, theme.colors.accent5]
    return colors[index % colors.length]
  }

  return (
    <div className="max-w-sm mx-auto px-3 py-4">
      {/* Main Card - Screenshot friendly */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '4px solid black',
          boxShadow: '6px 6px 0 black',
          background: `linear-gradient(180deg, ${theme.colors.accent3} 0%, ${theme.colors.accent1} 100%)`,
        }}
      >
        {/* Header */}
        <div className="text-center py-3 px-4">
          <h1 className="text-xl font-bold">🎯 Real-World Quests</h1>
          <p className="text-xs opacity-70">thinking is great, doing is better!</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 px-3 pb-3">
          {[
            { label: 'done', value: completedCount, emoji: '✅' },
            { label: 'xp', value: totalXP, emoji: '⭐' },
            { label: 'streak', value: completedCount >= 5 ? '🔥' : completedCount >= 3 ? '⚡' : '🌱', emoji: '' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-2 text-center rounded-xl"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px solid black',
              }}
            >
              <div className="text-lg">{stat.emoji || stat.value}</div>
              <div className="text-xl font-bold">{stat.label === 'streak' ? '' : stat.value}</div>
              <div className="text-[10px] font-bold opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Challenge Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          {challenges.slice(0, 4).map((challenge, index) => {
            const isCompleted = completedIds.has(challenge.id)
            return (
              <button
                key={challenge.id}
                onClick={() => !isCompleted && startChallenge(challenge)}
                disabled={isCompleted}
                className={`p-2.5 rounded-xl text-left ${isCompleted ? 'opacity-60' : 'hover:scale-105 active:scale-95'} transition-transform`}
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '2px solid black',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">{isCompleted ? '✅' : challenge.emoji}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: getColor(index) }}>
                    +{challenge.xp}
                  </span>
                </div>
                <div className={`font-bold text-xs leading-tight ${isCompleted ? 'line-through' : ''}`}>
                  {challenge.title}
                </div>
                <div className="text-[10px] opacity-70 mt-0.5">{challenge.duration}</div>
              </button>
            )
          })}
        </div>

        {/* 5th challenge - full width */}
        {challenges.length > 4 && (
          <div className="px-3 pb-3">
            {(() => {
              const challenge = challenges[4]
              const isCompleted = completedIds.has(challenge.id)
              return (
                <button
                  onClick={() => !isCompleted && startChallenge(challenge)}
                  disabled={isCompleted}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-3 ${isCompleted ? 'opacity-60' : 'hover:scale-[1.02] active:scale-100'} transition-transform`}
                  style={{
                    backgroundColor: theme.colors.backgroundAlt,
                    border: '2px solid black',
                    boxShadow: '2px 2px 0 black',
                  }}
                >
                  <span className="text-xl">{isCompleted ? '✅' : challenge.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className={`font-bold text-xs ${isCompleted ? 'line-through' : ''}`}>{challenge.title}</div>
                    <div className="text-[10px] opacity-70">{challenge.description}</div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: getColor(4) }}>
                    +{challenge.xp}
                  </span>
                </button>
              )
            })()}
          </div>
        )}

        {/* Footer */}
        <div
          className="text-center py-2 px-3 text-[10px] font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
        >
          tap a quest to start · npc.chat
        </div>
      </div>

      {/* Active Challenge Modal */}
      {activeChallenge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setActiveChallenge(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl p-4"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '4px solid black',
              boxShadow: '8px 8px 0 black',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setActiveChallenge(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center font-bold rounded-full hover:scale-110"
              style={{ backgroundColor: theme.colors.accent1, border: '2px solid black' }}
            >
              ×
            </button>

            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-3xl mb-3"
                style={{
                  backgroundColor: theme.colors.accent3,
                  border: '3px solid black',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                {activeChallenge.emoji}
              </div>

              <h3 className="text-lg font-bold mb-1">{activeChallenge.title}</h3>
              <p className="text-xs mb-3 opacity-80">{activeChallenge.description}</p>

              <div className="flex items-center justify-center gap-2 mb-4 text-xs">
                <span className="px-2 py-1 rounded-lg" style={{ backgroundColor: theme.colors.accent4, border: '2px solid black' }}>
                  ⏱️ {activeChallenge.duration}
                </span>
                <span className="px-2 py-1 rounded-lg" style={{ backgroundColor: theme.colors.accent2, border: '2px solid black' }}>
                  +{activeChallenge.xp} XP
                </span>
              </div>

              {!showReflection ? (
                <button
                  onClick={() => setShowReflection(true)}
                  className="w-full py-2.5 font-bold text-sm rounded-xl hover:scale-105 active:scale-95 transition-transform"
                  style={{
                    backgroundColor: theme.colors.accent3,
                    border: '3px solid black',
                    boxShadow: '4px 4px 0 black',
                  }}
                >
                  I Did It! ✓
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="How did it go?"
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    rows={2}
                    style={{ border: '2px solid black' }}
                  />
                  <button
                    onClick={submitReflection}
                    disabled={!reflection.trim()}
                    className="w-full py-2.5 font-bold text-sm rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                    style={{
                      backgroundColor: theme.colors.accent2,
                      border: '3px solid black',
                      boxShadow: '4px 4px 0 black',
                    }}
                  >
                    Complete +{activeChallenge.xp} XP 🎉
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
