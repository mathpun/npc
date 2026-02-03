'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ACHIEVEMENTS } from '@/lib/db'

interface User {
  id: string
  name: string
  age: number
  interests: string
  goals: string | null
  created_at: string
  last_active: string
  total_activities: number
  chat_count: number
  journal_count: number
  achievement_count: number
  milestone_count: number
  goals_completed: number
}

interface Activity {
  id: number
  user_id: string
  activity_type: string
  activity_data: string | null
  created_at: string
  user_name: string
}

interface DailyActivity {
  date: string
  total: number
  unique_users: number
}

interface ChatMessage {
  id: number
  user_id: string
  role: string
  content: string
  created_at: string
  user_name: string
}

interface Prompt {
  id: number
  user_id: string | null
  prompt_type: string
  title: string
  description: string | null
  emoji: string
  is_global: number
  is_active: number
  created_at: string
  expires_at: string | null
  target_user_name: string | null
  response_count: number
}

interface AdminData {
  stats: {
    totalUsers: number
    activeToday: number
    totalChats: number
    totalJournals: number
  }
  users: User[]
  recentActivity: Activity[]
  dailyActivity: DailyActivity[]
  topTopics: { session_topic: string; count: number }[]
  chatMessages: ChatMessage[]
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Prompt management state
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [showPromptForm, setShowPromptForm] = useState(false)
  const [newPrompt, setNewPrompt] = useState({
    promptType: 'journal',
    title: '',
    description: '',
    emoji: '💭',
    isGlobal: true,
    userId: '',
  })

