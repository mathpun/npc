'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

interface ParentDashboardProps {
  profile: UserProfile
}

interface SuggestedTheme {
  id: string
  text: string
  addedAt: Date
}

// Generate parent-appropriate summaries
function generateParentSummary(profile: UserProfile) {
  const usageHealth = {
    status: 'healthy' as 'healthy' | 'moderate' | 'concerning',
    avgSessionsPerWeek: 5,
    avgSessionLength: '12 min',
    lastActive: 'Today',
    trend: 'stable' as 'increasing' | 'stable' | 'decreasing'
  }

  const weeklyThemes = [
    { theme: 'School & Learning', sessions: 3, sentiment: 'curious' },
    { theme: 'Friendships', sessions: 2, sentiment: 'reflective' },
    { theme: 'Creative Projects', sessions: 2, sentiment: 'excited' },
  ]

  const safetyStatus = {
    allClear: true,
    notes: [
      {
        type: 'positive' as const,
        message: 'No concerning topics detected this week'
      },
      {
        type: 'info' as const,
        message: 'AI encouraged talking to trusted adults 2 times when discussing stress'
      }
    ]
  }

  const engagementQuality = {
    reflectiveThinking: 82,
    questionsAsked: 78,
    multiPerspective: 75,
    actionsTaken: 65
  }

  return { usageHealth, weeklyThemes, safetyStatus, engagementQuality }
}

