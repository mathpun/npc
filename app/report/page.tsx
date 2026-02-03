'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

export default function WeeklyReport() {
  const [showShareModal, setShowShareModal] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const savedProfile = localStorage.getItem('youthai_profile')
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setUserName(profile.name || 'User')
    }
  }, [])

  // Mock weekly report data - uses dynamic userName
  const reportData = {
    weekOf: 'Jan 22 - Jan 28',
    userName: userName || 'User',
  summary: {
    reflections: 12,
    goalsProgress: 67,
    moodTrend: 'improving',
    streakDays: 12,
    minutesReflecting: 45,
  },
  highlights: [
    { text: 'Had a breakthrough about handling stress', emoji: '💡', category: 'insight' },
    { text: 'Set a new goal for learning guitar', emoji: '🎸', category: 'goal' },
    { text: 'Reflected on friendship dynamics', emoji: '👥', category: 'growth' },
  ],
  growthAreas: [
    { area: 'Self-Awareness', score: 78, change: '+5', color: '#DDA0DD' },
    { area: 'Goal Setting', score: 85, change: '+12', color: '#FF69B4' },
    { area: 'Emotional Processing', score: 62, change: '+8', color: '#87CEEB' },
    { area: 'Problem Solving', score: 71, change: '+3', color: '#FFD700' },
  ],
  topTopics: [
    { topic: 'School & Learning', count: 5, emoji: '📚' },
    { topic: 'Friendships', count: 4, emoji: '👋' },
    { topic: 'Future Goals', count: 3, emoji: '🎯' },
  ],
  aiObservation: `${userName || 'This user'} showed great curiosity this week, especially when exploring questions about their future. They're getting better at sitting with uncertainty and considering multiple perspectives before jumping to conclusions. A standout moment was when they realized on their own that their stress about school was actually about something deeper.`,
  goalsUpdate: [
    { goal: 'Learn to code', status: 'on-track', progress: 45 },
    { goal: 'Make new friends', status: 'ahead', progress: 70 },
    { goal: 'Feel more confident', status: 'on-track', progress: 55 },
  ],
  parentNote: "This report is designed to spark conversation, not surveillance. Ask about the highlights - let them share what they're comfortable with.",
  }

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
            <span className="font-bold">📅 {reportData.weekOf}</span>
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
            {reportData.userName}&apos;s reflection journey this week
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Reflections', value: reportData.summary.reflections, emoji: '🧠', color: '#DDA0DD' },
            { label: 'Goals Progress', value: `${reportData.summary.goalsProgress}%`, emoji: '🎯', color: '#90EE90' },
            { label: 'Day Streak', value: reportData.summary.streakDays, emoji: '🔥', color: '#FFA500' },
            { label: 'Minutes', value: reportData.summary.minutesReflecting, emoji: '⏰', color: '#87CEEB' },
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

        {/* Highlights */}
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
            <span className="text-3xl">✨</span>
            <h2 className="text-xl font-bold">week highlights!</h2>
          </div>
          <div className="space-y-3">
            {reportData.highlights.map((highlight, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1)}deg)`,
                }}
              >
                <span className="text-2xl">{highlight.emoji}</span>
                <span className="font-bold">{highlight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Areas */}
        <div
          className="mb-8 p-6 -rotate-1"
          style={{
            backgroundColor: 'white',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">📈</span>
            <h2 className="text-xl font-bold">growth areas</h2>
          </div>
          <div className="space-y-4">
            {reportData.growthAreas.map((area, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{area.area}</span>
                  <div className="flex items-center gap-2">
                    <span>{area.score}%</span>
                    <span
                      className="text-xs px-2 py-1 font-bold"
                      style={{
                        backgroundColor: '#90EE90',
                        border: '2px solid black',
                        borderRadius: '9999px',
                      }}
                    >
                      {area.change}
                    </span>
                  </div>
                </div>
                <div
                  className="h-6 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#f0f0f0', border: '3px solid black' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${area.score}%`,
                      backgroundColor: area.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Observation */}
        <div
          className="mb-8 p-6 rotate-1"
          style={{
            backgroundColor: '#87CEEB',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">👻</span>
            <h2 className="text-xl font-bold">NPC&apos;s observation</h2>
          </div>
          <p
            className="text-sm leading-relaxed p-4"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            {reportData.aiObservation}
          </p>
        </div>

        {/* Goals Update */}
        <div
          className="mb-8 p-6 -rotate-1"
          style={{
            backgroundColor: '#FF69B4',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🎯</span>
            <h2 className="text-xl font-bold">goals this week</h2>
          </div>
          <div className="space-y-3">
            {reportData.goalsUpdate.map((goal, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{goal.status === 'ahead' ? '🌟' : '✅'}</span>
                  <span className="font-bold">{goal.goal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-20 h-3 rounded-full overflow-hidden"
                    style={{ backgroundColor: '#f0f0f0', border: '2px solid black' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${goal.progress}%`,
                        backgroundColor: goal.status === 'ahead' ? '#90EE90' : '#FFD700',
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Topics */}
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
            {reportData.topTopics.map((topic, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2"
                style={{
                  backgroundColor: ['#FF69B4', '#90EE90', '#87CEEB'][i],
                  border: '3px solid black',
                  borderRadius: '9999px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                <span>{topic.emoji}</span>
                <span className="font-bold">{topic.topic}</span>
                <span className="text-xs">({topic.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note for Parents */}
        <div
          className="p-6 rotate-1"
          style={{
            backgroundColor: '#FFD700',
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
            {reportData.parentNote}
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
            <span>detailed conversation content is private to {reportData.userName}</span>
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
                { label: 'Goals Progress', desc: 'Track record on goals', color: '#87CEEB' },
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
