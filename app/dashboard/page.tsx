'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Goals from '@/components/Goals'
import ParentPrompts from '@/components/ParentPrompts'
import { ACHIEVEMENTS } from '@/lib/db'

interface UserStats {
  user: {
    id: string
    name: string
    age: number
    interests: string
    goals: string
    createdAt: string
  }
  stats: {
    streak: number
    totalReflections: number
    journalEntries: number
    goalsCompleted: number
    level: number
    xp: number
    nextLevelXp: number
  }
  achievements: { achievement_key: string; unlocked_at: string }[]
  milestones: any[]
  goals: any[]
}

const ACHIEVEMENT_INFO: Record<string, { title: string; desc: string; icon: string }> = {
  first_steps: { title: 'First Steps', desc: 'Started your journey', icon: '🌱' },
  first_chat: { title: 'First Chat', desc: 'Had your first conversation', icon: '💬' },
  deep_thinker: { title: 'Deep Thinker', desc: 'Completed 10 reflections', icon: '🧠' },
  journal_keeper: { title: 'Journal Keeper', desc: 'Saved 5 journal entries', icon: '📔' },
  goal_setter: { title: 'Goal Setter', desc: 'Set your first goal', icon: '🎯' },
  goal_getter: { title: 'Goal Getter', desc: 'Completed a goal', icon: '🏆' },
  streak_3: { title: 'On Fire', desc: '3 day streak', icon: '🔥' },
  streak_7: { title: 'Week Warrior', desc: '7 day streak', icon: '⚡' },
  streak_30: { title: 'Monthly Master', desc: '30 day streak', icon: '👑' },
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<UserStats | null>(null)
  const [showPrompts, setShowPrompts] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('npc_user_id')
    const profile = localStorage.getItem('youthai_profile')

    if (!userId || !profile) {
      router.push('/login')
      return
    }

    // Fetch user stats
    fetch(`/api/stats?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          router.push('/login')
        } else {
          setData(data)
        }
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#7FDBFF' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">👻</div>
          <p className="text-xl font-bold">loading your journey...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { user, stats, achievements, milestones } = data

  // Build life map from milestones
  const lifeMapNodes = milestones.map((m, i) => ({
    id: m.id,
    title: m.title,
    date: new Date(m.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    type: m.milestone_type,
    completed: true,
    color: m.color || ['#FF69B4', '#FFD700', '#90EE90', '#87CEEB', '#DDA0DD'][i % 5],
  }))

  // Add placeholder future milestones if user has few
  if (lifeMapNodes.length < 3) {
    lifeMapNodes.push(
      { id: 'future-1', title: 'First Deep Reflection', date: 'Coming soon', type: 'milestone', completed: false, color: '#FFD700' },
      { id: 'future-2', title: 'Week 1 Check-in', date: 'Coming soon', type: 'checkpoint', completed: false, color: '#90EE90' },
    )
  }

  // Weekly insights based on real stats
  const weeklyInsights = [
    { label: 'Reflections', value: stats.totalReflections, change: stats.totalReflections > 0 ? `${stats.totalReflections} total` : 'start chatting!', emoji: '🧠', color: '#DDA0DD' },
    { label: 'Journal', value: stats.journalEntries, change: stats.journalEntries > 0 ? `${stats.journalEntries} entries` : 'save insights!', emoji: '📔', color: '#90EE90' },
    { label: 'Streak', value: stats.streak, change: stats.streak > 0 ? `${stats.streak} days` : 'start today!', emoji: '🔥', color: '#FF69B4' },
    { label: 'Goals Done', value: stats.goalsCompleted, change: stats.goalsCompleted > 0 ? 'nice work!' : 'set a goal!', emoji: '🎯', color: '#FFD700' },
  ]

  // Build achievements list
  const unlockedKeys = achievements.map(a => a.achievement_key)
  const allAchievements = Object.entries(ACHIEVEMENT_INFO).map(([key, info]) => ({
    key,
    ...info,
    unlocked: unlockedKeys.includes(key),
  }))

  return (
    <div className="min-h-screen font-hand text-black" style={{ backgroundColor: '#7FDBFF' }}>
      {/* Parent Prompts Modal */}
      {showPrompts && <ParentPrompts userId={user.id} />}

      {/* Doodle decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 text-4xl rotate-12">☀️</div>
        <div className="absolute top-40 left-10 text-3xl -rotate-12">🌸</div>
        <div className="absolute bottom-40 right-20 text-3xl rotate-6">✨</div>
        <div className="absolute bottom-20 left-10 text-4xl -rotate-6">🌈</div>
      </div>

      {/* Nav */}
      <NavBar />

      {/* Stats bar */}
      <div className="relative z-10 px-6 py-3 border-b-4 border-black border-dashed" style={{ backgroundColor: '#98FB98' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          {/* Level badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rotate-2"
            style={{
              backgroundColor: '#FFD700',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <span className="text-xl">👑</span>
            <span className="font-bold">Lvl {stats.level}</span>
          </div>

          {/* Streak */}
          <div
            className="flex items-center gap-2 px-4 py-2 -rotate-1"
            style={{
              backgroundColor: '#FFA500',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <span className="text-xl">🔥</span>
            <span className="font-bold">{stats.streak} days</span>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 pb-24" style={{  }}>
        {/* Welcome Section */}
        <div className="mb-8 flex items-center gap-4">
          {/* User blob */}
          <svg width="80" height="90" viewBox="0 0 60 70">
            <ellipse cx="30" cy="45" rx="20" ry="25" fill="#DDA0DD" stroke="black" strokeWidth="3"/>
            <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
            <circle cx="24" cy="18" r="4" fill="black"/>
            <circle cx="36" cy="18" r="4" fill="black"/>
            <circle cx="25" cy="17" r="1.5" fill="white"/>
            <circle cx="37" cy="17" r="1.5" fill="white"/>
            <path d="M24 28 Q30 32 36 28" stroke="black" strokeWidth="2" fill="none"/>
            <polygon points="30,2 24,15 36,15" fill="#FFD700" stroke="black" strokeWidth="2"/>
          </svg>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              hey {user.name}! <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-lg">here&apos;s your growth journey so far</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div
          className="mb-8 p-4 rotate-1"
          style={{
            backgroundColor: '#DDA0DD',
            border: '4px solid black',
            borderRadius: '16px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="font-bold text-lg">Level {stats.level}</span>
            </div>
            <span className="font-bold">{stats.xp} / {stats.nextLevelXp} XP</span>
          </div>
          <div
            className="h-6 rounded-full overflow-hidden"
            style={{ backgroundColor: 'white', border: '3px solid black' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min((stats.xp / stats.nextLevelXp) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #FF69B4, #FFD700, #90EE90, #87CEEB)',
              }}
            />
          </div>
        </div>

        {/* Weekly Insights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {weeklyInsights.map((insight, i) => (
            <div
              key={i}
              className="p-4 text-center hover:scale-105 transition-transform"
              style={{
                backgroundColor: insight.color,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '4px 4px 0 black',
                transform: `rotate(${(i % 2 === 0 ? -2 : 2)}deg)`,
              }}
            >
              <div className="text-3xl mb-2">{insight.emoji}</div>
              <div className="text-2xl font-bold">{insight.value}</div>
              <div className="text-sm font-bold">{insight.label}</div>
              <div
                className="text-xs mt-1 inline-block px-2 py-1 rounded-full"
                style={{ backgroundColor: 'white', border: '2px solid black' }}
              >
                {insight.change}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Life Map - Main Section */}
          <div className="lg:col-span-2">
            <div
              className="p-6 -rotate-1"
              style={{
                backgroundColor: '#98FB98',
                border: '4px solid black',
                borderRadius: '20px',
                boxShadow: '8px 8px 0 black',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🗺️</span>
                  <div>
                    <h2 className="text-xl font-bold">Your Life Map</h2>
                    <p className="text-sm">your journey visualized!</p>
                  </div>
                </div>
                <Link
                  href="/moltbook"
                  className="px-4 py-2 font-bold hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: 'white',
                    border: '3px solid black',
                    borderRadius: '9999px',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  View Full Map
                </Link>
              </div>

              {/* Candyland-style Path */}
              <div className="relative py-4">
                {/* Path - winding road */}
                <div
                  className="absolute left-8 top-0 bottom-0 w-4 rounded-full"
                  style={{
                    background: 'repeating-linear-gradient(to bottom, #FF69B4 0px, #FF69B4 20px, #FFD700 20px, #FFD700 40px, #90EE90 40px, #90EE90 60px, #87CEEB 60px, #87CEEB 80px)',
                    border: '2px solid black',
                  }}
                />

                {/* Nodes */}
                <div className="space-y-4">
                  {lifeMapNodes.length === 0 ? (
                    <div
                      className="p-6 text-center"
                      style={{
                        backgroundColor: 'white',
                        border: '3px solid black',
                        borderRadius: '12px',
                      }}
                    >
                      <p className="text-lg font-bold mb-2">Your journey starts here! 🌟</p>
                      <p className="text-sm">Start chatting to unlock milestones</p>
                      <Link
                        href="/chat"
                        className="inline-block mt-4 px-6 py-2 font-bold hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: '#90EE90',
                          border: '3px solid black',
                          borderRadius: '9999px',
                          boxShadow: '3px 3px 0 black',
                        }}
                      >
                        Start Chatting →
                      </Link>
                    </div>
                  ) : (
                    lifeMapNodes.map((node, i) => (
                      <div key={node.id} className="relative flex items-center gap-4 pl-2">
                        {/* Node dot */}
                        <div
                          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl ${node.completed ? '' : 'opacity-50'}`}
                          style={{
                            backgroundColor: node.color,
                            border: '3px solid black',
                            boxShadow: node.completed ? '3px 3px 0 black' : 'none',
                          }}
                        >
                          {node.completed ? '⭐' : '○'}
                        </div>

                        {/* Node content */}
                        <div
                          className={`flex-1 p-3 ${node.completed ? '' : 'opacity-50'}`}
                          style={{
                            backgroundColor: 'white',
                            border: '3px solid black',
                            borderRadius: '12px',
                            boxShadow: node.completed ? '4px 4px 0 black' : 'none',
                            transform: `rotate(${(i % 2 === 0 ? -1 : 1)}deg)`,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold">{node.title}</h3>
                              <p className="text-xs">{node.date}</p>
                            </div>
                            <span
                              className="px-2 py-1 text-xs font-bold rounded-full"
                              style={{
                                backgroundColor: node.color,
                                border: '2px solid black',
                              }}
                            >
                              {node.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Goals */}
            <div
              className="p-6 rotate-1"
              style={{
                backgroundColor: '#FF69B4',
                border: '4px solid black',
                borderRadius: '20px',
                boxShadow: '6px 6px 0 black',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎯</span>
                <h2 className="text-lg font-bold">My Goals</h2>
              </div>

              <Goals userId={user.id} onGoalChange={() => window.location.reload()} />
            </div>

            {/* Achievements */}
            <div
              className="p-6 -rotate-1"
              style={{
                backgroundColor: '#FFD700',
                border: '4px solid black',
                borderRadius: '20px',
                boxShadow: '6px 6px 0 black',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏆</span>
                <h2 className="text-lg font-bold">Achievements</h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {allAchievements.slice(0, 6).map((achievement) => (
                  <div
                    key={achievement.key}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 ${achievement.unlocked ? '' : 'opacity-40'}`}
                    style={{
                      backgroundColor: 'white',
                      border: '3px solid black',
                      boxShadow: achievement.unlocked ? '3px 3px 0 black' : 'none',
                    }}
                    title={achievement.desc}
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <span className="text-[9px] text-center font-bold mt-1">{achievement.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Report CTA */}
            <div
              className="p-6 rotate-2"
              style={{
                backgroundColor: '#87CEEB',
                border: '4px solid black',
                borderRadius: '20px',
                boxShadow: '6px 6px 0 black',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📊</span>
                <h3 className="font-bold">Weekly Report</h3>
              </div>
              <p className="text-sm mb-4">
                See your growth insights and share with someone you trust
              </p>
              <Link
                href="/report"
                className="block w-full py-3 text-center font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                View Report
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Nav - crayon style */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 p-3"
        style={{
          backgroundColor: 'white',
          borderTop: '4px solid black',
        }}
      >
        <div className="max-w-md mx-auto flex justify-around">
          {[
            { emoji: '🗺️', label: 'journey', active: true, href: '/dashboard' },
            { emoji: '💭', label: 'chat', active: false, href: '/chat' },
            { emoji: '🌍', label: 'world', active: false, href: '/moltbook' },
            { emoji: '📊', label: 'report', active: false, href: '/report' },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`flex flex-col items-center px-4 py-2 rounded-xl`}
              style={{
                backgroundColor: item.active ? '#FFD700' : 'transparent',
                border: item.active ? '2px solid black' : 'none',
              }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
