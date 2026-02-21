'use client'

import { useState } from 'react'
import { SessionGoal, PersonaType, SESSION_GOALS, PERSONAS, CustomPersona } from '@/lib/prompts'

interface SessionPickerProps {
  onSelect: (goal: SessionGoal, topic: string, persona: PersonaType, customPersona?: CustomPersona) => void
  onClose?: () => void
  onOpenHistory?: () => void
}

type Step = 'goal' | 'persona' | 'custom'

const EMOJI_OPTIONS = ['😊', '🦊', '🌟', '🔮', '🎭', '🦋', '🌈', '🍄', '🐉', '👽', '🤖', '🧙', '🦄', '🐱', '🎪', '💫']

export default function SessionPicker({ onSelect, onClose, onOpenHistory }: SessionPickerProps) {
  const [step, setStep] = useState<Step>('goal')
  const [selectedGoal, setSelectedGoal] = useState<SessionGoal | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null)
  const [topic, setTopic] = useState('')

  // Custom persona state
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('✨')
  const [customDescription, setCustomDescription] = useState('')
  const [customVibe, setCustomVibe] = useState('')

  const handleGoalSelect = (goal: SessionGoal) => {
    setSelectedGoal(goal)
  }

  const handleGoalContinue = () => {
    if (selectedGoal) {
      setStep('persona')
    }
  }

  const handleBack = () => {
    if (step === 'custom') {
      setStep('persona')
    } else {
      setStep('goal')
      setSelectedPersona(null)
    }
  }

  const handlePersonaSelect = (key: PersonaType) => {
    if (key === 'custom') {
      setStep('custom')
    } else {
      setSelectedPersona(key)
    }
  }

  const handleCustomCreate = () => {
    if (customName && customVibe) {
      setSelectedPersona('custom')
      setStep('persona')
    }
  }

  const handleStart = () => {
    if (selectedGoal && selectedPersona) {
      if (selectedPersona === 'custom') {
        const customPersona: CustomPersona = {
          name: customName,
          emoji: customEmoji,
          description: customDescription,
          vibe: customVibe,
        }
        onSelect(selectedGoal, topic, selectedPersona, customPersona)
      } else {
        onSelect(selectedGoal, topic, selectedPersona)
      }
    }
  }

  // Step 1: Goal Selection
  if (step === 'goal') {
    return (
      <div className="w-full max-w-2xl mx-auto text-black">
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
          {(Object.entries(SESSION_GOALS) as [SessionGoal, typeof SESSION_GOALS.stuck][]).map(([key, goal], i) => {
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
        <div className="flex flex-col items-center gap-4">
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

          {/* Continue past chat button */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="px-6 py-3 font-bold text-sm transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: '#FFD700',
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              📋 continue a past chat
            </button>
          )}
        </div>
      </div>
    )
  }

  // Step 3: Custom Persona Creator
  if (step === 'custom') {
    return (
      <div className="w-full max-w-2xl mx-auto text-black">
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
              backgroundColor: '#FF69B4',
              border: '4px solid black',
              boxShadow: '6px 6px 0 black',
            }}
          >
            create your own vibe ✨
          </h2>
        </div>

        <div className="space-y-4">
          {/* Emoji picker */}
          <div
            className="p-4"
            style={{
              backgroundColor: '#FFFACD',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <label className="block font-bold mb-2">pick an emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setCustomEmoji(emoji)}
                  className="w-10 h-10 text-xl flex items-center justify-center hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: customEmoji === emoji ? '#FF69B4' : 'white',
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div
            className="p-4"
            style={{
              backgroundColor: '#87CEEB',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <label className="block font-bold mb-2">what's their name?</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Wise Space Cat, Chaotic Aunt Energy..."
              className="w-full px-4 py-3"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
              }}
            />
          </div>

          {/* Description */}
          <div
            className="p-4"
            style={{
              backgroundColor: '#90EE90',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <label className="block font-bold mb-2">short description (optional)</label>
            <input
              type="text"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="e.g., mysterious but caring vibes"
              className="w-full px-4 py-3"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
              }}
            />
          </div>

          {/* Vibe/Style */}
          <div
            className="p-4"
            style={{
              backgroundColor: '#DDA0DD',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <label className="block font-bold mb-2">how should they talk?</label>
            <textarea
              value={customVibe}
              onChange={(e) => setCustomVibe(e.target.value)}
              placeholder="e.g., speaks in riddles but also gives really practical advice, uses lots of space metaphors, always asks 'but how does that make you feel?'"
              className="w-full px-4 py-3"
              rows={3}
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
              }}
            />
            <p className="text-sm mt-2 opacity-70">
              describe their personality, how they talk, what makes them unique
            </p>
          </div>
        </div>

        {/* Preview */}
        {customName && (
          <div
            className="mt-6 p-4"
            style={{
              backgroundColor: '#FFB6C1',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            <p className="font-bold mb-2">preview:</p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                }}
              >
                {customEmoji}
              </div>
              <div>
                <h3 className="font-bold">{customName}</h3>
                <p className="text-sm opacity-80">{customDescription || 'your custom vibe'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleCustomCreate}
            disabled={!customName || !customVibe}
            className="px-10 py-4 text-xl font-bold transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: customName && customVibe ? '#90EE90' : '#ccc',
              border: '4px solid black',
              borderRadius: '9999px',
              boxShadow: customName && customVibe ? '5px 5px 0 black' : 'none',
              cursor: customName && customVibe ? 'pointer' : 'not-allowed',
            }}
          >
            create & use this vibe ✨
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Persona Selection
  return (
    <div className="w-full max-w-2xl mx-auto text-black">
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
      <div className="space-y-3 mb-4">
        {(Object.entries(PERSONAS) as [PersonaType, typeof PERSONAS.chill_mentor][])
          .filter(([key]) => key !== 'custom')
          .map(([key, persona]) => {
            const isSelected = selectedPersona === key

            return (
              <button
                key={key}
                onClick={() => handlePersonaSelect(key)}
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

      {/* Custom persona button */}
      <button
        onClick={() => handlePersonaSelect('custom')}
        className="w-full p-4 text-left transition-all duration-200 hover:scale-[1.02] mb-8"
        style={{
          backgroundColor: selectedPersona === 'custom' ? '#FF69B4' : 'white',
          border: '3px dashed black',
          borderRadius: '16px',
          boxShadow: '3px 3px 0 black',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
            style={{
              backgroundColor: selectedPersona === 'custom' ? 'white' : '#FF69B4',
              border: '3px solid black',
            }}
          >
            {selectedPersona === 'custom' && customEmoji ? customEmoji : '➕'}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">
              {selectedPersona === 'custom' && customName ? customName : 'Create Your Own'}
            </h3>
            <p className="text-sm opacity-80">
              {selectedPersona === 'custom' && customDescription ? customDescription : 'design a custom vibe'}
            </p>
          </div>
          {selectedPersona === 'custom' && (
            <div className="text-2xl">✓</div>
          )}
        </div>
      </button>

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