  const login = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setIsLoggedIn(true)
        localStorage.setItem('adminToken', password)
        fetchData(password)
        fetchPrompts()
      } else {
        setError('wrong password!')
      }
    } catch {
      setError('something went wrong')
    }
    setLoading(false)
  }

  const fetchData = async (token: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setPassword(token)
      setIsLoggedIn(true)
      fetchData(token)
      fetchPrompts()
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('adminToken')
    setIsLoggedIn(false)
    setPassword('')
    setData(null)
  }

  // Prompt management functions
  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts?admin=true')
      const data = await res.json()
      if (data.prompts) {
        setPrompts(data.prompts)
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err)
    }
  }

  const createPrompt = async () => {
    if (!newPrompt.title.trim()) return

    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptType: newPrompt.promptType,
          title: newPrompt.title,
          description: newPrompt.description || null,
          emoji: newPrompt.emoji,
          isGlobal: newPrompt.isGlobal,
          userId: newPrompt.isGlobal ? null : newPrompt.userId,
        }),
      })

      if (res.ok) {
        setNewPrompt({ promptType: 'journal', title: '', description: '', emoji: '💭', isGlobal: true, userId: '' })
        setShowPromptForm(false)
        fetchPrompts()
      }
    } catch (err) {
      console.error('Failed to create prompt:', err)
    }
  }

  const togglePromptActive = async (promptId: number, isActive: boolean) => {
    try {
      await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, isActive: !isActive }),
      })
      fetchPrompts()
    } catch (err) {
      console.error('Failed to toggle prompt:', err)
    }
  }

  const deletePrompt = async (promptId: number) => {
    if (!confirm('Delete this prompt?')) return

    try {
      await fetch(`/api/prompts?promptId=${promptId}`, { method: 'DELETE' })
      fetchPrompts()
    } catch (err) {
      console.error('Failed to delete prompt:', err)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup': return '🌱'
      case 'chat_message': return '💬'
      case 'journal_entry': return '📔'
      case 'goal_created': return '🎯'
      case 'goal_completed': return '🏆'
      case 'page_view': return '👀'
      default: return '📝'
    }
  }

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#7FDBFF' }}>
        {/* Simple nav for login page */}
        <nav
          className="flex items-center justify-between px-4 py-3 border-b-4 border-black border-dashed"
          style={{ backgroundColor: 'white' }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#FFB6C1',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <span className="text-xl">🏠</span>
            <span>home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl">👻</span>
            <span className="text-xl font-bold">NPC Admin</span>
          </div>
          <div style={{ width: '100px' }} />
        </nav>

        <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="p-8 max-w-md w-full"
          style={{
            backgroundColor: 'white',
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '8px 8px 0 black',
          }}
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold">admin login</h1>
            <p className="text-sm text-gray-600 mt-2">enter the secret password</p>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            placeholder="password..."
            className="w-full px-4 py-3 mb-4"
            style={{
              border: '3px solid black',
              borderRadius: '8px',
            }}
          />

          {error && (
            <div className="text-red-500 text-center mb-4 font-bold">{error}</div>
          )}

          <button
            onClick={login}
            disabled={loading}
            className="w-full py-3 font-bold text-lg hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#90EE90',
              border: '3px solid black',
              borderRadius: '8px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            {loading ? 'checking...' : 'let me in!'}
          </button>
        </div>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#7FDBFF' }}>
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#FFB6C1',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <span className="text-xl">🏠</span>
            <span>home</span>
          </Link>
          <span className="text-4xl">👻</span>
          <h1
            className="text-2xl font-bold px-4 py-2"
            style={{
              backgroundColor: '#FFD700',
              border: '3px solid black',
              borderRadius: '8px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            NPC Admin Dashboard
          </h1>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: '#FF69B4',
            border: '3px solid black',
            borderRadius: '8px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading && !data ? (
          <div className="text-center text-2xl animate-pulse">loading the data...</div>
        ) : data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'total users', value: data.stats.totalUsers, color: '#90EE90', emoji: '👥' },
                { label: 'active today', value: data.stats.activeToday, color: '#87CEEB', emoji: '🔥' },
                { label: 'total chats', value: data.stats.totalChats, color: '#FFD700', emoji: '💬' },
                { label: 'journal entries', value: data.stats.totalJournals, color: '#DDA0DD', emoji: '📔' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="p-4 text-center"
                  style={{
                    backgroundColor: stat.color,
                    border: '3px solid black',
                    borderRadius: '8px',
                    boxShadow: '4px 4px 0 black',
                    transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
                  }}
                >
                  <div className="text-3xl mb-2">{stat.emoji}</div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Users List */}
              <div
                className="p-6"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '6px 6px 0 black',
                }}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>👥</span> all users ({data.users.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.users.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">no users yet!</p>
                  ) : (
                    data.users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="p-3 cursor-pointer hover:scale-[1.02] transition-transform"
                        style={{
                          backgroundColor: '#FFB6C1',
                          border: '2px solid black',
                          borderRadius: '8px',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold">{user.name}</span>
                            <span className="text-sm ml-2">({user.age}yo)</span>
                          </div>
                          <div className="flex gap-2 text-sm">
                            <span title="chats">💬{user.chat_count}</span>
                            <span title="journals">📔{user.journal_count}</span>
                            <span title="achievements">🏆{user.achievement_count}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          last active: {formatDate(user.last_active)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div
                className="p-6"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '6px 6px 0 black',
                }}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📜</span> recent activity
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">no activity yet!</p>
                  ) : (
                    data.recentActivity.slice(0, 30).map((activity) => (
                      <div
                        key={activity.id}
                        className="p-2 flex items-center gap-3"
                        style={{
                          backgroundColor: '#F0F0F0',
                          border: '1px solid black',
                          borderRadius: '4px',
                        }}
                      >
                        <span className="text-xl">{getActivityIcon(activity.activity_type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">
                            {activity.user_name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {activity.activity_type.replace(/_/g, ' ')}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(activity.created_at)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div
                className="p-6"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '6px 6px 0 black',
                }}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>💬</span> chat messages
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {!data.chatMessages || data.chatMessages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">no chat messages yet!</p>
                  ) : (
                    data.chatMessages.slice(0, 50).map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3"
                        style={{
                          backgroundColor: msg.role === 'user' ? '#FFE4E1' : '#E0FFE0',
                          border: '1px solid black',
                          borderRadius: '8px',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{msg.role === 'user' ? '👤' : '🤖'}</span>
                          <span className="font-bold text-sm">{msg.user_name}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {msg.content.length > 300 ? msg.content.slice(0, 300) + '...' : msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Daily Activity Chart (simple text version) */}
            <div
              className="mt-6 p-6"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '8px',
                boxShadow: '6px 6px 0 black',
              }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📊</span> last 7 days activity
              </h2>
              <div className="flex gap-2 items-end justify-around h-32">
                {data.dailyActivity.length === 0 ? (
                  <p className="text-gray-500 text-center w-full">no data yet!</p>
                ) : (
                  data.dailyActivity.slice(0, 7).reverse().map((day) => {
                    const maxTotal = Math.max(...data.dailyActivity.map(d => d.total), 1)
                    const height = Math.max((day.total / maxTotal) * 100, 10)
                    return (
                      <div key={day.date} className="flex flex-col items-center">
                        <div className="text-xs font-bold mb-1">{day.total}</div>
                        <div
                          className="w-8 rounded-t"
                          style={{
                            height: `${height}px`,
                            backgroundColor: '#90EE90',
                            border: '2px solid black',
                          }}
                        />
                        <div className="text-xs mt-1">
                          {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Parent Prompts Management */}
            <div
              className="mt-6 p-6"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '8px',
                boxShadow: '6px 6px 0 black',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>💝</span> parent prompts
                </h2>
                <button
                  onClick={() => setShowPromptForm(!showPromptForm)}
                  className="px-4 py-2 font-bold hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: '#90EE90',
                    border: '3px solid black',
                    borderRadius: '8px',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  {showPromptForm ? 'cancel' : '+ new prompt'}
                </button>
              </div>

              {/* New Prompt Form */}
              {showPromptForm && (
                <div
                  className="mb-6 p-4"
                  style={{
                    backgroundColor: '#FFFACD',
                    border: '3px solid black',
                    borderRadius: '8px',
                  }}
                >
                  <h3 className="font-bold mb-3">create new prompt</h3>

                  <div className="space-y-3">
                    {/* Prompt Type */}
                    <div>
                      <label className="text-sm font-bold block mb-1">type</label>
                      <select
                        value={newPrompt.promptType}
                        onChange={(e) => setNewPrompt({ ...newPrompt, promptType: e.target.value })}
                        className="w-full px-3 py-2"
                        style={{ border: '2px solid black', borderRadius: '6px' }}
                      >
                        <option value="journal">📔 Journal - teen writes a response</option>
                        <option value="goal">🎯 Goal - encourage a goal</option>
                        <option value="reflection">🧠 Reflection - deep thinking</option>
                        <option value="challenge">💪 Challenge - try something new</option>
                        <option value="question">❓ Question - conversation starter</option>
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-sm font-bold block mb-1">title (main prompt)</label>
                      <input
                        type="text"
                        value={newPrompt.title}
                        onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                        placeholder="e.g., What are you grateful for today?"
                        className="w-full px-3 py-2"
                        style={{ border: '2px solid black', borderRadius: '6px' }}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-bold block mb-1">description (optional)</label>
                      <textarea
                        value={newPrompt.description}
                        onChange={(e) => setNewPrompt({ ...newPrompt, description: e.target.value })}
                        placeholder="Additional context or encouragement..."
                        rows={2}
                        className="w-full px-3 py-2"
                        style={{ border: '2px solid black', borderRadius: '6px' }}
                      />
                    </div>

                    {/* Emoji */}
                    <div>
                      <label className="text-sm font-bold block mb-1">emoji</label>
                      <div className="flex gap-2 flex-wrap">
                        {['💭', '🌟', '💪', '🎯', '💡', '❤️', '🌈', '🚀', '📚', '🎨'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setNewPrompt({ ...newPrompt, emoji })}
                            className="text-2xl p-2 hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: newPrompt.emoji === emoji ? '#FFD700' : 'white',
                              border: '2px solid black',
                              borderRadius: '8px',
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target */}
                    <div>
                      <label className="text-sm font-bold block mb-1">send to</label>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={newPrompt.isGlobal}
                            onChange={() => setNewPrompt({ ...newPrompt, isGlobal: true })}
                          />
                          <span>all teens (global)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={!newPrompt.isGlobal}
                            onChange={() => setNewPrompt({ ...newPrompt, isGlobal: false })}
                          />
                          <span>specific teen</span>
                        </label>
                      </div>
                      {!newPrompt.isGlobal && data && (
                        <select
                          value={newPrompt.userId}
                          onChange={(e) => setNewPrompt({ ...newPrompt, userId: e.target.value })}
                          className="w-full mt-2 px-3 py-2"
                          style={{ border: '2px solid black', borderRadius: '6px' }}
                        >
                          <option value="">select a teen...</option>
                          {data.users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.age}yo)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <button
                      onClick={createPrompt}
                      disabled={!newPrompt.title.trim() || (!newPrompt.isGlobal && !newPrompt.userId)}
                      className="w-full py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                      style={{
                        backgroundColor: '#FF69B4',
                        border: '3px solid black',
                        borderRadius: '8px',
                        boxShadow: '3px 3px 0 black',
                      }}
                    >
                      send prompt! 💝
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Prompts List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {prompts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">no prompts yet! create one above 👆</p>
                ) : (
                  prompts.map((prompt) => {
                    const typeColors: Record<string, string> = {
                      journal: '#FFD700',
                      goal: '#90EE90',
                      reflection: '#87CEEB',
                      challenge: '#FF69B4',
                      question: '#DDA0DD',
                    }
                    return (
                      <div
                        key={prompt.id}
                        className={`p-3 ${prompt.is_active ? '' : 'opacity-50'}`}
                        style={{
                          backgroundColor: typeColors[prompt.prompt_type] || '#FFD700',
                          border: '2px solid black',
                          borderRadius: '8px',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{prompt.emoji}</span>
                              <span className="font-bold">{prompt.title}</span>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: 'white', border: '1px solid black' }}
                              >
                                {prompt.prompt_type}
                              </span>
                            </div>
                            {prompt.description && (
                              <p className="text-sm mb-1">{prompt.description}</p>
                            )}
                            <div className="text-xs text-gray-700">
                              {prompt.is_global ? '🌍 all teens' : `👤 ${prompt.target_user_name}`}
                              {' • '}
                              {prompt.response_count} responses
                              {' • '}
                              {formatDate(prompt.created_at)}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => togglePromptActive(prompt.id, !!prompt.is_active)}
                              className="px-2 py-1 text-xs font-bold hover:scale-110 transition-transform"
                              style={{
                                backgroundColor: prompt.is_active ? '#90EE90' : '#FFB6C1',
                                border: '2px solid black',
                                borderRadius: '4px',
                              }}
                            >
                              {prompt.is_active ? 'on' : 'off'}
                            </button>
                            <button
                              onClick={() => deletePrompt(prompt.id)}
                              className="px-2 py-1 text-xs font-bold hover:scale-110 transition-transform"
                              style={{
                                backgroundColor: '#FF6B6B',
                                border: '2px solid black',
                                borderRadius: '4px',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              border: '4px solid black',
              borderRadius: '12px',
              boxShadow: '8px 8px 0 black',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User blob */}
            <div className="flex justify-center mb-4">
              <svg width="80" height="100" viewBox="0 0 60 70">
                <ellipse cx="30" cy="45" rx="20" ry="25" fill="#DDA0DD" stroke="black" strokeWidth="3"/>
                <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
                <circle cx="24" cy="18" r="4" fill="black"/>
                <circle cx="36" cy="18" r="4" fill="black"/>
                <circle cx="25" cy="17" r="1.5" fill="white"/>
                <circle cx="37" cy="17" r="1.5" fill="white"/>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-center mb-1">{selectedUser.name}</h2>
            <p className="text-center text-gray-600 mb-4">{selectedUser.age} years old</p>

            <div className="space-y-3">
              <div
                className="p-3"
                style={{ backgroundColor: '#FFB6C1', border: '2px solid black', borderRadius: '8px' }}
              >
                <div className="font-bold text-sm mb-1">interests</div>
                <div>{selectedUser.interests}</div>
              </div>

              {selectedUser.goals && (
                <div
                  className="p-3"
                  style={{ backgroundColor: '#87CEEB', border: '2px solid black', borderRadius: '8px' }}
                >
                  <div className="font-bold text-sm mb-1">goals</div>
                  <div>{selectedUser.goals}</div>
                </div>
              )}

              <div
                className="p-3"
                style={{ backgroundColor: '#90EE90', border: '2px solid black', borderRadius: '8px' }}
              >
                <div className="font-bold text-sm mb-2">stats</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl">💬</div>
                    <div className="font-bold">{selectedUser.chat_count}</div>
                    <div className="text-xs">chats</div>
                  </div>
                  <div>
                    <div className="text-2xl">📔</div>
                    <div className="font-bold">{selectedUser.journal_count}</div>
                    <div className="text-xs">journals</div>
                  </div>
                  <div>
                    <div className="text-2xl">🏆</div>
                    <div className="font-bold">{selectedUser.achievement_count}</div>
                    <div className="text-xs">badges</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center">
                joined: {formatDate(selectedUser.created_at)}
                <br />
                last active: {formatDate(selectedUser.last_active)}
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-4 py-2 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#FFD700',
                border: '3px solid black',
                borderRadius: '8px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
