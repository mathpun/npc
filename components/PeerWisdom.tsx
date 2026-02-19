'use client'

import { useTheme } from '@/lib/ThemeContext'

import { useState } from 'react'

export default function PeerWisdom() {
  const { theme } = useTheme()
  const [markedHelpful, setMarkedHelpful] = useState<Set<string>>(new Set())

  const commonWonders = [
    { question: "What do I actually want to do with my life?", percentage: 87 },
    { question: "How do I know if my friendships are healthy?", percentage: 73 },
    { question: "Am I normal for feeling anxious about the future?", percentage: 81 },
    { question: "Is it okay to not have everything figured out?", percentage: 92 },
  ]

  const peerInsights = [
    {
      id: '1',
      topic: 'Making decisions',
      insight: "I used to think every decision was permanent. Then I realized most aren't - you can adjust!",
      emoji: '🎯',
      color: theme.colors.accent1,
      helpfulCount: 234,
    },
    {
      id: '2',
      topic: 'Friend drama',
      insight: "Ask yourself: 'will this matter in a year?' Most friend drama won't.",
      emoji: '👥',
      color: theme.colors.accent4,
      helpfulCount: 189,
    },
    {
      id: '3',
      topic: 'Feeling different',
      insight: "Everyone feels like they're pretending. We're all figuring it out together!",
      emoji: '🌟',
      color: theme.colors.accent3,
      helpfulCount: 312,
    },
    {
      id: '4',
      topic: 'Social media',
      insight: "I unfollowed anyone who made me feel bad. My feed is smaller but I actually enjoy it.",
      emoji: '📱',
      color: theme.colors.accent2,
      helpfulCount: 278,
    },
  ]

  const handleMarkHelpful = (id: string) => {
    const newSet = new Set(markedHelpful)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setMarkedHelpful(newSet)
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
          👥 Peer Wisdom 👥
        </h1>
        <p className="text-lg mt-4">You're not alone in what you're thinking about!</p>
      </div>

      {/* Privacy Note */}
      <div
        className="p-3 flex items-center gap-2"
        style={{
          backgroundColor: theme.colors.accent3,
          border: '3px solid black',
          borderRadius: '12px',
        }}
      >
        <span className="text-xl">🔒</span>
        <p className="text-sm">All insights are anonymous. No names, no identifying info.</p>
      </div>

      {/* Common Wonders */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: theme.colors.accent5,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4">💭 You're Not Alone In Wondering...</h2>
        <div className="space-y-2">
          {commonWonders.map((wonder, index) => (
            <div
              key={index}
              className="p-3 flex items-center justify-between"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '2px 2px 0 black',
                transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
              }}
            >
              <p className="text-sm font-bold flex-1">"{wonder.question}"</p>
              <div
                className="px-3 py-1 ml-2"
                style={{
                  backgroundColor: theme.colors.accent2,
                  border: '2px solid black',
                  borderRadius: '8px',
                }}
              >
                <span className="font-bold">{wonder.percentage}%</span>
                <span className="text-xs"> of teens</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peer Insights */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: theme.colors.accent4,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4">💡 Wisdom From Other Teens</h2>
        <div className="space-y-3">
          {peerInsights.map((insight, index) => {
            const isHelpful = markedHelpful.has(insight.id)
            return (
              <div
                key={insight.id}
                className="p-4"
                style={{
                  backgroundColor: insight.color,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                  transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{insight.emoji}</span>
                  <span
                    className="px-2 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: theme.colors.backgroundAlt,
                      border: '2px solid black',
                      borderRadius: '8px',
                    }}
                  >
                    {insight.topic}
                  </span>
                </div>
                <p className="font-bold mb-3">"{insight.insight}"</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleMarkHelpful(insight.id)}
                    className="px-3 py-1 font-bold hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: isHelpful ? theme.colors.accent2 : theme.colors.backgroundAlt,
                      border: '2px solid black',
                      borderRadius: '8px',
                    }}
                  >
                    {isHelpful ? '💛 Helpful!' : '🤍 This helped'}
                  </button>
                  <span className="text-xs">
                    {insight.helpfulCount + (isHelpful ? 1 : 0)} found this helpful
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Share CTA */}
      <div
        className="p-4 text-center"
        style={{
          backgroundColor: theme.colors.background,
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 black',
        }}
      >
        <p className="font-bold mb-2">Got wisdom to share? 🌟</p>
        <p className="text-sm">Your insight could help hundreds of other teens!</p>
      </div>
    </div>
  )
}
