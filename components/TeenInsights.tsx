'use client'

import { useState } from 'react'

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

interface TeenInsightsProps {
  profile: UserProfile
}

// Mock data for demo - in production this would be derived from actual usage
function generateInsights(profile: UserProfile) {
  const themes = [
    { name: 'Self-Discovery', count: 12, trend: 'up', emoji: '🔍' },
    { name: 'School & Learning', count: 8, trend: 'stable', emoji: '📚' },
    { name: 'Friendships', count: 6, trend: 'up', emoji: '👥' },
    { name: 'Creative Projects', count: 5, trend: 'up', emoji: '✨' },
  ]

  const thinkingPatterns = [
    {
      pattern: 'You explore multiple perspectives',
      description: 'In 78% of conversations, you considered different viewpoints before forming your opinion.',
      icon: '🔄'
    },
    {
      pattern: 'You ask clarifying questions',
      description: 'You often dig deeper with follow-up questions instead of accepting surface answers.',
      icon: '❓'
    },
    {
      pattern: 'You connect ideas across topics',
      description: 'You\'ve made connections between your interests in ' + (profile.interests.slice(0, 2).join(' and ') || 'different areas') + '.',
      icon: '🔗'
    },
  ]

  const weeklyDigest = {
    sessionsCount: 7,
    topTopics: ['career exploration', 'friendship dynamics', 'creative writing'],
    questionsAsked: 23,
  }

  const growthAreas = [
    { area: 'Decision Making', progress: 75, color: '#FF69B4', emoji: '🎯' },
    { area: 'Self-Awareness', progress: 82, color: '#90EE90', emoji: '🪞' },
    { area: 'Critical Thinking', progress: 68, color: '#87CEEB', emoji: '🧠' },
  ]

  return { themes, thinkingPatterns, weeklyDigest, growthAreas }
}

export default function TeenInsights({ profile }: TeenInsightsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('digest')
  const insights = generateInsights(profile)

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
            backgroundColor: '#FFD700',
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 black',
          }}
        >
          ✨ My Insights ✨
        </h1>
        <p className="text-lg mt-4">Patterns in how you think and what you explore</p>
      </div>

      {/* Weekly Stats Grid */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: '#DDA0DD',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📅 This Week's Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Sessions', value: insights.weeklyDigest.sessionsCount, color: '#FF69B4', emoji: '💬' },
            { label: 'Questions', value: insights.weeklyDigest.questionsAsked, color: '#87CEEB', emoji: '❓' },
            { label: 'Topics', value: insights.weeklyDigest.topTopics.length, color: '#90EE90', emoji: '💡' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="p-3 text-center"
              style={{
                backgroundColor: stat.color,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
                transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
              }}
            >
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Top Topics */}
        <div
          className="mt-4 p-3"
          style={{
            backgroundColor: 'white',
            border: '3px solid black',
            borderRadius: '12px',
          }}
        >
          <h3 className="font-bold mb-2">🔥 Hot Topics This Week</h3>
          <div className="flex flex-wrap gap-2">
            {insights.weeklyDigest.topTopics.map((topic, i) => (
              <span
                key={topic}
                className="px-3 py-1 font-bold"
                style={{
                  backgroundColor: ['#FF69B4', '#90EE90', '#87CEEB'][i],
                  border: '2px solid black',
                  borderRadius: '9999px',
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Thinking Patterns */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: '#98FB98',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🧠 Your Thinking Patterns
        </h2>
        <div className="space-y-3">
          {insights.thinkingPatterns.map((pattern, index) => (
            <div
              key={index}
              className="p-3 flex items-start gap-3"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
                transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
              }}
            >
              <span className="text-3xl">{pattern.icon}</span>
              <div>
                <h3 className="font-bold">{pattern.pattern}</h3>
                <p className="text-sm">{pattern.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Areas */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: '#87CEEB',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📈 Growth Areas
        </h2>
        <div className="space-y-4">
          {insights.growthAreas.map((area, index) => (
            <div
              key={index}
              className="p-3"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{area.emoji}</span>
                  <span className="font-bold">{area.area}</span>
                </div>
                <span
                  className="px-2 py-1 font-bold text-sm"
                  style={{
                    backgroundColor: area.color,
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  {area.progress}%
                </span>
              </div>
              <div
                className="h-5 rounded-full overflow-hidden"
                style={{ backgroundColor: '#f0f0f0', border: '2px solid black' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${area.progress}%`,
                    backgroundColor: area.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics You Explore */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: '#FFB6C1',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🗺️ Topics You Explore
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {insights.themes.map((theme, index) => (
            <div
              key={index}
              className="p-3 flex items-center gap-3"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
                transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
              }}
            >
              <span className="text-2xl">{theme.emoji}</span>
              <div>
                <div className="font-bold">{theme.name}</div>
                <div className="text-sm">{theme.count} sessions {theme.trend === 'up' && '📈'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p
        className="text-center text-sm p-3 -rotate-1"
        style={{
          backgroundColor: 'white',
          border: '2px dashed black',
          borderRadius: '12px',
        }}
      >
        💭 These insights are based on your conversations and journal entries.
        They help you notice patterns in your own thinking!
      </p>
    </div>
  )
}
