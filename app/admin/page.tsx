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

interface DailyCheckin {
  id: number
  user_id: string
  checkin_date: string
  questions: string
  responses: string
  mood: string | null
  ai_summary: string | null
  created_at: string
  user_name: string
  user_age: number
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

interface UserDetailData {
  user: User
  chatMessages: { id: number; role: string; content: string; created_at: string }[]
  chatSessions: { id: number; session_topic: string; created_at: string; message_count: number }[]
  journalEntries: { id: number; title: string; content: string; mood: string | null; created_at: string }[]
  dailyCheckins: { id: number; checkin_date: string; questions: string; responses: string; mood: string | null; ai_summary: string | null; created_at: string }[]
  achievements: { id: number; achievement_type: string; earned_at: string }[]
  goals: { id: number; goal_text: string; status: string; created_at: string; completed_at: string | null }[]
  activityLog: { id: number; activity_type: string; activity_data: string | null; created_at: string }[]
  flaggedMessages: { id: number; content: string; flag_type: string; severity: string; created_at: string }[]
  activityByDay: { date: string; total: number; chats: number; journals: number }[]
  parentConnections: { id: number; parent_email: string; parent_name: string; connection_status: string; created_at: string }[]
  parentReports: { id: number; week_start: string; week_end: string; status: string; created_at: string }[]
}

interface FlaggedMessage {
  id: number
  message_id: number | null
  user_id: string
  content: string
  flag_type: string
  flag_reason: string
  severity: string
  reviewed: number
  reviewed_at: string | null
  created_at: string
  user_name: string
  user_age: number
}

interface TimeSeriesData {
  date: string
  total: number
}

interface AdminData {
  stats: {
    totalUsers: number
    activeToday: number
    activeThisWeek: number
    activeThisMonth: number
    totalChats: number
    totalJournals: number
    totalCheckins: number
    newUsersToday: number
    newUsersThisWeek: number
    avgMessagesPerUser: number
    returningUsers: number
    retentionRate: number
    unreviewedFlags: number
  }
  users: User[]
  recentActivity: Activity[]
  dailyActivity: DailyActivity[]
  chatsPerDay: TimeSeriesData[]
  signupsPerDay: TimeSeriesData[]
  checkinsPerDay: TimeSeriesData[]
  topTopics: { session_topic: string; count: number }[]
  chatMessages: ChatMessage[]
  dailyCheckins: DailyCheckin[]
  flaggedMessages: FlaggedMessage[]
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userDetail, setUserDetail] = useState<UserDetailData | null>(null)
  const [userDetailLoading, setUserDetailLoading] = useState(false)
  const [userDetailTab, setUserDetailTab] = useState<'overview' | 'chats' | 'journals' | 'checkins' | 'activity'>('overview')

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

