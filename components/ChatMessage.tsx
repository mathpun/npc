'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  onSaveToJournal?: (type: 'insight' | 'reflection' | 'action', content: string) => void
  transparencyNote?: string
}

export default function ChatMessage({
  role,
  content,
  isStreaming = false,
  onSaveToJournal,
  transparencyNote,
}: ChatMessageProps) {
  const [showSaveOptions, setShowSaveOptions] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showTransparency, setShowTransparency] = useState(false)
  const { theme } = useTheme()

  const handleSave = (type: 'insight' | 'reflection' | 'action') => {
    if (onSaveToJournal) {
      onSaveToJournal(type, content)
      setSaved(true)
      setShowSaveOptions(false)
      setTimeout(() => setSaved(false), 2000)
    }
  }

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
        {isAssistant && !isStreaming && content && (
          <div className="flex items-center gap-2 mt-2">
            {/* Save to journal button */}
            <div className="relative">
              {!showSaveOptions && !saved && (
                <button
                  onClick={() => setShowSaveOptions(true)}
                  className="px-3 py-1 text-xs font-bold hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: theme.colors.accent2,
                    border: '2px solid black',
                    borderRadius: '9999px',
                  }}
                  title="Save to journal"
                >
                  📔 save
                </button>
              )}

              {saved && (
                <div
                  className="px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: theme.colors.buttonSuccess,
                    border: '2px solid black',
                    borderRadius: '9999px',
                  }}
                >
                  ✓ saved!
                </div>
              )}

              {showSaveOptions && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs font-bold mr-1">save as:</span>
                  <button
                    onClick={() => handleSave('insight')}
                    className="px-2 py-1 text-xs font-bold hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: theme.colors.accent5,
                      border: '2px solid black',
                      borderRadius: '9999px',
                    }}
                  >
                    💡 insight
                  </button>
                  <button
                    onClick={() => handleSave('reflection')}
                    className="px-2 py-1 text-xs font-bold hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: theme.colors.accent4,
                      border: '2px solid black',
                      borderRadius: '9999px',
                    }}
                  >
                    💭 reflection
                  </button>
                  <button
                    onClick={() => handleSave('action')}
                    className="px-2 py-1 text-xs font-bold hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: theme.colors.buttonSuccess,
                      border: '2px solid black',
                      borderRadius: '9999px',
                    }}
                  >
                    🎯 action
                  </button>
                  <button
                    onClick={() => setShowSaveOptions(false)}
                    className="px-2 py-1 text-xs font-bold hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: 'white',
                      border: '2px solid black',
                      borderRadius: '9999px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Transparency note toggle */}
            {transparencyNote && (
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
            )}
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
