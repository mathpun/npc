'use client'

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
  // Calculate scores based on user activity
  // Each metric has a base score of 30, and can grow to 100 based on activity

  // Uncertainty Calibration: Based on check-ins (reflects self-awareness)
  // Each check-in adds 10 points, max 100
  const uncertaintyScore = Math.min(100, 30 + checkinsCompleted * 10)

  // Perspective Seeking: Based on sessions (diverse conversations)
  // Each session adds 7 points, max 100
  const perspectiveScore = Math.min(100, 30 + sessionsCompleted * 7)

  // Source Questioning: Based on challenges completed (critical thinking in action)
  // Each challenge adds 14 points, max 100
  const sourceScore = Math.min(100, 30 + challengesCompleted * 14)

  // Complexity Tolerance: Based on overall engagement
  // Average of all activities
  const complexityScore = Math.min(100, 30 + Math.round((sessionsCompleted * 5 + checkinsCompleted * 8 + challengesCompleted * 12) / 3))

  const metrics = [
    {
      name: 'Uncertainty Calibration',
      emoji: '⚖️',
      score: uncertaintyScore,
      description: "Knowing what you know vs. don't know",
      color: '#FF69B4',
    },
    {
      name: 'Perspective Seeking',
      emoji: '🔀',
      score: perspectiveScore,
      description: 'Actively seeking different viewpoints',
      color: '#90EE90',
    },
    {
      name: 'Source Questioning',
      emoji: '🔍',
      score: sourceScore,
      description: 'Questioning where info comes from',
      color: '#87CEEB',
    },
    {
      name: 'Complexity Tolerance',
      emoji: '🧩',
      score: complexityScore,
      description: 'Sitting with ambiguity without rushing',
      color: '#FFD700',
    },
  ]

  const overallHealth = Math.round(
    metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length
  )

  const getHealthLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent! 🌟', color: '#90EE90' }
    if (score >= 60) return { label: 'Healthy 💪', color: '#87CEEB' }
    if (score >= 40) return { label: 'Growing 🌱', color: '#FFD700' }
    return { label: 'Building 🔨', color: '#FF69B4' }
  }

  const healthLabel = getHealthLabel(overallHealth)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-black" style={{  }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-3 inline-block px-6 py-2 rotate-1"
          style={{
            backgroundColor: '#DDA0DD',
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 black',
          }}
        >
          🧠 Thinking Health 🧠
        </h1>
        <p className="text-lg mt-4">How well do you know what you know?</p>
      </div>

      {/* Overall Score */}
      <div
        className="p-6 text-center -rotate-1"
        style={{
          backgroundColor: healthLabel.color,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <p className="text-sm font-bold mb-2">Overall Thinking Health</p>
        <div
          className="w-32 h-32 mx-auto mb-3 flex items-center justify-center"
          style={{
            backgroundColor: 'white',
            border: '4px solid black',
            borderRadius: '50%',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <span className="text-4xl font-bold">{overallHealth}</span>
        </div>
        <p className="text-xl font-bold">{healthLabel.label}</p>
        <p className="text-sm mt-2">This isn't about being smart—it's about thinking clearly!</p>
      </div>

      {/* Individual Metrics */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: '#FFB6C1',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4">📊 Your Thinking Skills</h2>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.name}
              className="p-3"
              style={{
                backgroundColor: metric.color,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
                transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{metric.emoji}</span>
                  <div>
                    <h3 className="font-bold">{metric.name}</h3>
                    <p className="text-xs">{metric.description}</p>
                  </div>
                </div>
                <div
                  className="px-3 py-1 font-bold"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  {metric.score}
                </div>
              </div>
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{ backgroundColor: 'white', border: '2px solid black' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${metric.score}%`,
                    backgroundColor: metric.score >= 70 ? '#90EE90' : '#FFD700',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div
        className="p-4"
        style={{
          backgroundColor: '#87CEEB',
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '3px 3px 0 black',
        }}
      >
        <h3 className="font-bold mb-2">📈 Your Activity</h3>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="p-2 bg-white rounded-lg border-2 border-black">
            <div className="font-bold text-lg">{sessionsCompleted}</div>
            <div className="text-xs">Sessions</div>
          </div>
          <div className="p-2 bg-white rounded-lg border-2 border-black">
            <div className="font-bold text-lg">{checkinsCompleted}</div>
            <div className="text-xs">Check-ins</div>
          </div>
          <div className="p-2 bg-white rounded-lg border-2 border-black">
            <div className="font-bold text-lg">{challengesCompleted}</div>
            <div className="text-xs">Challenges</div>
          </div>
        </div>
      </div>

      {/* Why This Matters */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: '#98FB98',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-3">❓ Why This Matters</h2>
        <div className="space-y-2">
          {[
            { emoji: '🎯', text: 'Better decisions - know when to ask for help' },
            { emoji: '🛡️', text: 'Less manipulation - harder to fool when you think clearly' },
            { emoji: '💪', text: 'Real confidence - based on evidence, not wishful thinking' },
            { emoji: '🌱', text: 'Intellectual humility - a strength, not a weakness!' },
          ].map((item, i) => (
            <div
              key={i}
              className="p-2 flex items-center gap-2"
              style={{
                backgroundColor: 'white',
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div
        className="p-4 text-center"
        style={{
          backgroundColor: 'white',
          border: '2px dashed black',
          borderRadius: '12px',
        }}
      >
        <p className="text-sm">
          💡 Pro tip: Practice saying "I'm not sure" when you genuinely aren't. It's a superpower!
        </p>
      </div>
    </div>
  )
}