  const markFlagReviewed = async (flagId: number, reviewed: boolean) => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    try {
      await fetch('/api/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ flagId, reviewed }),
      })
      fetchData(token)
    } catch (err) {
      console.error('Failed to update flag:', err)
    }
  }

  const fetchUserDetail = async (userId: string) => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    setUserDetailLoading(true)
    setUserDetailTab('overview')
    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUserDetail(data)
      }
    } catch (err) {
      console.error('Failed to fetch user detail:', err)
    }
    setUserDetailLoading(false)
  }

  const openUserDetail = (user: User) => {
    setSelectedUser(user)
    fetchUserDetail(user.id)
  }

  const closeUserDetail = () => {
    setSelectedUser(null)
    setUserDetail(null)
  }

  // Format date in California time for admin dashboard
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' }) + ' ' +
           date.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit' })
  }

  // Get current California time for display
  const getCaliforniaTime = () => {
    return new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
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
            <span className="text-xl font-bold">npc admin</span>
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
            npc admin Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-2 text-sm font-bold"
            style={{
              backgroundColor: '#87CEEB',
              border: '2px solid black',
              borderRadius: '8px',
            }}
          >
            🌴 {getCaliforniaTime()}
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
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading && !data ? (
          <div className="text-center text-2xl animate-pulse">loading the data...</div>
        ) : data ? (
          <>
            {/* Key Metrics - DAU/WAU/MAU */}
            <div
              className="mb-6 p-6"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '6px 6px 0 black',
              }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📈</span> Key Metrics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'DAU (today)', value: data.stats.activeToday, color: '#FF69B4', emoji: '📊' },
                  { label: 'WAU (7 days)', value: data.stats.activeThisWeek, color: '#87CEEB', emoji: '📈' },
                  { label: 'MAU (30 days)', value: data.stats.activeThisMonth, color: '#90EE90', emoji: '🚀' },
                  { label: 'Retention', value: `${data.stats.retentionRate}%`, color: '#FFD700', emoji: '🔄' },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="p-4 text-center"
                    style={{
                      backgroundColor: stat.color,
                      border: '3px solid black',
                      borderRadius: '8px',
                      boxShadow: '4px 4px 0 black',
                    }}
                  >
                    <div className="text-2xl mb-1">{stat.emoji}</div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-xs font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flagged Content Alert Section */}
            {data.flaggedMessages && data.flaggedMessages.length > 0 && (
              <div
                className="mb-6 p-6"
                style={{
                  backgroundColor: '#FFE4E1',
                  border: '3px solid #FF0000',
                  borderRadius: '12px',
                  boxShadow: '6px 6px 0 #8B0000',
                }}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🚨</span> Content Safety Alerts
                  {data.stats.unreviewedFlags > 0 && (
                    <span
                      className="px-3 py-1 text-sm rounded-full animate-pulse"
                      style={{ backgroundColor: '#FF0000', color: 'white', border: '2px solid black' }}
                    >
                      {data.stats.unreviewedFlags} unreviewed
                    </span>
                  )}
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.flaggedMessages.map((flag) => {
                    const severityColors: Record<string, { bg: string; border: string }> = {
                      critical: { bg: '#FF0000', border: '#8B0000' },
                      high: { bg: '#FF6B6B', border: '#CC0000' },
                      medium: { bg: '#FFD700', border: '#B8860B' },
                      low: { bg: '#90EE90', border: '#228B22' },
                    }
                    const colors = severityColors[flag.severity] || severityColors.medium
                    const typeEmojis: Record<string, string> = {
                      self_harm: '💔',
                      violence: '⚠️',
                      sexual_content: '🔞',
                      abuse: '🆘',
                      dangerous_behavior: '⚡',
                      bullying: '😢',
                    }

                    return (
                      <div
                        key={flag.id}
                        className={`p-4 ${flag.reviewed ? 'opacity-50' : ''}`}
                        style={{
                          backgroundColor: 'white',
                          border: `3px solid ${colors.border}`,
                          borderRadius: '8px',
                          borderLeft: `8px solid ${colors.bg}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xl">{typeEmojis[flag.flag_type] || '⚠️'}</span>
                              <span
                                className="px-2 py-0.5 text-xs font-bold rounded uppercase"
                                style={{ backgroundColor: colors.bg, color: flag.severity === 'critical' ? 'white' : 'black' }}
                              >
                                {flag.severity}
                              </span>
                              <span className="font-bold">{flag.user_name}</span>
                              <span className="text-sm text-gray-600">({flag.user_age}yo)</span>
                              <span className="text-xs text-gray-500">{formatDate(flag.created_at)}</span>
                            </div>
                            <div
                              className="p-2 mb-2 text-sm rounded"
                              style={{ backgroundColor: '#FFF5F5', border: '1px solid #FFB6C1' }}
                            >
                              {flag.content.length > 300 ? flag.content.slice(0, 300) + '...' : flag.content}
                            </div>
                            <div className="text-xs text-gray-600">
                              <strong>Reason:</strong> {flag.flag_reason}
                            </div>
                          </div>
                          <button
                            onClick={() => markFlagReviewed(flag.id, !flag.reviewed)}
                            className="px-3 py-2 text-sm font-bold hover:scale-105 transition-transform whitespace-nowrap"
                            style={{
                              backgroundColor: flag.reviewed ? '#90EE90' : '#FFD700',
                              border: '2px solid black',
                              borderRadius: '6px',
                            }}
                          >
                            {flag.reviewed ? '✓ Reviewed' : 'Mark Reviewed'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
              {[
                { label: 'total users', value: data.stats.totalUsers, color: '#90EE90', emoji: '👥' },
                { label: 'new today', value: data.stats.newUsersToday, color: '#FFB6C1', emoji: '🌱' },
                { label: 'new this week', value: data.stats.newUsersThisWeek, color: '#DDA0DD', emoji: '📅' },
                { label: 'total chats', value: data.stats.totalChats, color: '#FFD700', emoji: '💬' },
                { label: 'check-ins', value: data.stats.totalCheckins, color: '#87CEEB', emoji: '📝' },
                { label: 'avg msgs/user', value: data.stats.avgMessagesPerUser, color: '#FFA07A', emoji: '📊' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="p-3 text-center"
                  style={{
                    backgroundColor: stat.color,
                    border: '2px solid black',
                    borderRadius: '8px',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  <div className="text-2xl mb-1">{stat.emoji}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs">{stat.label}</div>
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
                        onClick={() => openUserDetail(user)}
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

              {/* Daily Check-ins */}
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
                  <span>📝</span> daily check-ins
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {!data.dailyCheckins || data.dailyCheckins.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">no check-ins yet!</p>
                  ) : (
                    data.dailyCheckins.map((checkin) => {
                      let questions: string[] = []
                      let responses: string[] = []
                      try {
                        questions = typeof checkin.questions === 'string'
                          ? JSON.parse(checkin.questions)
                          : checkin.questions
                        responses = typeof checkin.responses === 'string'
                          ? JSON.parse(checkin.responses)
                          : checkin.responses
                      } catch {
                        // parsing failed
                      }

                      const moodEmojis: Record<string, string> = {
                        great: '😊',
                        good: '🙂',
                        okay: '😐',
                        bad: '😔',
                        rough: '😢',
                      }

                      return (
                        <div
                          key={checkin.id}
                          className="p-4"
                          style={{
                            backgroundColor: '#F0FFF0',
                            border: '2px solid black',
                            borderRadius: '12px',
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{checkin.user_name}</span>
                              <span className="text-sm text-gray-600">({checkin.user_age}yo)</span>
                              {checkin.mood && (
                                <span
                                  className="px-2 py-0.5 text-sm rounded-full"
                                  style={{ backgroundColor: '#FFD700', border: '1px solid black' }}
                                >
                                  {moodEmojis[checkin.mood] || '😐'} {checkin.mood}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(checkin.created_at)}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {questions.map((q, i) => (
                              <div key={i} className="space-y-1">
                                <div
                                  className="text-sm font-bold p-2 rounded"
                                  style={{ backgroundColor: '#E6E6FA' }}
                                >
                                  Q: {q}
                                </div>
                                <div
                                  className="text-sm p-2 rounded"
                                  style={{ backgroundColor: 'white', border: '1px solid #ddd' }}
                                >
                                  A: {responses[i] || '(no response)'}
                                </div>
                              </div>
                            ))}
                          </div>

                          {checkin.ai_summary && (
                            <div
                              className="mt-3 p-2 text-sm"
                              style={{
                                backgroundColor: '#FFFACD',
                                border: '1px dashed black',
                                borderRadius: '8px',
                              }}
                            >
                              <span className="font-bold">AI Summary:</span> {checkin.ai_summary}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Chats Per Day Chart */}
              <div
                className="p-6"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '6px 6px 0 black',
                }}
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>💬</span> Chats Per Day (14 days)
                </h2>
                <div className="flex gap-1 items-end justify-around h-28">
                  {!data.chatsPerDay || data.chatsPerDay.length === 0 ? (
                    <p className="text-gray-500 text-center w-full">no data yet!</p>
                  ) : (
                    data.chatsPerDay.slice(0, 14).reverse().map((day) => {
                      const maxTotal = Math.max(...data.chatsPerDay.map(d => d.total), 1)
                      const height = Math.max((day.total / maxTotal) * 100, 8)
                      return (
                        <div key={day.date} className="flex flex-col items-center flex-1">
                          <div className="text-xs font-bold mb-1">{day.total}</div>
                          <div
                            className="w-full max-w-6 rounded-t"
                            style={{
                              height: `${height}px`,
                              backgroundColor: '#FFD700',
                              border: '1px solid black',
                            }}
                          />
                          <div className="text-xs mt-1 truncate w-full text-center">
                            {new Date(day.date).getDate()}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* DAU Chart */}
              <div
                className="p-6"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '6px 6px 0 black',
                }}
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>👥</span> Daily Active Users (14 days)
                </h2>
                <div className="flex gap-1 items-end justify-around h-28">
                  {data.dailyActivity.length === 0 ? (
                    <p className="text-gray-500 text-center w-full">no data yet!</p>
                  ) : (
                    data.dailyActivity.slice(0, 14).reverse().map((day) => {
                      const maxTotal = Math.max(...data.dailyActivity.map(d => d.unique_users), 1)
                      const height = Math.max((day.unique_users / maxTotal) * 100, 8)
                      return (
                        <div key={day.date} className="flex flex-col items-center flex-1">
                          <div className="text-xs font-bold mb-1">{day.unique_users}</div>
                          <div
                            className="w-full max-w-6 rounded-t"
                            style={{
                              height: `${height}px`,
                              backgroundColor: '#87CEEB',
                              border: '1px solid black',
                            }}
                          />
                          <div className="text-xs mt-1 truncate w-full text-center">
                            {new Date(day.date).getDate()}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Signups Per Day Chart */}
              <div
                className="p-6"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '6px 6px 0 black',
                }}
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>🌱</span> New Signups (14 days)
                </h2>
                <div className="flex gap-1 items-end justify-around h-28">
                  {!data.signupsPerDay || data.signupsPerDay.length === 0 ? (
                    <p className="text-gray-500 text-center w-full">no signups yet!</p>
                  ) : (
                    data.signupsPerDay.slice(0, 14).reverse().map((day) => {
                      const maxTotal = Math.max(...data.signupsPerDay.map(d => d.total), 1)
                      const height = Math.max((day.total / maxTotal) * 100, 8)
                      return (
                        <div key={day.date} className="flex flex-col items-center flex-1">
                          <div className="text-xs font-bold mb-1">{day.total}</div>
                          <div
                            className="w-full max-w-6 rounded-t"
                            style={{
                              height: `${height}px`,
                              backgroundColor: '#90EE90',
                              border: '1px solid black',
                            }}
                          />
                          <div className="text-xs mt-1 truncate w-full text-center">
                            {new Date(day.date).getDate()}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Check-ins Per Day Chart */}
              <div
                className="p-6"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '6px 6px 0 black',
                }}
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>📝</span> Check-ins (14 days)
                </h2>
                <div className="flex gap-1 items-end justify-around h-28">
                  {!data.checkinsPerDay || data.checkinsPerDay.length === 0 ? (
                    <p className="text-gray-500 text-center w-full">no check-ins yet!</p>
                  ) : (
                    data.checkinsPerDay.slice(0, 14).reverse().map((day) => {
                      const maxTotal = Math.max(...data.checkinsPerDay.map(d => d.total), 1)
                      const height = Math.max((day.total / maxTotal) * 100, 8)
                      return (
                        <div key={day.date} className="flex flex-col items-center flex-1">
                          <div className="text-xs font-bold mb-1">{day.total}</div>
                          <div
                            className="w-full max-w-6 rounded-t"
                            style={{
                              height: `${height}px`,
                              backgroundColor: '#DDA0DD',
                              border: '1px solid black',
                            }}
                          />
                          <div className="text-xs mt-1 truncate w-full text-center">
                            {new Date(day.date).getDate()}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
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

      {/* User Detail Panel */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeUserDetail}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'white',
              border: '4px solid black',
              borderRadius: '12px',
              boxShadow: '8px 8px 0 black',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* User blob */}
                <svg width="60" height="75" viewBox="0 0 60 70">
                  <ellipse cx="30" cy="45" rx="20" ry="25" fill="#DDA0DD" stroke="black" strokeWidth="3"/>
                  <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
                  <circle cx="24" cy="18" r="4" fill="black"/>
                  <circle cx="36" cy="18" r="4" fill="black"/>
                  <circle cx="25" cy="17" r="1.5" fill="white"/>
                  <circle cx="37" cy="17" r="1.5" fill="white"/>
                </svg>
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <p className="text-gray-600">{selectedUser.age} years old</p>
                  <p className="text-xs text-gray-500">
                    joined: {formatDate(selectedUser.created_at)} • last active: {formatDate(selectedUser.last_active)}
                  </p>
                </div>
              </div>
              <button
                onClick={closeUserDetail}
                className="px-4 py-2 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: '#FF69B4',
                  border: '3px solid black',
                  borderRadius: '8px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                ✕ close
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'chats', value: selectedUser.chat_count, color: '#FFD700', emoji: '💬' },
                { label: 'journals', value: selectedUser.journal_count, color: '#90EE90', emoji: '📔' },
                { label: 'achievements', value: selectedUser.achievement_count, color: '#87CEEB', emoji: '🏆' },
                { label: 'goals done', value: selectedUser.goals_completed, color: '#FFB6C1', emoji: '🎯' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 text-center"
                  style={{
                    backgroundColor: stat.color,
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  <div className="text-xl">{stat.emoji}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs font-bold">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { id: 'overview', label: '📊 Overview', color: '#FFD700' },
                { id: 'chats', label: '💬 Chats', color: '#87CEEB' },
                { id: 'journals', label: '📔 Journals', color: '#90EE90' },
                { id: 'checkins', label: '📝 Check-ins', color: '#DDA0DD' },
                { id: 'activity', label: '📜 Activity', color: '#FFB6C1' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setUserDetailTab(tab.id as typeof userDetailTab)}
                  className="px-4 py-2 font-bold hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: userDetailTab === tab.id ? tab.color : 'white',
                    border: '2px solid black',
                    borderRadius: '8px',
                    boxShadow: userDetailTab === tab.id ? '3px 3px 0 black' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {userDetailLoading ? (
              <div className="text-center py-8 animate-pulse">loading user data...</div>
            ) : userDetail ? (
              <div className="min-h-[300px]">
                {/* Overview Tab */}
                {userDetailTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Interests & Goals */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div
                        className="p-4"
                        style={{ backgroundColor: '#FFB6C1', border: '2px solid black', borderRadius: '8px' }}
                      >
                        <div className="font-bold mb-2">🎨 Interests</div>
                        <div>{selectedUser.interests || 'No interests set'}</div>
                      </div>
                      <div
                        className="p-4"
                        style={{ backgroundColor: '#87CEEB', border: '2px solid black', borderRadius: '8px' }}
                      >
                        <div className="font-bold mb-2">🎯 Goals</div>
                        <div>{selectedUser.goals || 'No goals set'}</div>
                      </div>
                    </div>

                    {/* Activity Chart */}
                    {userDetail.activityByDay && userDetail.activityByDay.length > 0 && (
                      <div
                        className="p-4"
                        style={{ backgroundColor: '#FFFACD', border: '2px solid black', borderRadius: '8px' }}
                      >
                        <div className="font-bold mb-3">📈 Activity (Last 30 Days)</div>
                        <div className="flex gap-1 items-end justify-around h-24">
                          {userDetail.activityByDay.slice(0, 14).reverse().map((day) => {
                            const maxTotal = Math.max(...userDetail.activityByDay.map(d => d.total), 1)
                            const height = Math.max((day.total / maxTotal) * 80, 8)
                            return (
                              <div key={day.date} className="flex flex-col items-center flex-1">
                                <div className="text-xs font-bold mb-1">{day.total}</div>
                                <div
                                  className="w-full max-w-4 rounded-t"
                                  style={{
                                    height: `${height}px`,
                                    backgroundColor: '#90EE90',
                                    border: '1px solid black',
                                  }}
                                />
                                <div className="text-xs mt-1">
                                  {new Date(day.date).getDate()}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Parent Connections */}
                    {userDetail.parentConnections && userDetail.parentConnections.length > 0 && (
                      <div
                        className="p-4"
                        style={{ backgroundColor: '#E8F5E9', border: '2px solid black', borderRadius: '8px' }}
                      >
                        <div className="font-bold mb-2">👨‍👩‍👧 Parent Connections</div>
                        <div className="space-y-2">
                          {userDetail.parentConnections.map((pc) => (
                            <div key={pc.id} className="flex items-center justify-between text-sm">
                              <span>{pc.parent_name} ({pc.parent_email})</span>
                              <span
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: pc.connection_status === 'active' ? '#90EE90' : '#FFB6C1',
                                  border: '1px solid black',
                                }}
                              >
                                {pc.connection_status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {userDetail.achievements && userDetail.achievements.length > 0 && (
                      <div
                        className="p-4"
                        style={{ backgroundColor: '#FCE4EC', border: '2px solid black', borderRadius: '8px' }}
                      >
                        <div className="font-bold mb-2">🏆 Achievements ({userDetail.achievements.length})</div>
                        <div className="flex flex-wrap gap-2">
                          {userDetail.achievements.map((a) => {
                            const achievement = ACHIEVEMENTS.find(ach => ach.id === a.achievement_type)
                            return (
                              <div
                                key={a.id}
                                className="px-3 py-1 text-sm"
                                style={{ backgroundColor: '#FFD700', border: '1px solid black', borderRadius: '20px' }}
                                title={achievement?.description}
                              >
                                {achievement?.emoji || '🏅'} {achievement?.name || a.achievement_type}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Flagged Messages */}
                    {userDetail.flaggedMessages && userDetail.flaggedMessages.length > 0 && (
                      <div
                        className="p-4"
                        style={{ backgroundColor: '#FFEBEE', border: '2px solid #FF0000', borderRadius: '8px' }}
                      >
                        <div className="font-bold mb-2 text-red-600">🚨 Flagged Content ({userDetail.flaggedMessages.length})</div>
                        <div className="space-y-2">
                          {userDetail.flaggedMessages.slice(0, 5).map((fm) => (
                            <div
                              key={fm.id}
                              className="p-2 text-sm rounded"
                              style={{ backgroundColor: 'white', border: '1px solid #FFB6C1' }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="px-2 py-0.5 text-xs rounded"
                                  style={{
                                    backgroundColor: fm.severity === 'critical' ? '#FF0000' : fm.severity === 'high' ? '#FF6B6B' : '#FFD700',
                                    color: fm.severity === 'critical' ? 'white' : 'black',
                                  }}
                                >
                                  {fm.severity}
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(fm.created_at)}</span>
                              </div>
                              <div className="text-gray-700">{fm.content.slice(0, 200)}{fm.content.length > 200 ? '...' : ''}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Chats Tab */}
                {userDetailTab === 'chats' && (
                  <div
                    className="p-4 space-y-2 max-h-[400px] overflow-y-auto"
                    style={{ backgroundColor: '#F0F8FF', border: '2px solid black', borderRadius: '8px' }}
                  >
                    {userDetail.chatMessages.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">no chat messages yet</p>
                    ) : (
                      userDetail.chatMessages.map((msg) => (
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
                            <span>{msg.role === 'user' ? '👤' : '🤖'}</span>
                            <span className="font-bold text-sm">{msg.role}</span>
                            <span className="text-xs text-gray-500 ml-auto">{formatDate(msg.created_at)}</span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Journals Tab */}
                {userDetailTab === 'journals' && (
                  <div
                    className="p-4 space-y-3 max-h-[400px] overflow-y-auto"
                    style={{ backgroundColor: '#F0FFF0', border: '2px solid black', borderRadius: '8px' }}
                  >
                    {userDetail.journalEntries.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">no journal entries yet</p>
                    ) : (
                      userDetail.journalEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-4"
                          style={{
                            backgroundColor: 'white',
                            border: '2px solid black',
                            borderRadius: '8px',
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">{entry.title || 'Untitled'}</span>
                            <div className="flex items-center gap-2">
                              {entry.mood && (
                                <span
                                  className="px-2 py-0.5 text-sm rounded"
                                  style={{ backgroundColor: '#FFD700', border: '1px solid black' }}
                                >
                                  {entry.mood}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">{formatDate(entry.created_at)}</span>
                            </div>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{entry.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Check-ins Tab */}
                {userDetailTab === 'checkins' && (
                  <div
                    className="p-4 space-y-4 max-h-[400px] overflow-y-auto"
                    style={{ backgroundColor: '#FFF0F5', border: '2px solid black', borderRadius: '8px' }}
                  >
                    {userDetail.dailyCheckins.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">no check-ins yet</p>
                    ) : (
                      userDetail.dailyCheckins.map((checkin) => {
                        let questions: string[] = []
                        let responses: string[] = []
                        try {
                          questions = typeof checkin.questions === 'string' ? JSON.parse(checkin.questions) : checkin.questions
                          responses = typeof checkin.responses === 'string' ? JSON.parse(checkin.responses) : checkin.responses
                        } catch { /* parsing failed */ }

                        return (
                          <div
                            key={checkin.id}
                            className="p-4"
                            style={{
                              backgroundColor: 'white',
                              border: '2px solid black',
                              borderRadius: '8px',
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold">{checkin.checkin_date}</span>
                              {checkin.mood && (
                                <span
                                  className="px-2 py-0.5 text-sm rounded"
                                  style={{ backgroundColor: '#FFD700', border: '1px solid black' }}
                                >
                                  {checkin.mood}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              {questions.map((q, i) => (
                                <div key={i}>
                                  <div className="text-sm font-bold text-gray-600">Q: {q}</div>
                                  <div className="text-sm ml-4">A: {responses[i] || '(no response)'}</div>
                                </div>
                              ))}
                            </div>
                            {checkin.ai_summary && (
                              <div
                                className="mt-3 p-2 text-sm rounded"
                                style={{ backgroundColor: '#FFFACD', border: '1px dashed black' }}
                              >
                                <strong>AI Summary:</strong> {checkin.ai_summary}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Activity Tab */}
                {userDetailTab === 'activity' && (
                  <div
                    className="p-4 space-y-2 max-h-[400px] overflow-y-auto"
                    style={{ backgroundColor: '#FFF5EE', border: '2px solid black', borderRadius: '8px' }}
                  >
                    {userDetail.activityLog.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">no activity yet</p>
                    ) : (
                      userDetail.activityLog.map((activity) => (
                        <div
                          key={activity.id}
                          className="p-2 flex items-center gap-3"
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid black',
                            borderRadius: '4px',
                          }}
                        >
                          <span className="text-xl">{getActivityIcon(activity.activity_type)}</span>
                          <div className="flex-1">
                            <div className="font-bold text-sm">{activity.activity_type.replace(/_/g, ' ')}</div>
                            {activity.activity_data && (
                              <div className="text-xs text-gray-600 truncate">
                                {activity.activity_data.slice(0, 100)}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(activity.created_at)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">failed to load user data</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
