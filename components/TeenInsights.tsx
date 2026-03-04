'use client'

import { useTheme } from '@/lib/ThemeContext'

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

interface TeenInsightsProps {
  profile: UserProfile
  onViewIslands?: () => void
}

export default function TeenInsights({ profile, onViewIslands }: TeenInsightsProps) {
  const { theme } = useTheme()

  const weeklyStats = { sessions: 7, questions: 23, topics: 3 }

  const topTopics = [
    { emoji: '🔍', name: 'Self-Discovery' },
    { emoji: '👥', name: 'Friendships' },
    { emoji: '✨', name: 'Creative' },
  ]

  const growthAreas = [
    { emoji: '🎯', area: 'Decisions', progress: 75 },
    { emoji: '🪞', area: 'Self-Aware', progress: 82 },
    { emoji: '🧠', area: 'Thinking', progress: 68 },
  ]

  const thinkingStyle = [
    { emoji: '🔄', label: 'Multiple perspectives' },
    { emoji: '❓', label: 'Asks questions' },
    { emoji: '🔗', label: 'Connects ideas' },
  ]

  return (
    <div className="max-w-sm mx-auto px-3 py-4">
      {/* Main Card - Screenshot friendly */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '4px solid black',
          boxShadow: '6px 6px 0 black',
          background: `linear-gradient(180deg, ${theme.colors.accent2} 0%, ${theme.colors.accent5} 100%)`,
        }}
      >
        {/* Header */}
        <div className="text-center py-3 px-4">
          <h1 className="text-xl font-bold">✨ {profile.name}'s Mind ✨</h1>
          <p className="text-xs opacity-70">this week's wrapped</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 px-3 pb-3">
          {[
            { label: 'chats', value: weeklyStats.sessions, emoji: '💬' },
            { label: 'questions', value: weeklyStats.questions, emoji: '❓' },
            { label: 'topics', value: weeklyStats.topics, emoji: '💡' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-2 text-center rounded-xl"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px solid black',
              }}
            >
              <div className="text-lg">{stat.emoji}</div>
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] font-bold opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Top Topics */}
        <div className="px-3 pb-3">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: theme.colors.accent1, border: '2px solid black' }}
          >
            <div className="text-xs font-bold mb-2">🔥 hot topics</div>
            <div className="flex gap-2">
              {topTopics.map((topic) => (
                <div
                  key={topic.name}
                  className="flex-1 text-center p-1.5 rounded-lg text-[10px] font-bold"
                  style={{ backgroundColor: theme.colors.backgroundAlt, border: '2px solid black' }}
                >
                  <div className="text-base">{topic.emoji}</div>
                  {topic.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth + Thinking Style Grid */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          {/* Growth */}
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: theme.colors.accent4, border: '2px solid black' }}
          >
            <div className="text-xs font-bold mb-2">📈 growth</div>
            {growthAreas.map((area) => (
              <div key={area.area} className="flex items-center gap-1 mb-1 last:mb-0">
                <span className="text-sm">{area.emoji}</span>
                <div className="flex-1">
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.5)', border: '1px solid black' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${area.progress}%`, backgroundColor: theme.colors.accent1 }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold">{area.progress}%</span>
              </div>
            ))}
          </div>

          {/* Thinking Style */}
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: theme.colors.accent3, border: '2px solid black' }}
          >
            <div className="text-xs font-bold mb-2">🧠 your style</div>
            {thinkingStyle.map((style) => (
              <div key={style.label} className="flex items-center gap-1.5 mb-1 last:mb-0">
                <span className="text-sm">{style.emoji}</span>
                <span className="text-[10px] font-bold">{style.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center py-2 px-3 text-[10px] font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
        >
          npc.chat · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Islands Link - Below main card */}
      {onViewIslands && (
        <button
          onClick={onViewIslands}
          className="w-full mt-4 p-3 rounded-xl flex items-center justify-between hover:scale-[1.02] transition-transform"
          style={{
            backgroundColor: theme.colors.accent4,
            border: '3px solid black',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏝️</span>
            <div className="text-left">
              <div className="font-bold text-sm">Islands of You</div>
              <div className="text-[10px] opacity-70">your personality themes</div>
            </div>
          </div>
          <span className="text-xl">→</span>
        </button>
      )}
    </div>
  )
}
