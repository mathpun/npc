'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Prompt {
  id: number
  prompt_type: string
  title: string
  description: string | null
  emoji: string
  is_global: number
}

interface ParentPromptsProps {
  userId: string
}

export default function ParentPrompts({ userId }: ParentPromptsProps) {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [journalText, setJournalText] = useState('')

  useEffect(() => {
    fetchPrompts()
  }, [userId])

  const fetchPrompts = async () => {
    try {
      const res = await fetch(`/api/prompts?userId=${userId}`)
      const data = await res.json()
      if (data.prompts && data.prompts.length > 0) {
        setPrompts(data.prompts)
        setCurrentPrompt(data.prompts[0])
      }
    } catch (err) {
      console.error('Failed to fetch prompts:', err)
    }
    setLoading(false)
  }

  const handleResponse = async (responseType: 'chat' | 'journal' | 'skip' | 'done') => {
    if (!currentPrompt) return

    setResponding(true)
    try {
      await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: currentPrompt.id,
          userId,
          responseType,
          responseText: journalText || null,
        }),
      })

      // Move to next prompt or close
      const remaining = prompts.filter(p => p.id !== currentPrompt.id)
      setPrompts(remaining)
      setCurrentPrompt(remaining[0] || null)
      setJournalText('')

      // Navigate if needed
      if (responseType === 'chat') {
        router.push(`/chat?topic=${encodeURIComponent(currentPrompt.title)}`)
      }
    } catch (err) {
      console.error('Failed to respond:', err)
    }
    setResponding(false)
  }

  if (loading || !currentPrompt) {
    return null
  }

  const promptColors: Record<string, string> = {
    journal: '#FFD700',
    goal: '#90EE90',
    reflection: '#87CEEB',
    challenge: '#FF69B4',
    question: '#DDA0DD',
  }

  const bgColor = promptColors[currentPrompt.prompt_type] || '#FFD700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-black" style={{  }}>
      <div className="absolute inset-0 bg-black/50" onClick={() => handleResponse('skip')} />

      <div
        className="relative w-full max-w-md p-6 animate-bounce"
        style={{
          backgroundColor: bgColor,
          border: '4px solid black',
          borderRadius: '20px',
          boxShadow: '8px 8px 0 black',
          animation: 'none',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => handleResponse('skip')}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center font-bold hover:scale-110 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '50%',
          }}
        >
          ✕
        </button>

        {/* Emoji */}
        <div className="text-6xl text-center mb-4">{currentPrompt.emoji}</div>

        {/* Type badge */}
        <div className="text-center mb-3">
          <span
            className="px-3 py-1 text-sm font-bold"
            style={{
              backgroundColor: 'white',
              border: '2px solid black',
              borderRadius: '9999px',
            }}
          >
            {currentPrompt.prompt_type}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-3">{currentPrompt.title}</h2>

        {/* Description */}
        {currentPrompt.description && (
          <p
            className="text-center mb-4 p-3"
            style={{
              backgroundColor: 'white',
              border: '2px solid black',
              borderRadius: '12px',
            }}
          >
            {currentPrompt.description}
          </p>
        )}

        {/* Journal entry area for journal prompts */}
        {currentPrompt.prompt_type === 'journal' && (
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="write your thoughts here..."
            rows={3}
            className="w-full px-3 py-2 mb-4"
            style={{
              border: '2px solid black',
              borderRadius: '12px',
              backgroundColor: 'white',
            }}
          />
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {currentPrompt.prompt_type === 'journal' ? (
            <>
              <button
                onClick={() => handleResponse('done')}
                disabled={responding || !journalText.trim()}
                className="w-full py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                style={{
                  backgroundColor: '#90EE90',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                save to journal 📔
              </button>
              <button
                onClick={() => handleResponse('chat')}
                disabled={responding}
                className="w-full py-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                talk to NPC about this 💬
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleResponse('chat')}
                disabled={responding}
                className="w-full py-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: '#90EE90',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                let's talk about this! 💬
              </button>
              <button
                onClick={() => handleResponse('done')}
                disabled={responding}
                className="w-full py-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                i'll think about it later 🤔
              </button>
            </>
          )}
        </div>

        {/* From parent indicator */}
        {!currentPrompt.is_global && (
          <p className="text-center text-sm mt-4 opacity-70">
            💝 from someone who cares about you
          </p>
        )}

        {/* Prompt count */}
        {prompts.length > 1 && (
          <p className="text-center text-xs mt-2 opacity-50">
            {prompts.length} prompts waiting
          </p>
        )}
      </div>
    </div>
  )
}
