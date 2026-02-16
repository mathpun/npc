'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface ConnectedTeen {
  id: number
  userId: string
  name: string
  connectedAt: string
}

interface Report {
  id: number
  user_id: string
  report_type: string
  week_start: string
  week_end: string
  themes_discussed: string
  mood_summary: string
  growth_highlights: string
  engagement_stats: string
  teen_note: string | null
  status: string
  generated_at: string
  approved_at: string | null
  sent_at: string | null
  teen_name: string
  teen_nickname: string | null
}

export default function ParentDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [connectedTeens, setConnectedTeens] = useState<ConnectedTeen[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    const initDashboard = async () => {
      // Check for token in URL
      const token = searchParams.get('token')

      if (token) {
        // Verify the token
        try {
          const res = await fetch(`/api/parent/auth?token=${token}`)
          const data = await res.json()

          if (res.ok && data.success) {
            // Store parent email in localStorage
            localStorage.setItem('parent_email', data.parentEmail)
            setParentEmail(data.parentEmail)
            setConnectedTeens(data.connectedTeens.map((t: { id: number; user_id: string; name: string; nickname: string | null; created_at: string }) => ({
              id: t.id,
              userId: t.user_id,
              name: t.nickname || t.name,
              connectedAt: t.created_at
            })))
            // Remove token from URL for cleaner UX
            router.replace('/parent')
          } else {
            setError(data.error || 'Invalid or expired link')
            setLoading(false)
            return
          }
        } catch (err) {
          setError('Failed to verify your login link')
          setLoading(false)
          return
        }
      } else {
        // Check localStorage for existing session
        const storedEmail = localStorage.getItem('parent_email')
        if (!storedEmail) {
          // Redirect to login
          router.push('/login')
          return
        }
        setParentEmail(storedEmail)
      }

      // Fetch dashboard data
      await fetchDashboardData()
    }

    initDashboard()
  }, [searchParams, router])

  const fetchDashboardData = async () => {
    const email = localStorage.getItem('parent_email')
    if (!email) return

    try {
      const res = await fetch(`/api/parent/dashboard?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (res.ok) {
        setConnectedTeens(data.connectedTeens || [])
        setReports(data.reports || [])
      } else {
        setError(data.error || 'Failed to load dashboard')
      }
    } catch (err) {
      setError('Failed to load dashboard data')
    }

    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('parent_email')
    router.push('/login')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const parseEngagementStats = (stats: string) => {
    try {
      return JSON.parse(stats)
    } catch {
      return { checkins: 0, sessions: 0, messages: 0 }
    }
  }

  const getMoodEmoji = (moodSummary: string) => {
    const summary = moodSummary.toLowerCase()
    if (summary.includes('great') || summary.includes('happy') || summary.includes('positive')) return { emoji: '😊', color: '#90EE90' }
    if (summary.includes('good') || summary.includes('well')) return { emoji: '🙂', color: '#98FB98' }
    if (summary.includes('okay') || summary.includes('neutral')) return { emoji: '😐', color: '#FFFACD' }
    if (summary.includes('stressed') || summary.includes('anxious')) return { emoji: '😰', color: '#FFB6C1' }
    if (summary.includes('sad') || summary.includes('down')) return { emoji: '😔', color: '#87CEEB' }
    return { emoji: '💭', color: '#E6E6FA' }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5DC' }}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👨‍👩‍👧</div>
          <p className="text-xl font-bold">loading your dashboard...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5DC' }}>
        <div
          className="max-w-md w-full p-8 text-center"
          style={{
            backgroundColor: 'white',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '8px 8px 0 black',
          }}
        >
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-4">oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#87CEEB',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            back to login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F5F5DC' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-4"
        style={{
          backgroundColor: '#DDA0DD',
          borderBottom: '4px solid black',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍👩‍👧</span>
            <div>
              <h1 className="font-bold text-lg">parent portal</h1>
              <p className="text-sm opacity-70">{parentEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            log out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div
          className="p-6 text-center"
          style={{
            backgroundColor: '#FFFACD',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="text-4xl mb-2">👋</div>
          <h2 className="text-2xl font-bold">welcome back!</h2>
          <p className="text-gray-600 mt-2">
            here&apos;s what your teen{connectedTeens.length > 1 ? 's have' : ' has'} shared with you
          </p>
        </div>

        {/* Connected Teens */}
        <div
          className="p-6"
          style={{
            backgroundColor: '#87CEEB',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🌟</span>
            <h3 className="text-xl font-bold">connected teens</h3>
          </div>

          {connectedTeens.length === 0 ? (
            <p className="text-center p-4 bg-white/50 rounded-lg">
              no connected teens yet. ask your teen to add your email in their app!
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {connectedTeens.map((teen) => (
                <div
                  key={teen.id}
                  className="p-4 flex items-center gap-3"
                  style={{
                    backgroundColor: 'white',
                    border: '3px solid black',
                    borderRadius: '12px',
                  }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: '#FFD700',
                      border: '2px solid black',
                      borderRadius: '50%',
                    }}
                  >
                    {teen.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold">{teen.name}</div>
                    <div className="text-xs opacity-70">
                      connected {formatDate(teen.connectedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div
          className="p-6"
          style={{
            backgroundColor: '#98FB98',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <h3 className="text-xl font-bold">weekly reports</h3>
          </div>

          {reports.length === 0 ? (
            <div className="text-center p-6 bg-white/50 rounded-lg">
              <div className="text-4xl mb-2">📭</div>
              <p className="font-bold">no reports yet</p>
              <p className="text-sm opacity-70 mt-1">
                when your teen approves and sends a weekly report, it will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => {
                const mood = getMoodEmoji(report.mood_summary)
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="w-full p-4 text-left hover:scale-[1.02] transition-transform"
                    style={{
                      backgroundColor: 'white',
                      border: '3px solid black',
                      borderRadius: '12px',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 flex items-center justify-center text-xl"
                          style={{
                            backgroundColor: mood.color,
                            border: '2px solid black',
                            borderRadius: '50%',
                          }}
                        >
                          {mood.emoji}
                        </div>
                        <div>
                          <div className="font-bold">
                            {report.teen_nickname || report.teen_name}
                          </div>
                          <div className="text-sm opacity-70">
                            {formatDate(report.week_start)} - {formatDate(report.week_end)}
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl">→</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm opacity-70 py-4">
          <p>reports are written by your teen and approved before being shared with you</p>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedReport(null)}
          />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            style={{
              backgroundColor: 'white',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '8px 8px 0 black',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center font-bold text-xl hover:scale-110 transition-transform"
              style={{
                backgroundColor: '#FFB6C1',
                border: '3px solid black',
                borderRadius: '50%',
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📊</div>
              <h2 className="text-2xl font-bold">
                {selectedReport.teen_nickname || selectedReport.teen_name}&apos;s week
              </h2>
              <p className="text-sm opacity-70">
                {formatDate(selectedReport.week_start)} - {formatDate(selectedReport.week_end)}
              </p>
              <p className="text-xs opacity-50 mt-1">
                shared {formatFullDate(selectedReport.sent_at!)}
              </p>
            </div>

            {/* Report Content */}
            <div className="space-y-4">
              {/* Stats */}
              <div
                className="p-4"
                style={{
                  backgroundColor: '#E6E6FA',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="font-bold mb-2">📈 activity this week</div>
                {(() => {
                  const stats = parseEngagementStats(selectedReport.engagement_stats)
                  return (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold">{stats.checkins || 0}</div>
                        <div className="text-xs">check-ins</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.sessions || 0}</div>
                        <div className="text-xs">chat sessions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.avgMood || '-'}</div>
                        <div className="text-xs">avg mood</div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Mood Summary */}
              <div
                className="p-4"
                style={{
                  backgroundColor: getMoodEmoji(selectedReport.mood_summary).color,
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="font-bold mb-2">
                  {getMoodEmoji(selectedReport.mood_summary).emoji} mood summary
                </div>
                <p className="text-sm">{selectedReport.mood_summary}</p>
              </div>

              {/* Themes */}
              <div
                className="p-4"
                style={{
                  backgroundColor: '#FFFACD',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="font-bold mb-2">💭 what they&apos;ve been exploring</div>
                <p className="text-sm">{selectedReport.themes_discussed}</p>
              </div>

              {/* Growth */}
              <div
                className="p-4"
                style={{
                  backgroundColor: '#98FB98',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <div className="font-bold mb-2">🌱 growth highlights</div>
                <p className="text-sm">{selectedReport.growth_highlights}</p>
              </div>

              {/* Teen's Note */}
              {selectedReport.teen_note && (
                <div
                  className="p-4"
                  style={{
                    backgroundColor: '#87CEEB',
                    border: '3px solid black',
                    borderRadius: '12px',
                  }}
                >
                  <div className="font-bold mb-2">✉️ a note from your teen</div>
                  <p className="text-sm italic">&quot;{selectedReport.teen_note}&quot;</p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="w-full mt-6 py-3 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#DDA0DD',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '4px 4px 0 black',
              }}
            >
              close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
