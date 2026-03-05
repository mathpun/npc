'use client'

import { useTheme } from '@/lib/ThemeContext'

interface EpistemicHealthProps {
  userName: string
  sessionsCompleted?: number
  checkinsCompleted?: number
  challengesCompleted?: number
}

export default function EpistemicHealth({
  userName,
  sessionsCompleted = 0,
  checkinsCompleted = 0,
  challengesCompleted = 0,
}: EpistemicHealthProps) {
  const { theme } = useTheme()

  // Calculate scores based on user activity
  const uncertaintyScore = Math.min(100, 30 + checkinsCompleted * 10)
  const perspectiveScore = Math.min(100, 30 + sessionsCompleted * 7)
  const sourceScore = Math.min(100, 30 + challengesCompleted * 14)
  const complexityScore = Math.min(100, 30 + Math.round((sessionsCompleted * 5 + checkinsCompleted * 8 + challengesCompleted * 12) / 3))

  const metrics = [
    { name: 'Calibration', emoji: '⚖️', score: uncertaintyScore, color: theme.colors.accent1 },
    { name: 'Perspectives', emoji: '🔀', score: perspectiveScore, color: theme.colors.accent3 },
    { name: 'Sources', emoji: '🔍', score: sourceScore, color: theme.colors.accent4 },
    { name: 'Complexity', emoji: '🧩', score: complexityScore, color: theme.colors.accent2 },
  ]

  const overallHealth = Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length)

  const getHealthLabel = (score: number) => {
    if (score >= 80) return '🌟 Excellent'
    if (score >= 60) return '💪 Healthy'
    if (score >= 40) return '🌱 Growing'
    return '🔨 Building'
  }

  return (
    <div className="max-w-sm mx-auto px-3 py-4">
      {/* Main Card - Screenshot friendly */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '4px solid black',
          boxShadow: '6px 6px 0 black',
          background: `linear-gradient(180deg, ${theme.colors.accent5} 0%, ${theme.colors.accent2} 100%)`,
        }}
      >
        {/* Header */}
        <div className="text-center py-3 px-4">
          <h1 className="text-xl font-bold">🧠 Thinking Health</h1>
          <p className="text-xs opacity-70">how well do you know what you know?</p>
        </div>

        {/* Overall Score Circle + Label */}
        <div className="flex items-center justify-center gap-4 px-3 pb-3">
          <div
            className="w-20 h-20 flex items-center justify-center rounded-full"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '3px solid black',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <span className="text-3xl font-bold">{overallHealth}</span>
          </div>
          <div className="text-left">
            <div className="text-lg font-bold">{getHealthLabel(overallHealth)}</div>
            <div className="text-[10px] opacity-70">thinking clearly!</div>
          </div>
        </div>

        {/* Skills Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="p-2.5 rounded-xl"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px solid black',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-base">{metric.emoji}</span>
                <span className="text-xs font-bold">{metric.name}</span>
                <span className="ml-auto text-xs font-bold">{metric.score}</span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)', border: '1px solid black' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${metric.score}%`, backgroundColor: metric.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Activity + Tips Row */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          {/* Activity */}
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: theme.colors.accent4, border: '2px solid black' }}
          >
            <div className="text-xs font-bold mb-1.5">📈 activity</div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Sessions</span>
                <span className="font-bold">{sessionsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-ins</span>
                <span className="font-bold">{checkinsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Challenges</span>
                <span className="font-bold">{challengesCompleted}</span>
              </div>
            </div>
          </div>

          {/* Why it matters */}
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: theme.colors.accent1, border: '2px solid black' }}
          >
            <div className="text-xs font-bold mb-1.5">✨ superpowers</div>
            <div className="space-y-0.5 text-[10px]">
              <div>🎯 Better decisions</div>
              <div>🛡️ Less manipulation</div>
              <div>💪 Real confidence</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center py-2 px-3 text-[10px] font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
        >
          say "i'm not sure" - it's a superpower! · npc.chat
        </div>
      </div>
    </div>
  )
}
