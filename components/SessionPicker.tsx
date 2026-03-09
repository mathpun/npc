'use client'

import { useState, useEffect } from 'react'
import { SessionGoal, PersonaType, SESSION_GOALS, PERSONAS, CustomPersona } from '@/lib/prompts'

interface RecentChat {
  id: number
  title: string | null
  session_topic: string | null
  first_message: string | null
  started_at: string
  message_count: number
  bucket_name: string | null
  bucket_emoji: string | null
}

interface Bucket {
  id: number
  name: string
  emoji: string
  session_count: number
}

interface SessionPickerProps {
  onSelect: (goal: SessionGoal, topic: string, persona: PersonaType, customPersona?: CustomPersona) => void
  onClose?: () => void
  onOpenHistory?: () => void
  onLoadSession?: (sessionId: number) => void
}

type Step = 'goal' | 'persona' | 'custom'

const EMOJI_OPTIONS = ['😊', '🦊', '🌟', '🔮', '🎭', '🦋', '🌈', '🍄', '🐉', '👽', '🤖', '🧙', '🦄', '🐱', '🎪', '💫']

export default function SessionPicker({ onSelect, onClose, onOpenHistory, onLoadSession }: SessionPickerProps) {
  const [step, setStep] = useState<Step>('goal')
  const [selectedGoal, setSelectedGoal] = useState<SessionGoal | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null)
  const [topic, setTopic] = useState('')

  // Recent chats and buckets
  const [recentChats, setRecentChats] = useState<RecentChat[]>([])
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  // Custom persona state
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('✨')
  const [customDescription, setCustomDescription] = useState('')
  const [customVibe, setCustomVibe] = useState('')
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Fetch recent chats and buckets
  useEffect(() => {
    const fetchRecent = async () => {
      const userId = localStorage.getItem('npc_user_id')
      if (!userId) {
        setLoadingRecent(false)
        return
      }

      try {
        // Fetch recent sessions
        const sessionsRes = await fetch(`/api/chat-sessions?userId=${userId}&limit=3`)
        if (sessionsRes.ok) {
          const data = await sessionsRes.json()
          setRecentChats(data.sessions || [])
        }

        // Fetch buckets
        const bucketsRes = await fetch(`/api/chat-buckets?userId=${userId}`)
        if (bucketsRes.ok) {
          const data = await bucketsRes.json()
          setBuckets(data.buckets || [])
        }
      } catch (err) {
        console.error('Failed to fetch recent:', err)
      } finally {
        setLoadingRecent(false)
      }
    }

    fetchRecent()
  }, [])

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'yesterday'
    return `${days}d ago`
  }

  const getChatTitle = (chat: RecentChat) => {
    if (chat.title) return chat.title
    if (chat.session_topic) return chat.session_topic.slice(0, 30) + (chat.session_topic.length > 30 ? '...' : '')
    if (chat.first_message) return chat.first_message.slice(0, 30) + (chat.first_message.length > 30 ? '...' : '')
    return 'Untitled chat'
  }

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

  const handleCustomCreate = async () => {
    if (customName && customVibe) {
      // Generate AI image for the persona
      setIsGeneratingImage(true)
      try {
        const res = await fetch('/api/persona-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: customName,
            emoji: customEmoji,
            description: customDescription,
            vibe: customVibe,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setCustomImageUrl(data.imageUrl)
        }
      } catch (err) {
        console.error('Failed to generate persona image:', err)
      } finally {
        setIsGeneratingImage(false)
      }

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
          imageUrl: customImageUrl || undefined,
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
      <div className="w-full max-w-md mx-auto text-black px-4">
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


        {/* Centered animated character */}
        <div className="flex flex-col items-center mb-5">
          <div className="relative mb-3">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl animate-bounce"
              style={{
                animationDuration: '2s',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                border: '3px solid black',
                boxShadow: '3px 3px 0 black',
              }}
            >
              👻
            </div>
            <span className="absolute -top-1 -right-1 text-lg animate-pulse">✨</span>
          </div>

          <h2
            className="text-lg sm:text-xl font-bold text-center px-5 py-2"
            style={{
              background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 50%, #87CEEB 100%)',
              border: '3px solid black',
              borderRadius: '14px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            mood?
          </h2>
        </div>

        {/* Goal selection - 2x4 colorful grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(Object.entries(SESSION_GOALS) as [SessionGoal, typeof SESSION_GOALS.stuck][]).map(([key, goal]) => {
            const isSelected = selectedGoal === key

            return (
              <button
                key={key}
                onClick={() => handleGoalSelect(key)}
                className="p-2 sm:p-3 text-center transition-all duration-200 hover:scale-105 aspect-square flex flex-col items-center justify-center"
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #FF6B9D 0%, #FFD93D 50%, #7BED9F 100%)' : goal.color,
                  border: isSelected ? '4px solid black' : '2px solid black',
                  borderRadius: '12px',
                  boxShadow: isSelected ? '4px 4px 0 black' : '2px 2px 0 black',
                  transform: isSelected ? 'scale(1.08)' : 'none',
                }}
              >
                <div className="text-xl sm:text-2xl">{goal.emoji}</div>
                <div className="font-bold text-[9px] sm:text-[11px] leading-tight mt-1">{goal.label}</div>
              </button>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={handleGoalContinue}
            disabled={!selectedGoal}
            className="px-5 py-2 font-bold text-sm transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: selectedGoal ? '#FFD700' : '#e0e0e0',
              border: '2px solid black',
              borderRadius: '9999px',
              boxShadow: selectedGoal ? '3px 3px 0 black' : 'none',
              cursor: selectedGoal ? 'pointer' : 'not-allowed',
              opacity: selectedGoal ? 1 : 0.6,
            }}
          >
            {selectedGoal ? 'pick a character →' : 'tap a vibe'}
          </button>

          {onOpenHistory && recentChats.length === 0 && (
            <button
              onClick={onOpenHistory}
              className="px-4 py-2 font-bold text-sm transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: '#E6E6FA',
                border: '2px solid black',
                borderRadius: '9999px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              📋 history
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 border-t-2 border-dashed border-black/30" />
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">or</span>
          <div className="flex-1 border-t-2 border-dashed border-black/30" />
        </div>

        {/* Just Chat + Continue Chat tabs at the bottom */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleQuickStart}
            className="px-5 py-2.5 text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
            style={{
              background: 'linear-gradient(135deg, #90EE90 0%, #7BED9F 100%)',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <span className="text-lg group-hover:animate-bounce">👻</span>
            <span>just chat!</span>
          </button>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="px-5 py-2.5 text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #E6E6FA 0%, #D8BFD8 100%)',
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              <span className="text-lg">📂</span>
              <span>continue chat</span>
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
              {customImageUrl ? (
                <img
                  src={customImageUrl}
                  alt={customName}
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ border: '3px solid black' }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: 'white',
                    border: '3px solid black',
                  }}
                >
                  {customEmoji}
                </div>
              )}
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
            disabled={!customName || !customVibe || isGeneratingImage}
            className="px-10 py-4 text-xl font-bold transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: customName && customVibe ? '#90EE90' : '#ccc',
              border: '4px solid black',
              borderRadius: '9999px',
              boxShadow: customName && customVibe ? '5px 5px 0 black' : 'none',
              cursor: customName && customVibe && !isGeneratingImage ? 'pointer' : 'not-allowed',
            }}
          >
            {isGeneratingImage ? '🎨 generating avatar...' : 'create & use this persona ✨'}
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Persona Selection
  return (
    <div className="w-full max-w-md mx-auto text-black px-4">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center font-bold text-lg hover:scale-110 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '9999px',
            boxShadow: '2px 2px 0 black',
          }}
        >
          ✕
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          onClick={handleBack}
          className="px-3 py-1.5 font-bold text-sm hover:scale-105 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '9999px',
          }}
        >
          ←
        </button>

        <h2
          className="text-lg font-bold px-4 py-2"
          style={{
            backgroundColor: '#87CEEB',
            border: '3px solid black',
            borderRadius: '12px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          pick a character
        </h2>
      </div>

      {/* Persona grid - 2x4 layout */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(Object.entries(PERSONAS) as [PersonaType, typeof PERSONAS.chill_mentor][])
          .filter(([key]) => key !== 'custom')
          .map(([key, persona]) => {
            const isSelected = selectedPersona === key

            return (
              <button
                key={key}
                onClick={() => handlePersonaSelect(key)}
                className="p-2.5 text-left transition-all duration-200 hover:scale-105"
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #FF6B9D 0%, #FFD93D 50%, #7BED9F 100%)' : persona.color,
                  border: isSelected ? '4px solid black' : '2px solid black',
                  borderRadius: '12px',
                  boxShadow: isSelected ? '4px 4px 0 black' : '2px 2px 0 black',
                  transform: isSelected ? 'scale(1.05)' : 'none',
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">{persona.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs leading-tight">{persona.label}</h3>
                    <p className="text-[9px] leading-tight mt-0.5 opacity-70">{persona.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
      </div>

      {/* Custom persona button */}
      <button
        onClick={() => handlePersonaSelect('custom')}
        className="w-full p-3 text-left transition-all duration-200 hover:scale-[1.02] mb-4"
        style={{
          backgroundColor: selectedPersona === 'custom' ? '#FF69B4' : '#FFE4EC',
          border: '2px dashed black',
          borderRadius: '12px',
          boxShadow: '2px 2px 0 black',
        }}
      >
        <div className="flex items-center gap-2">
          {selectedPersona === 'custom' && customImageUrl ? (
            <img
              src={customImageUrl}
              alt={customName}
              className="w-10 h-10 rounded-full object-cover"
              style={{ border: '2px solid black' }}
            />
          ) : (
            <span className="text-2xl">{selectedPersona === 'custom' && customEmoji ? customEmoji : '➕'}</span>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-sm">
              {selectedPersona === 'custom' && customName ? customName : 'create your own'}
            </h3>
            <p className="text-[10px] opacity-70">design a custom character</p>
          </div>
        </div>
      </button>

      {/* Start button */}
      <div className="flex justify-center">
        <button
          onClick={handleStart}
          disabled={!selectedPersona}
          className="px-6 py-2.5 text-base font-bold transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: selectedPersona ? '#90EE90' : '#e0e0e0',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: selectedPersona ? '3px 3px 0 black' : 'none',
            cursor: selectedPersona ? 'pointer' : 'not-allowed',
            opacity: selectedPersona ? 1 : 0.6,
          }}
        >
          let&apos;s go! 🚀
        </button>
      </div>

      {/* Selected vibe indicator */}
      {selectedGoal && (
        <div
          className="mt-4 p-2 text-center text-xs"
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
