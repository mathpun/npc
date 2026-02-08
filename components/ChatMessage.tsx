'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  transparencyNote?: string
}

export default function ChatMessage({
  role,
  content,
  isStreaming = false,
  transparencyNote,
}: ChatMessageProps) {
  const [showTransparency, setShowTransparency] = useState(false)
  const { theme } = useTheme()

  const isAssistant = role === 'assistant'

  return (
    <div
      className={`flex gap-3 ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
      style={{  }}
    >
      {/* Avatar for assistant */}
      {isAssistant && (
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{
            backgroundColor: theme.colors.assistantAvatar,
            border: '3px solid black',
          }}
        >
          👻
        </div>
      )}

      {/* Message bubble */}
      <div className="relative max-w-[85%] md:max-w-[75%]">
        <div
          className="px-4 py-3"
          style={{
            backgroundColor: isAssistant ? 'white' : theme.colors.userMessage,
            border: '3px solid black',
            borderRadius: isAssistant ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
            boxShadow: '4px 4px 0 black',
          }}
        >
          {/* Message content */}
          <div className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${isStreaming ? 'typing-cursor' : ''}`}>
            {content}
          </div>
        </div>

        {/* Action buttons for assistant messages */}
        {isAssistant && !isStreaming && content && transparencyNote && (
          <div className="flex items-center gap-2 mt-2">
            {/* Transparency note toggle */}
            <button
              onClick={() => setShowTransparency(!showTransparency)}
              className="px-3 py-1 text-xs font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: showTransparency ? theme.colors.accent4 : 'white',
                border: '2px solid black',
                borderRadius: '9999px',
              }}
              title="Why this response?"
            >
              ❓ why?
            </button>
          </div>
        )}

        {/* Transparency note */}
        {showTransparency && transparencyNote && (
          <div
            className="mt-2 p-3"
            style={{
              backgroundColor: theme.colors.accent4,
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            <p className="text-xs leading-relaxed">
              {transparencyNote}
            </p>
          </div>
        )}
      </div>

      {/* Avatar for user */}
      {!isAssistant && (
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{
            backgroundColor: theme.colors.userAvatar,
            border: '3px solid black',
          }}
        >
          😊
        </div>
      )}
    </div>
  )
}

// Reflection prompt component
interface ReflectionPromptProps {
  prompt: string
  onDismiss: () => void
}

export function ReflectionPrompt({ prompt, onDismiss }: ReflectionPromptProps) {
  return (
    <div className="flex justify-center my-4" style={{  }}>
      <div
        className="p-4 max-w-md text-center"
        style={{
          backgroundColor: '#FFFACD',
          border: '3px solid black',
          borderRadius: '16px',
          boxShadow: '4px 4px 0 black',
        }}
      >
        <p className="text-sm leading-relaxed">{prompt}</p>
        <button
          onClick={onDismiss}
          className="mt-3 px-4 py-1 text-xs font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '9999px',
          }}
        >
          continue →
        </button>
      </div>
    </div>
  )
}
