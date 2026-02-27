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

  // Quick start handler
  const handleQuickStart = () => {
    onSelect('stuck', '', 'chill_mentor')
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

        {/* Fun animated header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <svg className="w-24 h-28 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 60 70">
                <ellipse cx="30" cy="45" rx="20" ry="25" fill="#FFD700" stroke="black" strokeWidth="3"/>
                <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
                <circle cx="24" cy="16" r="5" fill="black"/>
                <circle cx="36" cy="16" r="5" fill="black"/>
                <circle cx="25" cy="15" r="2" fill="white"/>
                <circle cx="37" cy="15" r="2" fill="white"/>
                <ellipse cx="30" cy="28" rx="4" ry="3" fill="black"/>
              </svg>
              <span className="absolute -top-2 -right-4 text-2xl animate-pulse">✨</span>
              <span className="absolute -bottom-2 -left-4 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>💭</span>
            </div>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold inline-block px-6 py-3 -rotate-2"
            style={{
              background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 50%, #87CEEB 100%)',
              border: '4px solid black',
              borderRadius: '16px',
              boxShadow: '6px 6px 0 black',
            }}
          >
            what&apos;s on your mind? 🌟
          </h2>
        </div>

        {/* Just Chat - big fun button */}
        <button
          onClick={handleQuickStart}
          className="w-full max-w-sm mx-auto mb-6 px-8 py-6 text-xl font-bold transition-all duration-300 hover:scale-105 hover:-rotate-1 flex items-center justify-center gap-4 group"
          style={{
            background: 'linear-gradient(135deg, #90EE90 0%, #7BED9F 100%)',
            border: '4px solid black',
            borderRadius: '24px',
            boxShadow: '8px 8px 0 black',
          }}
        >
          <span className="text-4xl group-hover:animate-bounce">👻</span>
          <span>just chat!</span>
          <span className="text-2xl group-hover:animate-pulse">→</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t-2 border-dashed border-black/30" />
          <span className="text-sm font-bold text-gray-500">or pick a vibe</span>
          <div className="flex-1 border-t-2 border-dashed border-black/30" />
        </div>

        {/* Goal selection - colorful cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(Object.entries(SESSION_GOALS) as [SessionGoal, typeof SESSION_GOALS.stuck][]).map(([key, goal], i) => {
            const isSelected = selectedGoal === key

            return (
              <button
                key={key}
                onClick={() => handleGoalSelect(key)}
                className="p-4 text-center transition-all duration-200 hover:scale-110 hover:-rotate-2"
                style={{
                  backgroundColor: goal.color,
                  border: '3px solid black',
                  borderRadius: '16px',
                  boxShadow: isSelected ? '6px 6px 0 black' : '4px 4px 0 black',
                  transform: isSelected ? 'scale(1.05) rotate(-2deg)' : `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
                }}
              >
                <div className="text-3xl mb-2">{goal.emoji}</div>
                <div className="font-bold text-sm">{goal.label}</div>
                {isSelected && <div className="text-lg mt-1">✓</div>}
              </button>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handleGoalContinue}
            disabled={!selectedGoal}
            className="px-8 py-3 font-bold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: selectedGoal ? '#FFD700' : '#ddd',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: selectedGoal ? '4px 4px 0 black' : 'none',
              cursor: selectedGoal ? 'pointer' : 'not-allowed',
            }}
          >
            {selectedGoal ? 'pick who to talk to →' : 'select a vibe first'}
          </button>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="px-6 py-3 font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: '#E6E6FA',
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: '4px 4px 0 black',
              }}
            >
              📋 past chats
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
            create your own persona ✨
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
                <p className="text-sm opacity-80">{customDescription || 'your custom persona'}</p>
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
            create & use this persona ✨
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
        <p className="text-lg mt-4">pick the personality that fits this convo</p>
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
              {selectedPersona === 'custom' && customDescription ? customDescription : 'design a custom persona'}
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
        </div>
      )}
    </div>
  )
}
