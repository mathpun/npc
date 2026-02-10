'use client'

import { useState, useEffect } from 'react'

interface Challenge {
  id: string
  title: string
  description: string
  duration: string
  category: string
  difficulty: string
  xp: number
  emoji: string
  color: string
}

interface Props {
  completedChallengeIds?: string[]
  onChallengeToggle?: () => void
}

export default function RealWorldChallenges({ completedChallengeIds = [], onChallengeToggle }: Props) {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [showReflection, setShowReflection] = useState(false)
  const [reflection, setReflection] = useState('')
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(completedChallengeIds))

  useEffect(() => {
    setCompletedIds(new Set(completedChallengeIds))
  }, [completedChallengeIds])

  const challenges: Challenge[] = [
    {
      id: '1',
      title: 'The Perspective Switch',
      description: 'Have a convo with someone you disagree with. Really listen!',
      duration: '1-2 days',
      category: 'social',
      difficulty: 'thoughtful',
      xp: 50,
      emoji: '🔄',
      color: '#FF69B4',
    },
    {
      id: '2',
      title: 'Notice Your Reactions',
      description: 'For one day, notice when you feel strongly. What triggered it?',
      duration: '1 day',
      category: 'observation',
      difficulty: 'easy',
      xp: 25,
      emoji: '👀',
      color: '#FFD700',
    },
    {
      id: '3',
      title: 'Ask a Trusted Adult',
      description: 'Ask a parent or mentor what they think about something on your mind.',
      duration: '1 week',
      category: 'social',
      difficulty: 'medium',
      xp: 40,
      emoji: '💬',
      color: '#87CEEB',
    },
    {
      id: '4',
      title: 'The Compliment Experiment',
      description: 'Give 3 genuine compliments today. Notice how it feels!',
      duration: '1 day',
      category: 'action',
      difficulty: 'easy',
      xp: 20,
      emoji: '💝',
      color: '#90EE90',
    },
    {
      id: '5',
      title: 'Phone-Free Hour',
      description: 'One hour without your phone. Sit with your thoughts.',
      duration: '1 hour',
      category: 'reflection',
      difficulty: 'medium',
      xp: 30,
      emoji: '📵',
      color: '#DDA0DD',
    },
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-black" style={{  }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-3 inline-block px-6 py-2 -rotate-1"
          style={{
            backgroundColor: '#90EE90',
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 black',
          }}
        >
          🎯 Real-World Challenges 🎯
        </h1>
        <p className="text-lg mt-4">Thinking is great. Doing is better!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Completed', value: completedCount, emoji: '✅', color: '#90EE90' },
          { label: 'XP Earned', value: totalXP, emoji: '⭐', color: '#FFD700' },
          { label: 'Streak', value: completedCount >= 5 ? '🔥' : completedCount >= 3 ? '⚡' : '🌱', emoji: '', color: '#FF69B4' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-3 text-center"
            style={{
              backgroundColor: stat.color,
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <div className="text-2xl font-bold">{stat.label === 'Streak' ? stat.value : (stat.emoji || stat.value)}</div>
            <div className="text-xs font-bold">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active Challenge */}
      {activeChallenge && (
        <div
          className="p-5"
          style={{
            backgroundColor: activeChallenge.color,
            border: '4px solid black',
            borderRadius: '16px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg">Active Challenge!</span>
          </div>

          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{activeChallenge.emoji}</span>
              <h3 className="font-bold text-lg">{activeChallenge.title}</h3>
            </div>
            <p>{activeChallenge.description}</p>
          </div>

          {!showReflection ? (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChallenge(null)}
                className="flex-1 py-3 font-bold"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowReflection(true)}
                className="flex-1 py-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: '#90EE90',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                I Did It! ✓
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-bold">How did it go? What did you notice?</p>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-3 py-2"
                rows={3}
                style={{
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              />
              <button
                onClick={submitReflection}
                disabled={!reflection.trim()}
                className="w-full py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                style={{
                  backgroundColor: '#FFD700',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                Complete & Earn {activeChallenge.xp} XP! 🎉
              </button>
            </div>
          )}
        </div>
      )}

      {/* Challenge List */}
      {!activeChallenge && (
        <div
          className="p-5 rotate-1"
          style={{
            backgroundColor: '#87CEEB',
            border: '4px solid black',
            borderRadius: '16px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <h2 className="text-xl font-bold mb-4">🎮 Pick a Challenge</h2>
          <div className="space-y-3">
            {challenges.map((challenge, index) => {
              const isCompleted = completedIds.has(challenge.id)
              return (
                <div
                  key={challenge.id}
                  className={`p-3 ${isCompleted ? 'opacity-75' : 'cursor-pointer hover:scale-[1.02]'} transition-transform`}
                  onClick={() => !isCompleted && startChallenge(challenge)}
                  style={{
                    backgroundColor: challenge.color,
                    border: '3px solid black',
                    borderRadius: '12px',
                    boxShadow: '3px 3px 0 black',
                    transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{isCompleted ? '✅' : challenge.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-bold ${isCompleted ? 'line-through' : ''}`}>{challenge.title}</h3>
                        <span
                          className="px-2 py-1 text-xs font-bold"
                          style={{
                            backgroundColor: isCompleted ? '#90EE90' : 'white',
                            border: '2px solid black',
                            borderRadius: '8px',
                          }}
                        >
                          {isCompleted ? 'Done!' : `+${challenge.xp} XP`}
                        </span>
                      </div>
                      <p className="text-sm">{challenge.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs">⏱️ {challenge.duration}</span>
                        <span className="text-xs">• {challenge.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Note */}
      <div
        className="p-4 text-center -rotate-1"
        style={{
          backgroundColor: 'white',
          border: '2px dashed black',
          borderRadius: '12px',
        }}
      >
        <p className="text-sm">
          💡 AI can help you think, but growth happens when you ACT! Try these IRL challenges.
        </p>
      </div>
    </div>
  )
}
