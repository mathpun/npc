'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import { MOOD_OPTIONS } from '@/lib/checkin-prompts'

interface CheckinData {
  date: string
  questions: string[]
  responses: string[]
  mood: string | null
  summary: string | null
}

interface ReportData {
  user: {
    name: string
    age: number
    interests: string
  }
  weekOf: string
  summary: {
    reflections: number
    checkins: number
    journalEntries: number
    streakDays: number
    moodTrend: string
  }
  checkins: CheckinData[]
  moodTrend: { date: string; mood: string }[]
  highlights: { text: string; date: string; emoji: string; category: string }[]
  topTopics: { topic: string; count: number }[]
}

export default function WeeklyReport() {
  const router = useRouter()
  const [showShareModal, setShowShareModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [expandedCheckin, setExpandedCheckin] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem('npc_user_id')
    if (!userId) {
      router.push('/login')
      return
    }

    fetchReportData(userId)
  }, [router])

  const fetchReportData = async (userId: string) => {
    try {
      const res = await fetch(`/api/report?userId=${userId}`)
      const data = await res.json()
      if (data.error) {
        console.error('Failed to fetch report:', data.error)
        setError(data.error)
      } else {
        setReportData(data)
      }
    } catch (err) {
      console.error('Failed to fetch report:', err)
      setError('Network error - please try again')
    }
    setLoading(false)
  }

  const getMoodEmoji = (mood: string | null) => {
    const moodOption = MOOD_OPTIONS.find(m => m.value === mood)
    return moodOption?.emoji || '😐'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFB6C1' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">📊</div>
          <p className="text-xl font-bold">loading your report...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFB6C1' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl font-bold">couldn&apos;t load report</p>
          {error && <p className="text-sm mt-2 opacity-70">{error}</p>}
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-2 font-bold"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            back to dashboard
          </button>
        </div>
      </div>
    )
  }

  const { user, weekOf, summary, checkins, moodTrend, highlights, topTopics } = reportData

  return (
    <div className="min-h-screen pb-8 text-black" style={{ backgroundColor: '#FFB6C1' }}>
      {/* Doodle decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 text-4xl rotate-12">⭐</div>
        <div className="absolute top-40 left-10 text-3xl -rotate-12">🌸</div>
        <div className="absolute bottom-40 right-20 text-3xl rotate-6">✨</div>
        <div className="absolute bottom-20 left-20 text-4xl -rotate-6">🌈</div>
      </div>

      {/* Nav */}
      <NavBar />

      {/* Sub header with share buttons */}
      <div className="relative z-10 px-6 py-3" style={{ backgroundColor: '#FFB6C1' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-end gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#90EE90',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            📤 share
          </button>
          <button
            className="px-4 py-2 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#87CEEB',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            ⬇️
          </button>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-8">
        {/* Report Header */}
        <div className="text-center mb-8">
          <div
            className="inline-block px-6 py-2 mb-4 rotate-1"
            style={{
              backgroundColor: '#87CEEB',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <span className="font-bold">📅 {weekOf}</span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold inline-block px-6 py-3 -rotate-1"
            style={{
              backgroundColor: '#FFD700',
              border: '4px solid black',
              boxShadow: '6px 6px 0 black',
            }}
          >
            weekly growth report!
          </h1>
          <p className="text-lg mt-4">
            {user.name}&apos;s reflection journey this week
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Check-ins', value: summary.checkins, emoji: '📝', color: '#98FB98' },
            { label: 'Chats', value: summary.reflections, emoji: '💬', color: '#DDA0DD' },
            { label: 'Day Streak', value: summary.streakDays, emoji: '🔥', color: '#FFA500' },
            { label: 'Mood', value: summary.moodTrend, emoji: summary.moodTrend === 'improving' ? '📈' : summary.moodTrend === 'declining' ? '📉' : '➡️', color: '#87CEEB' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 text-center"
              style={{
                backgroundColor: stat.color,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '4px 4px 0 black',
                transform: `rotate(${(i % 2 === 0 ? -2 : 2)}deg)`,
              }}
            >
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mood Trend */}
        {moodTrend.length > 0 && (
          <div
            className="mb-8 p-6 rotate-1"
            style={{
              backgroundColor: '#DDA0DD',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '6px 6px 0 black',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">😊</span>
              <h2 className="text-xl font-bold">mood this week</h2>
            </div>
            <div className="flex justify-around items-end h-24 p-3" style={{ backgroundColor: 'white', border: '3px solid black', borderRadius: '12px' }}>
              {moodTrend.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{getMoodEmoji(m.mood)}</span>
                  <span className="text-xs">{new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Check-ins */}
        {checkins.length > 0 && (
          <div
            className="mb-8 p-6 -rotate-1"
            style={{
              backgroundColor: '#98FB98',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '6px 6px 0 black',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">📝</span>
              <h2 className="text-xl font-bold">daily check-ins</h2>
            </div>
            <div className="space-y-3">
              {checkins.map((checkin, i) => (
                <div key={i}>
                  <button
                    onClick={() => setExpandedCheckin(expandedCheckin === i ? null : i)}
                    className="w-full p-3 text-left hover:scale-[1.02] transition-transform"
                    style={{
                      backgroundColor: 'white',
                      border: '3px solid black',
                      borderRadius: '12px',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getMoodEmoji(checkin.mood)}</span>
                        <span className="font-bold">{formatDate(checkin.date)}</span>
                      </div>
                      <span className="text-lg">{expandedCheckin === i ? '▼' : '▶'}</span>
                    </div>
                    {checkin.summary && (
                      <p className="text-sm mt-2 opacity-70">{checkin.summary}</p>
                    )}
                  </button>
                  {expandedCheckin === i && (
                    <div
                      className="mt-2 p-3 space-y-3"
                      style={{
                        backgroundColor: '#f9f9f9',
                        border: '2px dashed black',
                        borderRadius: '12px',
                      }}
                    >
                      {checkin.questions.map((q, qi) => (
                        <div key={qi}>
                          <p className="font-bold text-sm">{q}</p>
                          <p className="text-sm mt-1">{checkin.responses[qi] || '(no response)'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div
            className="mb-8 p-6 rotate-1"
            style={{
              backgroundColor: '#FFD700',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '6px 6px 0 black',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">✨</span>
              <h2 className="text-xl font-bold">week highlights!</h2>
            </div>
            <div className="space-y-3">
              {highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3"
                  style={{
                    backgroundColor: 'white',
                    border: '3px solid black',
                    borderRadius: '12px',
                    transform: `rotate(${(i % 2 === 0 ? -1 : 1)}deg)`,
                  }}
                >
                  <span className="text-2xl">{highlight.emoji}</span>
                  <div>
                    <span className="font-bold">{highlight.text}</span>
                    <p className="text-xs opacity-60">{formatDate(highlight.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Topics */}
        {topTopics.length > 0 && (
          <div
            className="mb-8 p-6"
            style={{
              backgroundColor: '#FFFACD',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '6px 6px 0 black',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">💬</span>
              <h2 className="text-xl font-bold">most discussed</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {topTopics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2"
                  style={{
                    backgroundColor: ['#FF69B4', '#90EE90', '#87CEEB', '#DDA0DD', '#FFD700'][i % 5],
                    border: '3px solid black',
                    borderRadius: '9999px',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  <span className="font-bold">{topic.topic}</span>
                  <span className="text-xs">({topic.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {checkins.length === 0 && highlights.length === 0 && (
          <div
            className="p-6 text-center"
            style={{
              backgroundColor: 'white',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '6px 6px 0 black',
            }}
          >
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-2">your journey is just starting!</h3>
            <p className="text-sm mb-4">
              complete your daily check-ins and chat with npc to see your growth here
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#90EE90',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              start reflecting
            </button>
          </div>
        )}

        {/* Note for Parents */}
        <div
          className="p-6 rotate-1"
          style={{
            backgroundColor: '#87CEEB',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">👨‍👩‍👧</span>
            <h2 className="text-xl font-bold">for parents & guardians</h2>
          </div>
          <p
            className="text-sm leading-relaxed mb-4 p-3"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            This report is designed to spark conversation, not surveillance. Ask about the highlights - let them share what they&apos;re comfortable with.
          </p>
          <div
            className="flex items-center gap-2 text-xs px-3 py-2"
            style={{
              backgroundColor: 'white',
              border: '2px dashed black',
              borderRadius: '8px',
            }}
          >
            <span>🔒</span>
            <span>detailed conversation content is private to {user.name}</span>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareModal(false)} />
          <div
            className="relative w-full max-w-md p-6"
            style={{
              backgroundColor: 'white',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '8px 8px 0 black',
            }}
          >
            <h3 className="text-xl font-bold mb-2">share report</h3>
            <p className="text-sm mb-6">
              choose what to share and with whom
            </p>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Full Report', desc: 'Everything shown above', color: '#90EE90' },
                { label: 'Highlights Only', desc: 'Just the good stuff', color: '#FFD700' },
                { label: 'Mood Trend', desc: 'Weekly mood overview', color: '#87CEEB' },
              ].map((option, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: option.color,
                    border: '3px solid black',
                    borderRadius: '12px',
                  }}
                >
                  <input type="radio" name="share-type" defaultChecked={i === 0} className="w-5 h-5" />
                  <div>
                    <div className="font-bold">{option.label}</div>
                    <div className="text-xs">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                cancel
              </button>
              <button
                className="flex-1 py-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: '#90EE90',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                copy link 🔗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
