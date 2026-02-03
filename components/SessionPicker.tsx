'use client'

import { useState } from 'react'
import { SessionGoal, SESSION_GOALS } from '@/lib/prompts'

const GOAL_STYLES: Record<string, { color: string; emoji: string }> = {
  thinking: { color: '#DDA0DD', emoji: '🧠' },
  deciding: { color: '#FFD700', emoji: '🤔' },
  creating: { color: '#90EE90', emoji: '✨' },
  processing: { color: '#87CEEB', emoji: '💭' },
}

interface SessionPickerProps {
  onSelect: (goal: SessionGoal, topic: string) => void
  onClose?: () => void
}

export default function SessionPicker({ onSelect, onClose }: SessionPickerProps) {
  const [selectedGoal, setSelectedGoal] = useState<SessionGoal | null>(null)
  const [topic, setTopic] = useState('')

  const handleContinue = () => {
    if (selectedGoal) {
      onSelect(selectedGoal, topic)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto" style={{  }}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center font-bold text-xl hover:scale-110 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          ✕
        </button>
      )}

      <div className="text-center mb-8">
        {/* Little curious blob */}
        <div className="flex justify-center mb-4">
          <svg width="80" height="90" viewBox="0 0 60 70">
            <ellipse cx="30" cy="45" rx="20" ry="25" fill="#FFD700" stroke="black" strokeWidth="3"/>
            <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
            <circle cx="24" cy="16" r="5" fill="black"/>
            <circle cx="36" cy="16" r="5" fill="black"/>
            <circle cx="25" cy="15" r="2" fill="white"/>
            <circle cx="37" cy="15" r="2" fill="white"/>
            <ellipse cx="30" cy="28" rx="4" ry="3" fill="black"/>
            <text x="50" y="10" fontSize="16">?</text>
          </svg>
        </div>
        <h2
          className="text-2xl font-bold inline-block px-6 py-3 -rotate-1"
          style={{
            backgroundColor: '#FF69B4',
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
          }}
        >
          what brings you here?
        </h2>
        <p className="text-lg mt-4">choose what kind of thinking you wanna do</p>
      </div>

      {/* Goal selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {(Object.entries(SESSION_GOALS) as [SessionGoal, typeof SESSION_GOALS.thinking][]).map(([key, goal], i) => {
          const style = GOAL_STYLES[key] || { color: '#DDA0DD', emoji: '💭' }
          const isSelected = selectedGoal === key

          return (
            <button
              key={key}
              onClick={() => setSelectedGoal(key)}
              className="p-5 text-left transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: isSelected ? style.color : 'white',
                border: '3px solid black',
                borderRadius: '16px',
                boxShadow: isSelected ? '6px 6px 0 black' : '4px 4px 0 black',
                transform: `rotate(${(i % 2 === 0 ? -1 : 1)}deg)`,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: isSelected ? 'white' : style.color,
                    border: '2px solid black',
                  }}
                >
                  {style.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{goal.label}</h3>
                  <p className="text-sm">{goal.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Topic input */}
      {selectedGoal && (
        <div
          className="mb-6 p-4 rotate-1"
          style={{
            backgroundColor: '#FFFACD',
            border: '3px solid black',
            borderRadius: '12px',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <label className="block text-lg font-bold mb-2">
            what specifically? (optional but helpful)
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={SESSION_GOALS[selectedGoal].examples.join(', ')}
            className="w-full px-4 py-3 text-lg"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
            }}
            autoFocus
          />
          <p className="text-sm mt-2">
            examples: {SESSION_GOALS[selectedGoal].examples.join(' • ')}
          </p>
        </div>
      )}

      {/* Continue button */}
      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedGoal}
          className="px-10 py-4 text-xl font-bold transition-all duration-300"
          style={{
            backgroundColor: selectedGoal ? '#90EE90' : '#ccc',
            border: '4px solid black',
            borderRadius: '9999px',
            boxShadow: selectedGoal ? '5px 5px 0 black' : 'none',
            cursor: selectedGoal ? 'pointer' : 'not-allowed',
          }}
        >
          start session! →
        </button>
      </div>

      {/* Context note */}
      <p
        className="text-sm text-center mt-6 px-4 py-2 mx-auto w-fit"
        style={{
          backgroundColor: 'white',
          border: '2px dashed black',
          borderRadius: '8px',
        }}
      >
        this helps me ask better questions and give you more relevant prompts!
      </p>
    </div>
  )
}
