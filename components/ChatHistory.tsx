'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface ChatSession {
  id: number
  title: string | null
  category: string
  session_goal: string | null
  session_topic: string | null
  persona: string | null
  bucket_id: number | null
  bucket_name: string | null
  bucket_emoji: string | null
  message_count: number
  started_at: string
  first_message: string | null
}

interface Category {
  id: string
  label: string
  emoji: string
  color: string
}

interface Bucket {
  id: number
  name: string
  emoji: string
  color: string
  description: string | null
  session_count: number
}

interface ChatHistoryProps {
  isOpen: boolean
  onClose: () => void
  onSelectSession: (sessionId: number) => void
  onNewChat: () => void
  currentSessionId?: number
}

export default function ChatHistory({
  isOpen,
  onClose,
  onSelectSession,
  onNewChat,
  currentSessionId,
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBucket, setSelectedBucket] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [editingSession, setEditingSession] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editBucketId, setEditBucketId] = useState<number | null>(null)
  const [showNewBucket, setShowNewBucket] = useState(false)
  const [newBucketName, setNewBucketName] = useState('')
  const [newBucketEmoji, setNewBucketEmoji] = useState('📁')
  const { theme } = useTheme()

  useEffect(() => {
    if (isOpen) {
      fetchSessions()
      fetchBuckets()
    }
  }, [isOpen, selectedCategory, selectedBucket])

  const fetchBuckets = async () => {
    const userId = localStorage.getItem('npc_user_id')
    if (!userId) return

    try {
      const res = await fetch(`/api/chat-buckets?userId=${userId}`)
      const data = await res.json()
      if (res.ok) {
        setBuckets(data.buckets || [])
      }
    } catch (err) {
      console.error('Failed to fetch buckets:', err)
    }
  }

  const fetchSessions = async () => {
    const userId = localStorage.getItem('npc_user_id')
    if (!userId) return

    setLoading(true)
    try {
      let url = `/api/chat-sessions?userId=${userId}`

      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`
      }

      if (selectedBucket !== 'all') {
        url += `&bucketId=${selectedBucket}`
      }

      const res = await fetch(url)
      const data = await res.json()

      if (res.ok) {
        setSessions(data.sessions || [])
        if (data.categories) {
          setCategories(data.categories)
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSession = (session: ChatSession) => {
    setEditingSession(session.id)
    setEditTitle(session.title || '')
    setEditCategory(session.category || 'general')
    setEditBucketId(session.bucket_id)
  }

  const handleSaveEdit = async () => {
    if (!editingSession) return

    const userId = localStorage.getItem('npc_user_id')
    if (!userId) return

    try {
      await fetch('/api/chat-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: editingSession,
          userId,
          title: editTitle || null,
          category: editCategory,
          bucketId: editBucketId,
        }),
      })

      setEditingSession(null)
      fetchSessions()
      fetchBuckets()
    } catch (err) {
      console.error('Failed to update session:', err)
    }
  }

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) return

    const userId = localStorage.getItem('npc_user_id')
    if (!userId) return

    try {
      const res = await fetch('/api/chat-buckets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: newBucketName.trim(),
          emoji: newBucketEmoji,
        }),
      })

      if (res.ok) {
        setNewBucketName('')
        setNewBucketEmoji('📁')
        setShowNewBucket(false)
        fetchBuckets()
      }
    } catch (err) {
      console.error('Failed to create bucket:', err)
    }
  }

  const handleDeleteBucket = async (bucketId: number) => {
    if (!confirm('Delete this project? Chats will be moved to "No Project".')) return

    const userId = localStorage.getItem('npc_user_id')
    if (!userId) return

    try {
      await fetch(`/api/chat-buckets?bucketId=${bucketId}&userId=${userId}`, {
        method: 'DELETE',
      })
      fetchBuckets()
      fetchSessions()
    } catch (err) {
      console.error('Failed to delete bucket:', err)
    }
  }

  const handleDeleteSession = async (sessionId: number) => {
    const userId = localStorage.getItem('npc_user_id')
    if (!userId) return

    if (!confirm('Delete this chat? This cannot be undone.')) return

    try {
      await fetch(`/api/chat-sessions?sessionId=${sessionId}&userId=${userId}`, {
        method: 'DELETE',
      })
      fetchSessions()
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const getSessionTitle = (session: ChatSession) => {
    if (session.title) return session.title
    if (session.session_topic) return session.session_topic.slice(0, 40) + (session.session_topic.length > 40 ? '...' : '')
    if (session.first_message) return session.first_message.slice(0, 40) + (session.first_message.length > 40 ? '...' : '')
    return 'Untitled chat'
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { emoji: '💬', label: 'General', color: '#87CEEB' }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'white',
          borderRight: '4px solid black',
          boxShadow: '8px 0 0 rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-4 border-b-4 border-black border-dashed flex items-center justify-between"
          style={{ backgroundColor: theme.colors.accent4 }}
        >
          <h2 className="text-xl font-bold">chat history</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center font-bold text-lg hover:scale-110 transition-transform"
            style={{
              backgroundColor: 'white',
              border: '2px solid black',
              borderRadius: '8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b-2 border-dashed border-gray-300">
          <button
            onClick={() => {
              onNewChat()
              onClose()
            }}
            className="w-full py-3 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.colors.buttonSuccess,
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            + new chat
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-3 border-b-2 border-dashed border-gray-300">
          <div className="text-xs font-bold text-gray-500 mb-2">Categories</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-3 py-1 text-sm font-bold transition-transform hover:scale-105"
              style={{
                backgroundColor: selectedCategory === 'all' ? theme.colors.accent1 : 'white',
                border: '2px solid black',
                borderRadius: '9999px',
                boxShadow: selectedCategory === 'all' ? '2px 2px 0 black' : 'none',
              }}
            >
              all
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-3 py-1 text-sm font-bold transition-transform hover:scale-105"
                style={{
                  backgroundColor: selectedCategory === cat.id ? cat.color : 'white',
                  border: '2px solid black',
                  borderRadius: '9999px',
                  boxShadow: selectedCategory === cat.id ? '2px 2px 0 black' : 'none',
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects/Buckets Filter */}
        <div className="px-4 py-3 border-b-2 border-dashed border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-gray-500">Projects</div>
            <button
              onClick={() => setShowNewBucket(!showNewBucket)}
              className="text-xs font-bold px-2 py-0.5 hover:scale-105 transition-transform"
              style={{
                backgroundColor: theme.colors.buttonSuccess,
                border: '2px solid black',
                borderRadius: '6px',
              }}
            >
              + new
            </button>
          </div>

          {/* New Bucket Form */}
          {showNewBucket && (
            <div
              className="mb-3 p-2 space-y-2"
              style={{
                backgroundColor: '#FFFACD',
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              <div className="flex gap-2">
                <select
                  value={newBucketEmoji}
                  onChange={(e) => setNewBucketEmoji(e.target.value)}
                  className="w-12 text-center"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid black',
                    borderRadius: '6px',
                  }}
                >
                  {['📁', '🚀', '💡', '📚', '🎯', '🎨', '💼', '🔬', '🎮', '✨'].map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  placeholder="Project name..."
                  className="flex-1 px-2 py-1 text-sm"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid black',
                    borderRadius: '6px',
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateBucket}
                  className="flex-1 py-1 text-sm font-bold"
                  style={{
                    backgroundColor: theme.colors.buttonSuccess,
                    border: '2px solid black',
                    borderRadius: '6px',
                  }}
                >
                  create
                </button>
                <button
                  onClick={() => setShowNewBucket(false)}
                  className="flex-1 py-1 text-sm font-bold"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid black',
                    borderRadius: '6px',
                  }}
                >
                  cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBucket('all')}
              className="px-3 py-1 text-sm font-bold transition-transform hover:scale-105"
              style={{
                backgroundColor: selectedBucket === 'all' ? theme.colors.accent2 : 'white',
                border: '2px solid black',
                borderRadius: '9999px',
                boxShadow: selectedBucket === 'all' ? '2px 2px 0 black' : 'none',
              }}
            >
              all
            </button>
            <button
              onClick={() => setSelectedBucket('none')}
              className="px-3 py-1 text-sm font-bold transition-transform hover:scale-105"
              style={{
                backgroundColor: selectedBucket === 'none' ? '#E0E0E0' : 'white',
                border: '2px solid black',
                borderRadius: '9999px',
                boxShadow: selectedBucket === 'none' ? '2px 2px 0 black' : 'none',
              }}
            >
              no project
            </button>
            {buckets.map((bucket) => (
              <div key={bucket.id} className="relative group/bucket">
                <button
                  onClick={() => setSelectedBucket(String(bucket.id))}
                  className="px-3 py-1 text-sm font-bold transition-transform hover:scale-105"
                  style={{
                    backgroundColor: selectedBucket === String(bucket.id) ? bucket.color : 'white',
                    border: '2px solid black',
                    borderRadius: '9999px',
                    boxShadow: selectedBucket === String(bucket.id) ? '2px 2px 0 black' : 'none',
                  }}
                >
                  {bucket.emoji} {bucket.name} ({bucket.session_count})
                </button>
                <button
                  onClick={() => handleDeleteBucket(bucket.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 text-xs opacity-0 group-hover/bucket:opacity-100 transition-opacity"
                  style={{
                    backgroundColor: '#FFB6C1',
                    border: '1px solid black',
                    borderRadius: '50%',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-3xl animate-bounce mb-2">💬</div>
              <p className="text-gray-500">loading chats...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🌟</div>
              <p className="text-gray-500">no chats yet!</p>
              <p className="text-sm text-gray-400 mt-1">start a new conversation</p>
            </div>
          ) : (
            sessions.map((session) => {
              const catInfo = getCategoryInfo(session.category)
              const isEditing = editingSession === session.id
              const isActive = currentSessionId === session.id

              return (
                <div
                  key={session.id}
                  className="relative group"
                >
                  {isEditing ? (
                    <div
                      className="p-3 space-y-2"
                      style={{
                        backgroundColor: '#FFFACD',
                        border: '3px solid black',
                        borderRadius: '12px',
                      }}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Chat title..."
                        className="w-full px-2 py-1 text-sm"
                        style={{
                          backgroundColor: 'white',
                          border: '2px solid black',
                          borderRadius: '6px',
                        }}
                        autoFocus
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-2 py-1 text-sm"
                        style={{
                          backgroundColor: 'white',
                          border: '2px solid black',
                          borderRadius: '6px',
                        }}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editBucketId ?? 'none'}
                        onChange={(e) => setEditBucketId(e.target.value === 'none' ? null : parseInt(e.target.value))}
                        className="w-full px-2 py-1 text-sm"
                        style={{
                          backgroundColor: 'white',
                          border: '2px solid black',
                          borderRadius: '6px',
                        }}
                      >
                        <option value="none">📂 No Project</option>
                        {buckets.map((bucket) => (
                          <option key={bucket.id} value={bucket.id}>
                            {bucket.emoji} {bucket.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 py-1 text-sm font-bold"
                          style={{
                            backgroundColor: theme.colors.buttonSuccess,
                            border: '2px solid black',
                            borderRadius: '6px',
                          }}
                        >
                          save
                        </button>
                        <button
                          onClick={() => setEditingSession(null)}
                          className="flex-1 py-1 text-sm font-bold"
                          style={{
                            backgroundColor: 'white',
                            border: '2px solid black',
                            borderRadius: '6px',
                          }}
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectSession(session.id)
                        onClose()
                      }}
                      className="w-full text-left p-3 hover:scale-[1.02] transition-transform"
                      style={{
                        backgroundColor: isActive ? catInfo.color : 'white',
                        border: '3px solid black',
                        borderRadius: '12px',
                        boxShadow: isActive ? '3px 3px 0 black' : '2px 2px 0 black',
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{catInfo.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">
                            {getSessionTitle(session)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">
                              {formatDate(session.started_at)} · {session.message_count} msgs
                            </p>
                            {session.bucket_name && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: '#E8F5E9',
                                  border: '1px solid #81C784',
                                }}
                              >
                                {session.bucket_emoji} {session.bucket_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Edit/Delete buttons - show on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditSession(session)
                          }}
                          className="w-6 h-6 flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: '#FFD700',
                            border: '2px solid black',
                            borderRadius: '4px',
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSession(session.id)
                          }}
                          className="w-6 h-6 flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: '#FFB6C1',
                            border: '2px solid black',
                            borderRadius: '4px',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
