'use client'

import { useState } from 'react'
import { SessionGoal, PersonaType, SESSION_GOALS, PERSONAS } from '@/lib/prompts'

interface SessionPickerProps {
  onSelect: (goal: SessionGoal, topic: string, persona: PersonaType) => void
  onClose?: () => void
}

type Step = 'goal' | 'persona'

export default function SessionPicker({ onSelect, onClose }: SessionPickerProps) {
  const [step, setStep] = useState<Step>('goal')
  const [selectedGoal, setSelectedGoal] = useState<SessionGoal | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null)
  const [topic, setTopic] = useState('')

  const handleGoalSelect = (goal: SessionGoal) => {
    setSelectedGoal(goal)
  }

  const handleGoalContinue = () => {
    if (selectedGoal) {
      setStep('persona')
    }
  }

  const handleBack = () => {
    setStep('goal')
    setSelectedPersona(null)
  }

  const handleStart = () => {
    if (selectedGoal && selectedPersona) {
      onSelect(selectedGoal, topic, selectedPersona)
    }
  }

  // Step 1: Goal Selection
  if (step === 'goal') {
    return (
      <div className="w-full max-w-2xl mx-auto">
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
          {/* Curious blob */}
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
            what's on your mind?
          </h2>
        </div>

        {/* Goal selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {(Object.entries(SESSION_GOALS) as [SessionGoal, typeof SESSION_GOALS.thinking][]).map(([key, goal], i) => {
            const isSelected = selectedGoal === key

            return (
              <button
                key={key}
                onClick={() => handleGoalSelect(key)}
                className="p-5 text-left transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: isSelected ? goal.color : 'white',
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
                      backgroundColor: isSelected ? 'white' : goal.color,
                      border: '2px solid black',
                    }}
                  >
                    {goal.emoji}
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
              what specifically? (optional)
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
            <p className="text-sm mt-2 opacity-70">
              e.g., {SESSION_GOALS[selectedGoal].examples.join(' • ')}
            </p>
          </div>
        )}

        {/* Continue button */}
        <div className="flex justify-center">
          <button
            onClick={handleGoalContinue}
            disabled={!selectedGoal}
            className="px-10 py-4 text-xl font-bold transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: selectedGoal ? '#90EE90' : '#ccc',
              border: '4px solid black',
              borderRadius: '9999px',
              boxShadow: selectedGoal ? '5px 5px 0 black' : 'none',
              cursor: selectedGoal ? 'pointer' : 'not-allowed',
            }}
          >
            next: pick your vibe →
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Persona Selection
  return (
    <div className="w-full max-w-2xl mx-auto">
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

      <div className="text-center mb-6">
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '9999px',
          }}
        >
          ← back
        </button>

        <h2
          className="text-2xl font-bold inline-block px-6 py-3 rotate-1"
          style={{
            backgroundColor: '#87CEEB',
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
          }}
        >
          who do you wanna talk to?
        </h2>
        <p className="text-lg mt-4">pick the vibe that feels right for this convo</p>
      </div>

      {/* Persona selection */}
      <div className="space-y-3 mb-8">
        {(Object.entries(PERSONAS) as [PersonaType, typeof PERSONAS.chill_mentor][]).map(([key, persona]) => {
          const isSelected = selectedPersona === key

          return (
            <button
              key={key}
              onClick={() => setSelectedPersona(key)}
              className="w-full p-4 text-left transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: isSelected ? persona.color : 'white',
                border: '3px solid black',
                borderRadius: '16px',
                boxShadow: isSelected ? '6px 6px 0 black' : '3px 3px 0 black',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                  style={{
                    backgroundColor: isSelected ? 'white' : persona.color,
                    border: '3px solid black',
                  }}
                >
                  {persona.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{persona.label}</h3>
                  <p className="text-sm opacity-80">{persona.description}</p>
                </div>
                {isSelected && (
                  <div className="text-2xl">✓</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Start button */}
      <div className="flex justify-center">
        <button
          onClick={handleStart}
          disabled={!selectedPersona}
          className="px-10 py-4 text-xl font-bold transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: selectedPersona ? '#FF69B4' : '#ccc',
            border: '4px solid black',
            borderRadius: '9999px',
            boxShadow: selectedPersona ? '5px 5px 0 black' : 'none',
            cursor: selectedPersona ? 'pointer' : 'not-allowed',
          }}
        >
          let's go! 🚀
        </button>
      </div>

      {/* Selected session summary */}
      {selectedGoal && (
        <div
          className="mt-6 p-3 text-center text-sm"
          style={{
            backgroundColor: SESSION_GOALS[selectedGoal].color,
            border: '2px dashed black',
            borderRadius: '8px',
          }}
        >
          <span className="font-bold">{SESSION_GOALS[selectedGoal].emoji} {SESSION_GOALS[selectedGoal].label}</span>
          {topic && <span className="opacity-70"> · "{topic}"</span>}
        </div>
      )}
    </div>
  )
}
