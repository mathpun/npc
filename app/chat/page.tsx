'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import ChatMessage, { ReflectionPrompt } from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import SessionPicker from '@/components/SessionPicker'
import TabNav, { TabId, GrowthSubTab } from '@/components/TabNav'
import TeenInsights from '@/components/TeenInsights'
import ParentDashboard from '@/components/ParentDashboard'
import AntiEngagement from '@/components/AntiEngagement'
import DevelopmentalProgress from '@/components/DevelopmentalProgress'
import EpistemicHealth from '@/components/EpistemicHealth'
import CoDesignPortal from '@/components/CoDesignPortal'
import RealWorldChallenges from '@/components/RealWorldChallenges'
import PeerWisdom from '@/components/PeerWisdom'
import AILiteracy from '@/components/AILiteracy'
import DailyCheckIn from '@/components/DailyCheckIn'
import { SessionGoal, PersonaType, SESSION_GOALS, buildReflectionPrompt } from '@/lib/prompts'
import ChatHistory from '@/components/ChatHistory'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

interface Session {
  goal: SessionGoal
  topic: string
  persona?: PersonaType
}

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [showSessionPicker, setShowSessionPicker] = useState(true)
  const [reflectionPrompt, setReflectionPrompt] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('chat')
  const [activeGrowthTab, setActiveGrowthTab] = useState<GrowthSubTab>('insights')
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<number | undefined>(undefined)
  const [userStats, setUserStats] = useState({
    sessionsCompleted: 0,
    messagesCount: 0,
    checkinsCompleted: 0,
    goalsCompleted: 0,
    achievementsCount: 0,
    challengesCompleted: 0,
    sessionsThisWeek: 0,
    avgSessionLength: 0,
    reflectiveThinkingScore: 0,
    completedChallengeIds: [] as string[],
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Track activity helper
  const trackActivity = async (activityType: string, activityData?: Record<string, unknown>) => {
    const userId = localStorage.getItem('npc_user_id')
    if (!userId) return

    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, activityType, activityData }),
      })
    } catch (err) {
      console.error('Failed to track activity:', err)
    }
  }

  // Fetch user stats for growth tab
  const fetchUserStats = async () => {
    const userId = localStorage.getItem('npc_user_id')
    if (!userId) return

    try {
      const res = await fetch(`/api/user-stats?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setUserStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err)
    }
  }

  useEffect(() => {
    const savedProfile = localStorage.getItem('youthai_profile')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    } else {
      router.push('/onboarding')
    }

    // Track page view
    trackActivity('page_view', { page: 'chat' })

    // Check for topic from URL (e.g., from moltbook friend chat)
    const topicFromUrl = searchParams.get('topic')

    // Check for tab from URL (e.g., from nav bar growth link)
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl === 'growth') {
      setActiveTab('growth')
      setShowSessionPicker(false)
    }

    // Check for daily check-in (only if not coming from URL topic)
    const userId = localStorage.getItem('npc_user_id')
    if (userId && !topicFromUrl) {
      checkForDailyCheckIn(userId)
    }

    // Fetch user stats
    fetchUserStats()
    if (topicFromUrl && savedProfile) {
      // Auto-start a session with this topic
      setShowSessionPicker(false)
      const parsedProfile = JSON.parse(savedProfile)
      setSession({ goal: 'talk' as SessionGoal, topic: topicFromUrl })
      // Get initial greeting with this topic
      getInitialGreetingWithTopic(parsedProfile, topicFromUrl)
    }
  }, [router, searchParams])

  const checkForDailyCheckIn = async (userId: string) => {
    try {
      // Check if we already showed the check-in modal this session
      const today = new Date().toISOString().split('T')[0]
      const shownKey = `checkin_shown_${today}`
      if (sessionStorage.getItem(shownKey)) {
        return
      }

      const res = await fetch(`/api/checkin?userId=${userId}`)
      const data = await res.json()
      if (!data.hasCheckedInToday) {
        sessionStorage.setItem(shownKey, 'true')
        setShowCheckIn(true)
      }
    } catch (err) {
      console.error('Failed to check check-in status:', err)
    }
  }

  const handleCheckInComplete = () => {
    setShowCheckIn(false)
  }

  const handleCheckInSkip = () => {
    setShowCheckIn(false)
  }

  const getInitialGreetingWithTopic = async (userProfile: UserProfile, topic: string) => {
    setIsLoading(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: topic }],
          profile: userProfile,
          session: { goal: 'talk', topic },
          userId: localStorage.getItem('npc_user_id'),
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullContent += parsed.text
                  setStreamingContent(fullContent)
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      setMessages([{ id: '1', role: 'assistant', content: fullContent }])
      setStreamingContent('')
      trackActivity('chat_message', { sessionGoal: 'talk', topic })
    } catch (error) {
      console.error('Error getting greeting:', error)
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hey ${userProfile.name}! I see you want to talk about something from the moltbook. What's on your mind?`,
      }])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  useEffect(() => {
    const userMessageCount = messages.filter(m => m.role === 'user').length
    const prompt = buildReflectionPrompt(userMessageCount)
    if (prompt && !reflectionPrompt) {
      setReflectionPrompt(prompt)
    }
  }, [messages, reflectionPrompt])

  const handleSessionSelect = async (goal: SessionGoal, topic: string, persona: PersonaType) => {
    setSession({ goal, topic, persona })
    setShowSessionPicker(false)

    // Track session start
    trackActivity('session_start', { goal, topic, persona })

    // Create a new session in the database
    const userId = localStorage.getItem('npc_user_id')
    if (userId) {
      try {
        const res = await fetch('/api/chat-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            category: goal === 'feeling' ? 'feelings' : goal === 'creating' ? 'creative' : 'general',
            sessionGoal: goal,
            sessionTopic: topic,
            persona,
          }),
        })
        const data = await res.json()
        if (data.session?.id) {
          setCurrentSessionId(data.session.id)
        }
      } catch (err) {
        console.error('Failed to create session:', err)
      }
    }

    if (profile) {
      await getInitialGreeting(goal, topic, persona)
    }
  }

  const handleLoadSession = async (sessionId: number) => {
    const userId = localStorage.getItem('npc_user_id')
    if (!userId) return

    try {
      const res = await fetch(`/api/chat-sessions?userId=${userId}&sessionId=${sessionId}`)
      const data = await res.json()

      if (data.session && data.messages) {
        // Set the session context
        setSession({
          goal: data.session.session_goal || 'thinking',
          topic: data.session.session_topic || '',
          persona: data.session.persona,
        })
        setCurrentSessionId(sessionId)
        setShowSessionPicker(false)

        // Load messages
        const loadedMessages: Message[] = data.messages.map((m: { id: number; role: string; content: string }) => ({
          id: m.id.toString(),
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
        setMessages(loadedMessages)
      }
    } catch (err) {
      console.error('Failed to load session:', err)
    }
  }

  const getInitialGreeting = async (goal: SessionGoal, topic: string, persona?: PersonaType) => {
    if (!profile) return

    setIsLoading(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: topic || `I want to ${SESSION_GOALS[goal].label.toLowerCase()}` }],
          profile,
          session: { goal, topic, persona },
          userId: localStorage.getItem('npc_user_id'),
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullContent += parsed.text
                  setStreamingContent(fullContent)
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      setMessages([{ id: '1', role: 'assistant', content: fullContent }])
      setStreamingContent('')
    } catch (error) {
      console.error('Error getting greeting:', error)
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hey ${profile.name}! I'm here to help you think through things. What's on your mind?`,
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (content: string) => {
    if (!profile || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setStreamingContent('')

    // Track the chat message
    trackActivity('chat_message', { sessionGoal: session?.goal, topic: session?.topic })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          profile,
          session,
          userId: localStorage.getItem('npc_user_id'),
          sessionId: currentSessionId,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullContent += parsed.text
                  setStreamingContent(fullContent)
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setStreamingContent('')
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Can you try that again?",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewSession = () => {
    setMessages([])
    setSession(null)
    setShowSessionPicker(true)
    setReflectionPrompt(null)
    setCurrentSessionId(undefined)
  }

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    if (tab === 'chat' && !session) {
      setShowSessionPicker(true)
    }
    if (tab === 'growth') {
      setActiveGrowthTab('insights')
      // Refresh user stats when viewing growth tab
      fetchUserStats()
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#7FDBFF' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">👻</div>
          <p className="text-xl font-bold">loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col text-black" style={{ backgroundColor: '#7FDBFF' }}>
      {/* Daily Check-In Modal */}
      {showCheckIn && (
        <DailyCheckIn
          userId={localStorage.getItem('npc_user_id') || ''}
          userName={profile.name}
          onComplete={handleCheckInComplete}
          onSkip={handleCheckInSkip}
        />
      )}

      {/* Doodle decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 text-3xl rotate-12">☀️</div>
        <div className="absolute bottom-40 left-10 text-3xl -rotate-12">🌸</div>
        <div className="absolute top-1/3 left-5 text-2xl">✨</div>
      </div>

      {/* Nav */}
      <NavBar />

      {/* Sub header with tabs */}
      <header
        className="relative z-10 px-4 py-3 border-b-4 border-black border-dashed"
        style={{ backgroundColor: '#98FB98' }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Tab Navigation */}
          <TabNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            activeGrowthTab={activeGrowthTab}
            onGrowthTabChange={setActiveGrowthTab}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <>
            {showSessionPicker ? (
              <div className="h-full flex items-center justify-center px-4 py-8">
                <SessionPicker onSelect={handleSessionSelect} />
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Chat Header */}
                <div
                  className="px-4 py-3 border-b-4 border-black border-dashed"
                  style={{ backgroundColor: '#98FB98' }}
                >
                  <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowChatHistory(true)}
                        className="w-10 h-10 flex items-center justify-center font-bold hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: '#FFD700',
                          border: '3px solid black',
                          borderRadius: '10px',
                          boxShadow: '2px 2px 0 black',
                        }}
                        title="Chat history"
                      >
                        📋
                      </button>
                      <div className="text-3xl">👻</div>
                      <div>
                        <h1 className="font-bold text-lg">npc</h1>
                        {session && (
                          <p className="text-sm">{SESSION_GOALS[session.goal].label}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={startNewSession}
                      className="px-4 py-2 font-bold hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: 'white',
                        border: '3px solid black',
                        borderRadius: '9999px',
                        boxShadow: '3px 3px 0 black',
                      }}
                    >
                      🔄 new chat
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((message, index) => (
                      <div key={message.id}>
                        <ChatMessage
                          role={message.role}
                          content={message.content}
                        />

                        {index === messages.length - 1 && reflectionPrompt && message.role === 'assistant' && (
                          <ReflectionPrompt
                            prompt={reflectionPrompt.replace(/\n\n---\n💭 \*|\*$/g, '')}
                            onDismiss={() => setReflectionPrompt(null)}
                          />
                        )}
                      </div>
                    ))}

                    {streamingContent && (
                      <ChatMessage
                        role="assistant"
                        content={streamingContent}
                        isStreaming={true}
                      />
                    )}

                    {isLoading && !streamingContent && (
                      <div className="flex gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{
                            backgroundColor: '#DDA0DD',
                            border: '3px solid black',
                          }}
                        >
                          👻
                        </div>
                        <div
                          className="px-4 py-3 rounded-2xl"
                          style={{
                            backgroundColor: 'white',
                            border: '3px solid black',
                            boxShadow: '4px 4px 0 black',
                          }}
                        >
                          <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#FF69B4', animationDelay: '0ms' }} />
                            <span className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#FFD700', animationDelay: '150ms' }} />
                            <span className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#90EE90', animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input */}
                <div
                  className="px-4 py-4 border-t-4 border-black border-dashed"
                  style={{ backgroundColor: 'white' }}
                >
                  <div className="max-w-3xl mx-auto">
                    <ChatInput
                      onSend={sendMessage}
                      disabled={isLoading}
                      placeholder="what's on your mind?"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Growth Tab */}
        {activeTab === 'growth' && (
          <div className="h-full overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto">
              {activeGrowthTab === 'insights' && (
                <TeenInsights profile={profile} />
              )}
              {activeGrowthTab === 'progress' && (
                <DevelopmentalProgress
                  userName={profile.name}
                  age={profile.currentAge}
                  reflectiveThinkingScore={userStats.reflectiveThinkingScore}
                  sessionsCompleted={userStats.sessionsCompleted}
                  challengesCompleted={userStats.challengesCompleted}
                />
              )}
              {activeGrowthTab === 'challenges' && (
                <RealWorldChallenges
                  completedChallengeIds={userStats.completedChallengeIds}
                  onChallengeToggle={fetchUserStats}
                />
              )}
              {activeGrowthTab === 'epistemic' && (
                <EpistemicHealth
                  userName={profile.name}
                  sessionsCompleted={userStats.sessionsCompleted}
                  checkinsCompleted={userStats.checkinsCompleted}
                  challengesCompleted={userStats.challengesCompleted}
                />
              )}
              {activeGrowthTab === 'peers' && (
                <PeerWisdom />
              )}
              {activeGrowthTab === 'literacy' && (
                <AILiteracy profile={profile} />
              )}
              {activeGrowthTab === 'anti-engagement' && (
                <AntiEngagement
                  userName={profile.name}
                  sessionsThisWeek={userStats.sessionsThisWeek}
                  avgSessionLength={userStats.avgSessionLength}
                  independentDecisions={userStats.goalsCompleted}
                  irlActionsReported={userStats.challengesCompleted}
                />
              )}
              {activeGrowthTab === 'co-design' && (
                <CoDesignPortal />
              )}
              {activeGrowthTab === 'parent' && (
                <ParentDashboard profile={profile} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat History Sidebar */}
      <ChatHistory
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
        onSelectSession={handleLoadSession}
        onNewChat={startNewSession}
        currentSessionId={currentSessionId}
      />
    </main>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#7FDBFF' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">👻</div>
          <p className="text-xl font-bold">loading chat...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
