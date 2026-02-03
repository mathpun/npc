'use client'

import { useState } from 'react'

interface AntiEngagementProps {
  userName: string
  sessionsThisWeek: number
  avgSessionLength: number
  independentDecisions: number
  irlActionsReported: number
}

export default function AntiEngagement({
  userName,
  sessionsThisWeek = 5,
  avgSessionLength = 12,
  independentDecisions = 8,
  irlActionsReported = 3
}: AntiEngagementProps) {
  const independenceScore = Math.min(100, Math.round(
    (independentDecisions * 5) +
    (irlActionsReported * 10) +
    (sessionsThisWeek < 10 ? 20 : 0) +
    (avgSessionLength < 15 ? 15 : 0)
  ))

  const getLevel = () => {
    if (independenceScore >= 80) return { label: 'Thriving! 🌟', color: '#90EE90' }
    if (independenceScore >= 60) return { label: 'Growing 🌿', color: '#87CEEB' }
    if (independenceScore >= 40) return { label: 'Building 🌱', color: '#FFD700' }
    return { label: 'Starting 🌰', color: '#FFB6C1' }
  }

  const level = getLevel()

  const celebrations = [
    independentDecisions > 5 && `You made ${independentDecisions} decisions without AI this week!`,
    irlActionsReported > 2 && `You took action in the real world ${irlActionsReported} times!`,
    sessionsThisWeek < 7 && "Healthy usage - you're not over-relying on AI",
    avgSessionLength < 15 && "Your sessions are focused and efficient"
  ].filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-black" style={{  }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-3 inline-block px-6 py-2 rotate-1"
          style={{
            backgroundColor: '#90EE90',
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 black',
          }}
        >
          🦋 Independence Score 🦋
        </h1>
        <div
          className="mt-4 inline-block px-4 py-2"
          style={{
            backgroundColor: '#FFD700',
            border: '2px solid black',
            borderRadius: '9999px',
          }}
        >
          <span className="text-sm font-bold">📉 We celebrate when you need us LESS!</span>
        </div>
      </div>

      {/* Score Circle */}
      <div
        className="p-6 text-center -rotate-1"
        style={{
          backgroundColor: level.color,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <p className="font-bold mb-3">Your Independence Score</p>
        <div
          className="w-36 h-36 mx-auto mb-4 flex flex-col items-center justify-center"
          style={{
            backgroundColor: 'white',
            border: '4px solid black',
            borderRadius: '50%',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <span className="text-5xl font-bold">{independenceScore}</span>
        </div>
        <p className="text-xl font-bold">{level.label}</p>
        <p className="text-sm mt-2">This measures how much you think for yourself!</p>
      </div>

      {/* Celebrations */}
      {celebrations.length > 0 && (
        <div
          className="p-5 rotate-1"
          style={{
            backgroundColor: '#FFD700',
            border: '4px solid black',
            borderRadius: '16px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <h2 className="text-xl font-bold mb-4">🎉 This Week's Wins</h2>
          <div className="space-y-2">
            {celebrations.map((celebration, i) => (
              <div
                key={i}
                className="p-3 flex items-center gap-2"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '2px 2px 0 black',
                  transform: `rotate(${i % 2 === 0 ? 1 : -1}deg)`,
                }}
              >
                <span className="text-xl">🏆</span>
                <span className="text-sm font-bold">{celebration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anti-Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Decisions without AI', value: independentDecisions, emoji: '🧠', color: '#FF69B4' },
          { label: 'Real-world actions', value: irlActionsReported, emoji: '🌍', color: '#87CEEB' },
          { label: 'Avg session (mins)', value: `${avgSessionLength}m`, emoji: '⏱️', color: '#90EE90' },
          { label: 'Days without us', value: Math.max(0, 7 - sessionsThisWeek), emoji: '☕', color: '#DDA0DD' },
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
            <span className="text-2xl">{stat.emoji}</span>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-bold">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Take a Break */}
      {sessionsThisWeek > 7 && (
        <div
          className="p-4"
          style={{
            backgroundColor: '#FFB6C1',
            border: '3px solid black',
            borderRadius: '12px',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <p className="font-bold">☕ Consider a thinking break?</p>
          <p className="text-sm mt-1">
            You've had {sessionsThisWeek} sessions this week. Real growth often happens offline!
          </p>
        </div>
      )}

      {/* Philosophy */}
      <div
        className="p-4 text-center"
        style={{
          backgroundColor: 'white',
          border: '2px dashed black',
          borderRadius: '12px',
        }}
      >
        <p className="text-sm">
          💭 Most apps want you to use them more. We measure success by how well you think on your own!
        </p>
      </div>
    </div>
  )
}