export default function ParentDashboard({
  profile,
}: ParentDashboardProps) {
  const { theme } = useTheme()
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false)
  const [suggestedThemes, setSuggestedThemes] = useState<SuggestedTheme[]>([])
  const [newTheme, setNewTheme] = useState('')
  const summary = generateParentSummary(profile)

  // Load saved themes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('parentSuggestedThemes')
    if (saved) {
      setSuggestedThemes(JSON.parse(saved))
    }
  }, [])

  // Save themes to localStorage
  const saveThemes = (themes: SuggestedTheme[]) => {
    localStorage.setItem('parentSuggestedThemes', JSON.stringify(themes))
    setSuggestedThemes(themes)
  }

  const handleAddTheme = () => {
    if (!newTheme.trim()) return
    const theme: SuggestedTheme = {
      id: Date.now().toString(),
      text: newTheme.trim(),
      addedAt: new Date()
    }
    saveThemes([...suggestedThemes, theme])
    setNewTheme('')
  }

  const handleRemoveTheme = (id: string) => {
    saveThemes(suggestedThemes.filter(t => t.id !== id))
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-black" style={{  }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-3 inline-block px-6 py-2 -rotate-1"
          style={{
            backgroundColor: theme.colors.accent1,
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 black',
          }}
        >
          👨‍👩‍👧 Parent Dashboard 👨‍👩‍👧
        </h1>
        <p className="text-lg mt-4">High-level insights into {profile.name}'s experience</p>
      </div>

      {/* Privacy Notice */}
      <div
        className="p-4 rotate-1"
        style={{
          backgroundColor: theme.colors.accent5,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <button
          onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <span className="font-bold text-lg">Privacy-First Design</span>
          </div>
          <span className="text-2xl">{showPrivacyInfo ? '⬆️' : '⬇️'}</span>
        </button>

        {showPrivacyInfo && (
          <div
            className="mt-4 p-3 space-y-2"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            <p className="text-sm">• You see <strong>themes</strong>, not conversations</p>
            <p className="text-sm">• {profile.name} controls what specific insights are shared with you</p>
            <p className="text-sm">• Safety alerts only trigger for serious concerns</p>
            <p className="text-sm">• This builds trust—your teen knows you're not reading everything</p>
          </div>
        )}
      </div>

      {/* Suggest Themes for Teen */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: theme.colors.accent2,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <span className="text-2xl">💭</span>
          Suggest Themes for {profile.name}
        </h2>
        <p className="text-sm mb-4">
          Add topics you'd like {profile.name} to think about this week. These will appear as gentle prompts in their experience.
        </p>

        {/* Add Theme Form */}
        <div
          className="p-3 mb-4"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '3px solid black',
            borderRadius: '12px',
          }}
        >
          <textarea
            value={newTheme}
            onChange={(e) => setNewTheme(e.target.value)}
            placeholder="e.g., 'What makes a good friend?' or 'How do you handle stress?'"
            className="w-full px-3 py-2 mb-2 text-sm"
            rows={2}
            style={{ border: '2px solid black', borderRadius: '8px' }}
          />
          <button
            onClick={handleAddTheme}
            disabled={!newTheme.trim()}
            className="w-full py-2 font-bold hover:scale-105 transition-transform disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.accent3,
              border: '2px solid black',
              borderRadius: '8px',
            }}
          >
            ✨ Add Theme
          </button>
        </div>

        {/* Current Themes */}
        {suggestedThemes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-bold">This Week's Themes:</p>
            {suggestedThemes.map((themeItem, index) => (
              <div
                key={themeItem.id}
                className="p-3 flex items-center justify-between gap-2"
                style={{
                  backgroundColor: index % 2 === 0 ? theme.colors.accent4 : theme.colors.background,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '2px 2px 0 black',
                  transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
                }}
              >
                <span className="text-sm flex-1">"{themeItem.text}"</span>
                <button
                  onClick={() => handleRemoveTheme(themeItem.id)}
                  className="px-2 py-1 font-bold hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: theme.colors.backgroundAlt,
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="p-3 text-center"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '2px dashed black',
              borderRadius: '12px',
            }}
          >
            <p className="text-sm">No themes suggested yet. Add one above!</p>
          </div>
        )}
      </div>

      {/* Usage Health */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: theme.colors.accent3,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <button
          onClick={() => toggleSection('overview')}
          className="w-full flex items-center justify-between mb-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div className="text-left">
              <h2 className="text-xl font-bold">Usage Overview</h2>
              <p className="text-sm">
                {summary.usageHealth.status === 'healthy' ? '✅ Healthy engagement pattern' :
                 summary.usageHealth.status === 'moderate' ? '⚠️ Moderate usage' : '🚨 May need attention'}
              </p>
            </div>
          </div>
          <span className="text-2xl">{expandedSection === 'overview' ? '⬆️' : '⬇️'}</span>
        </button>

        {expandedSection === 'overview' && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: summary.usageHealth.avgSessionsPerWeek, label: 'Sessions/Week', color: theme.colors.accent1 },
              { value: summary.usageHealth.avgSessionLength, label: 'Avg Length', color: theme.colors.accent4 },
              { value: summary.usageHealth.lastActive, label: 'Last Active', color: theme.colors.accent2 },
              { value: summary.usageHealth.trend, label: 'Trend', color: theme.colors.accent5 },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="p-3 text-center"
                style={{
                  backgroundColor: stat.color,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '2px 2px 0 black',
                  transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
                }}
              >
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Status */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: summary.safetyStatus.allClear ? theme.colors.accent3 : theme.colors.background,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <button
          onClick={() => toggleSection('safety')}
          className="w-full flex items-center justify-between mb-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div className="text-left">
              <h2 className="text-xl font-bold">Safety Status</h2>
              <p className="text-sm">
                {summary.safetyStatus.allClear ? '✅ All clear this week' : '⚠️ Some notes to review'}
              </p>
            </div>
          </div>
          <span className="text-2xl">{expandedSection === 'safety' ? '⬆️' : '⬇️'}</span>
        </button>

        {expandedSection === 'safety' && (
          <div className="space-y-2">
            {summary.safetyStatus.notes.map((note, index) => (
              <div
                key={index}
                className="p-3 flex items-start gap-2"
                style={{
                  backgroundColor: note.type === 'positive' ? theme.colors.backgroundAccent : note.type === 'info' ? theme.colors.accent4 : theme.colors.accent2,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                <span className="text-xl">
                  {note.type === 'positive' ? '✅' : note.type === 'info' ? 'ℹ️' : '⚠️'}
                </span>
                <p className="text-sm">{note.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Themes */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: theme.colors.accent5,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <button
          onClick={() => toggleSection('themes')}
          className="w-full flex items-center justify-between mb-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div className="text-left">
              <h2 className="text-xl font-bold">This Week's Topics</h2>
              <p className="text-sm">What {profile.name} explored</p>
            </div>
          </div>
          <span className="text-2xl">{expandedSection === 'themes' ? '⬆️' : '⬇️'}</span>
        </button>

        {expandedSection === 'themes' && (
          <div className="space-y-2">
            {summary.weeklyThemes.map((weeklyTheme, index) => (
              <div
                key={index}
                className="p-3 flex items-center justify-between"
                style={{
                  backgroundColor: index === 0 ? theme.colors.accent1 : index === 1 ? theme.colors.accent4 : theme.colors.accent2,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '2px 2px 0 black',
                  transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
                }}
              >
                <div>
                  <h3 className="font-bold">{weeklyTheme.theme}</h3>
                  <p className="text-xs">{weeklyTheme.sessions} sessions</p>
                </div>
                <span
                  className="px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: theme.colors.backgroundAlt,
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  {weeklyTheme.sentiment === 'curious' ? '🤔' : weeklyTheme.sentiment === 'reflective' ? '💭' : '✨'} {weeklyTheme.sentiment}
                </span>
              </div>
            ))}
            <p className="text-xs mt-2 text-center">Note: You see topic themes, not conversation content.</p>
          </div>
        )}
      </div>

      {/* Engagement Quality */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: theme.colors.accent4,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <button
          onClick={() => toggleSection('quality')}
          className="w-full flex items-center justify-between mb-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💪</span>
            <div className="text-left">
              <h2 className="text-xl font-bold">Engagement Quality</h2>
              <p className="text-sm">How {profile.name} uses the AI</p>
            </div>
          </div>
          <span className="text-2xl">{expandedSection === 'quality' ? '⬆️' : '⬇️'}</span>
        </button>

        {expandedSection === 'quality' && (
          <div className="space-y-3">
            {Object.entries(summary.engagementQuality).map(([key, value], index) => {
              const labels: Record<string, { label: string; emoji: string; color: string }> = {
                reflectiveThinking: { label: 'Reflective Thinking', emoji: '🧠', color: theme.colors.accent1 },
                questionsAsked: { label: 'Asks Questions', emoji: '❓', color: theme.colors.accent3 },
                multiPerspective: { label: 'Multiple Views', emoji: '🔀', color: theme.colors.accent2 },
                actionsTaken: { label: 'Takes Action', emoji: '🚀', color: theme.colors.accent5 }
              }
              const info = labels[key]
              return (
                <div
                  key={key}
                  className="p-3"
                  style={{
                    backgroundColor: info.color,
                    border: '3px solid black',
                    borderRadius: '12px',
                    boxShadow: '2px 2px 0 black',
                    transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold flex items-center gap-2">
                      <span>{info.emoji}</span> {info.label}
                    </span>
                    <span
                      className="px-2 py-1 font-bold"
                      style={{
                        backgroundColor: theme.colors.backgroundAlt,
                        border: '2px solid black',
                        borderRadius: '8px',
                      }}
                    >
                      {value}%
                    </span>
                  </div>
                  <div
                    className="h-4 rounded-full overflow-hidden"
                    style={{ backgroundColor: theme.colors.backgroundAlt, border: '2px solid black' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${value}%`,
                        backgroundColor: value >= 70 ? theme.colors.accent3 : theme.colors.accent2,
                      }}
                    />
                  </div>
                </div>
              )
            })}
            <p className="text-xs text-center mt-2">
              These metrics indicate healthy, reflective AI use—not just engagement time.
            </p>
          </div>
        )}
      </div>

      {/* Parent Bridge - Conversation Starters */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: theme.colors.backgroundAccent,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <button
          onClick={() => toggleSection('bridge')}
          className="w-full flex items-center justify-between mb-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div className="text-left">
              <h2 className="text-xl font-bold">Parent Bridge</h2>
              <p className="text-sm">Conversation starters based on their interests</p>
            </div>
          </div>
          <span className="text-2xl">{expandedSection === 'bridge' ? '⬆️' : '⬇️'}</span>
        </button>

        {expandedSection === 'bridge' && (
          <div className="space-y-3">
            <p className="text-sm">
              Based on what {profile.name} has been thinking about, here are ways to start meaningful conversations:
            </p>

            {/* Conversation Starters */}
            {[
              {
                topicLabel: "School & Learning",
                starter: "What's something you've been learning that you find interesting?",
                why: "They've been exploring topics around academics and growth",
                color: theme.colors.accent1
              },
              {
                topicLabel: "Friendships",
                starter: "How are things going with your friends lately?",
                why: "They've been reflecting on relationships this week",
                color: theme.colors.accent4
              },
              {
                topicLabel: "Creative Projects",
                starter: "I'd love to see what you've been working on. Want to show me?",
                why: "They've expressed excitement about creative work",
                color: theme.colors.accent2
              }
            ].map((item, index) => (
              <div
                key={index}
                className="p-4"
                style={{
                  backgroundColor: item.color,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                  transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
                }}
              >
                <span className="text-xs font-bold">About: {item.topicLabel}</span>
                <p className="font-bold my-2">"{item.starter}"</p>
                <div
                  className="p-2"
                  style={{
                    backgroundColor: theme.colors.backgroundAlt,
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  <span className="text-xs">💡 Why this might work: {item.why}</span>
                </div>
              </div>
            ))}

            {/* Tips */}
            <div
              className="p-4"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '3px solid black',
                borderRadius: '12px',
              }}
            >
              <h4 className="font-bold mb-2">💬 Bridge Conversation Tips</h4>
              <ul className="space-y-1 text-sm">
                <li>• Ask open-ended questions, avoid yes/no answers</li>
                <li>• Listen more than you talk—be curious!</li>
                <li>• Share your own experiences too</li>
                <li>• Don't mention this dashboard (respect privacy)</li>
                <li>• If they don't want to talk, that's okay</li>
              </ul>
            </div>

            {/* Weekly Goal */}
            <div
              className="p-4"
              style={{
                backgroundColor: theme.colors.accent5,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold">Weekly Connection Goal</h4>
                <span
                  className="px-2 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: theme.colors.accent3,
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  2/3 conversations
                </span>
              </div>
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{ backgroundColor: theme.colors.backgroundAlt, border: '2px solid black' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: '66%', backgroundColor: theme.colors.accent1 }}
                />
              </div>
              <p className="text-xs mt-2">
                Having 3+ meaningful conversations with your teen each week strengthens your relationship.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="p-4 text-center"
        style={{
          backgroundColor: theme.colors.backgroundAlt,
          border: '2px dashed black',
          borderRadius: '12px',
        }}
      >
        <p className="text-sm font-bold">
          🤝 This dashboard is designed to build trust, not surveillance.
        </p>
        <p className="text-xs mt-1">
          npc respects your teen's privacy while keeping you informed.
        </p>
      </div>
    </div>
  )
}
