'use client'

import { useTheme } from '@/lib/ThemeContext'

import { useState } from 'react'

export default function PeerWisdom() {
  const { theme } = useTheme()
  const [markedHelpful, setMarkedHelpful] = useState<Set<string>>(new Set())

  const commonWonders = [
    { q: "What do I want to do with my life?", pct: 87 },
    { q: "Are my friendships healthy?", pct: 73 },
    { q: "Is it ok to feel anxious?", pct: 81 },
    { q: "Do I need it all figured out?", pct: 92 },
  ]

  const peerInsights = [
    { id: '1', topic: 'Decisions', insight: "Most decisions aren't permanent - you can adjust!", emoji: '🎯', count: 234 },
    { id: '2', topic: 'Drama', insight: "Will this matter in a year? Probably not.", emoji: '👥', count: 189 },
    { id: '3', topic: 'Different', insight: "Everyone's pretending. We're all figuring it out!", emoji: '🌟', count: 312 },
    { id: '4', topic: 'Socials', insight: "Unfollow anyone who makes you feel bad.", emoji: '📱', count: 278 },
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

  const getColor = (index: number) => {
    const colors = [theme.colors.accent1, theme.colors.accent2, theme.colors.accent3, theme.colors.accent4]
    return colors[index % colors.length]
  }

  return (
    <div className="max-w-sm mx-auto px-3 py-4">
      {/* Main Card - Screenshot friendly */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '4px solid black',
          boxShadow: '6px 6px 0 black',
          background: `linear-gradient(180deg, ${theme.colors.accent1} 0%, ${theme.colors.accent4} 100%)`,
        }}
      >
        {/* Header */}
        <div className="text-center py-3 px-4">
          <h1 className="text-xl font-bold">👥 Peer Wisdom</h1>
          <p className="text-xs opacity-70">you're not alone in wondering</p>
        </div>

        {/* Common Questions - Compact Grid */}
        <div className="px-3 pb-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: theme.colors.accent5, border: '2px solid black' }}
          >
            <div className="text-xs font-bold mb-2">💭 others wonder too...</div>
            <div className="grid grid-cols-2 gap-1.5">
              {commonWonders.map((wonder, index) => (
                <div
                  key={index}
                  className="p-1.5 rounded-lg text-[10px]"
                  style={{ backgroundColor: theme.colors.backgroundAlt, border: '1px solid black' }}
                >
                  <div className="font-bold leading-tight mb-0.5">"{wonder.q}"</div>
                  <div className="text-[9px] opacity-70">{wonder.pct}% of teens</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peer Insights - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          {peerInsights.map((insight, index) => {
            const isHelpful = markedHelpful.has(insight.id)
            return (
              <button
                key={insight.id}
                onClick={() => handleMarkHelpful(insight.id)}
                className="p-2.5 rounded-xl text-left hover:scale-105 active:scale-95 transition-transform"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '2px solid black',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-base">{insight.emoji}</span>
                  <span
                    className="text-[9px] font-bold px-1 py-0.5 rounded"
                    style={{ backgroundColor: getColor(index) }}
                  >
                    {insight.topic}
                  </span>
                </div>
                <div className="text-[10px] font-bold leading-tight mb-1.5">
                  "{insight.insight}"
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className={isHelpful ? 'font-bold' : 'opacity-60'}>
                    {isHelpful ? '💛 helped!' : '🤍 helpful?'}
                  </span>
                  <span className="opacity-60">{insight.count + (isHelpful ? 1 : 0)}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Privacy + Share Row */}
        <div className="flex gap-2 px-3 pb-3">
          <div
            className="flex-1 p-2 rounded-xl flex items-center gap-1.5"
            style={{ backgroundColor: theme.colors.accent3, border: '2px solid black' }}
          >
            <span className="text-sm">🔒</span>
            <span className="text-[10px] font-bold">all anonymous</span>
          </div>
          <div
            className="flex-1 p-2 rounded-xl flex items-center gap-1.5"
            style={{ backgroundColor: theme.colors.backgroundAlt, border: '2px solid black' }}
          >
            <span className="text-sm">💬</span>
            <span className="text-[10px] font-bold">share your wisdom!</span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center py-2 px-3 text-[10px] font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
        >
          tap to mark helpful · npc.chat
        </div>
      </div>
    </div>
  )
}
