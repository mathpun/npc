'use client'

import { useState } from 'react'

interface DevelopmentalProgressProps {
  userName: string
  age: number
  reflectiveThinkingScore: number
  sessionsCompleted: number
  challengesCompleted: number
}

export default function DevelopmentalProgress({
  userName,
  age,
  reflectiveThinkingScore = 65,
  sessionsCompleted = 12,
  challengesCompleted = 4
}: DevelopmentalProgressProps) {
  const capabilities = [
    {
      name: 'Deeper Questions',
      description: 'AI asks more challenging questions',
      emoji: '🧠',
      isUnlocked: sessionsCompleted >= 5,
      progress: Math.min(100, (sessionsCompleted / 5) * 100),
      color: '#FF69B4',
    },
    {
      name: 'Embrace Complexity',
      description: 'Explore nuanced topics',
      emoji: '🧭',
      isUnlocked: reflectiveThinkingScore > 60,
      progress: Math.min(100, (reflectiveThinkingScore / 60) * 100),
      color: '#87CEEB',
    },
    {
      name: 'Values Deep Dive',
      description: 'Clarify what matters to you',
      emoji: '⭐',
      isUnlocked: challengesCompleted >= 3,
      progress: Math.min(100, (challengesCompleted / 3) * 100),
      color: '#FFD700',
    },
    {
      name: 'Mentor Mode',
      description: 'Practice giving advice',
      emoji: '🛡️',
      isUnlocked: reflectiveThinkingScore > 75 && age >= 16,
      progress: Math.min(100, (reflectiveThinkingScore / 75) * 100),
      color: '#90EE90',
    },
    {
      name: 'Future Self',
      description: 'Talk to future you',
      emoji: '⚡',
      isUnlocked: sessionsCompleted >= 10 && challengesCompleted >= 3,
      progress: Math.min(100, ((sessionsCompleted / 10) * 50) + ((challengesCompleted / 3) * 50)),
      color: '#DDA0DD',
    },
  ]

  const unlockedCount = capabilities.filter(c => c.isUnlocked).length

  const getDevStage = () => {
    if (age <= 14) return { stage: 'Early Teen', emoji: '🌱', color: '#90EE90' }
    if (age <= 16) return { stage: 'Mid Teen', emoji: '🌿', color: '#87CEEB' }
    return { stage: 'Late Teen', emoji: '🌳', color: '#DDA0DD' }
  }

  const devStage = getDevStage()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-black" style={{  }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-3 inline-block px-6 py-2 rotate-1"
          style={{
            backgroundColor: '#FF69B4',
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 black',
          }}
        >
          📈 Your Progress 📈
        </h1>
      </div>

      {/* Dev Stage Card */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: devStage.color,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{devStage.emoji}</span>
            <div>
              <h2 className="text-xl font-bold">{devStage.stage}</h2>
              <p className="text-sm">{userName}, {age} years old</p>
            </div>
          </div>
          <div
            className="px-4 py-2 text-center"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <div className="text-2xl font-bold">{unlockedCount}/{capabilities.length}</div>
            <div className="text-xs font-bold">unlocked</div>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: '#FFD700',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4">🎯 Your Capabilities</h2>
        <div className="space-y-3">
          {capabilities.map((cap, index) => (
            <div
              key={cap.name}
              className="p-3"
              style={{
                backgroundColor: cap.isUnlocked ? cap.color : 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
                opacity: cap.isUnlocked ? 1 : 0.6,
                transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cap.isUnlocked ? cap.emoji : '🔒'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{cap.name}</h3>
                    {cap.isUnlocked && <span className="text-lg">✅</span>}
                  </div>
                  <p className="text-sm">{cap.description}</p>
                  {!cap.isUnlocked && (
                    <div className="mt-2">
                      <div
                        className="h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#f0f0f0', border: '2px solid black' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cap.progress}%`, backgroundColor: cap.color }}
                        />
                      </div>
                      <p className="text-xs mt-1">{Math.round(cap.progress)}% there!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div
        className="p-4 text-center -rotate-1"
        style={{
          backgroundColor: 'white',
          border: '2px dashed black',
          borderRadius: '12px',
        }}
      >
        <p className="text-sm">
          🛡️ Features unlock based on your growth, not just time. Keep reflecting!
        </p>
      </div>
    </div>
  )
}
