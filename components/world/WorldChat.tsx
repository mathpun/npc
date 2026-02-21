'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { ELEMENT_TYPES } from './WorldElementCard'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

interface ParsedElement {
  emoji: string
  name: string
  type: string
  description: string
}

interface WorldChatProps {
  worldId: number
  profile: UserProfile
  userId: string
  onElementCreated: () => void
}

function parseElementFromResponse(content: string): ParsedElement | null {
  // Look for pattern: [emoji] **Name** and *Type: xxx*
  const emojiMatch = content.match(/^([^\s\*]+)\s+\*\*([^*]+)\*\*/m)
  const typeMatch = content.match(/\*Type:\s*(\w+)\*/i)

  if (emojiMatch && typeMatch) {
    const emoji = emojiMatch[1]
    const name = emojiMatch[2].trim()
    const type = typeMatch[1].toLowerCase()

    // Extract description - text after the type line
    const typeIndex = content.indexOf(typeMatch[0])
    const afterType = content.slice(typeIndex + typeMatch[0].length)
    const descriptionMatch = afterType.match(/\n\n([^*\n][^\n]+)/)
    const description = descriptionMatch ? descriptionMatch[1].trim() : ''

    if (Object.keys(ELEMENT_TYPES).includes(type)) {
      return { emoji, name, type, description }
    }
  }

  return null
}

export default function WorldChat({ worldId, profile, userId, onElementCreated }: WorldChatProps) {
  const { theme } = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [pendingElement, setPendingElement] = useState<ParsedElement | null>(null)
  const [saving, setSaving] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (messages.length === 0) {
      getInitialGreeting()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const getInitialGreeting = async () => {
    setIsLoading(true)
    setStreamingContent('')

    try {
      const response = await fetch(`/api/world/${worldId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: "Hey! I'm ready to build this world." }],
          profile,
          userId,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullContent += parsed.text
                  setStreamingContent(fullContent)
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      const messageId = Date.now().toString()
      setMessages([{ id: messageId, role: 'assistant', content: fullContent }])
      setStreamingContent('')

      // Check for element suggestion
      const element = parseElementFromResponse(fullContent)
      if (element) {
        setPendingElement(element)
      }
    } catch (error) {
      console.error('Error getting greeting:', error)
    }
    setIsLoading(false)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    setStreamingContent('')
    setPendingElement(null)

    try {
      const response = await fetch(`/api/world/${worldId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          profile,
          userId,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullContent += parsed.text
                  setStreamingContent(fullContent)
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
      }

      setMessages([...newMessages, assistantMessage])
      setStreamingContent('')

      // Check for element suggestion
      const element = parseElementFromResponse(fullContent)
      if (element) {
        setPendingElement(element)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
    setIsLoading(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSaveElement = async () => {
    if (!pendingElement || saving) return

    setSaving(true)
    try {
      const res = await fetch(`/api/world/${worldId}/elements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          elementType: pendingElement.type,
          emoji: pendingElement.emoji,
          name: pendingElement.name,
          description: pendingElement.description,
        }),
      })

      if (res.ok) {
        setPendingElement(null)
        onElementCreated()

        // Add confirmation to chat
        const confirmMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Added **${pendingElement.name}** to your world! What else should we create?`,
        }
        setMessages([...messages, confirmMessage])
      }
    } catch (err) {
      console.error('Failed to save element:', err)
    }
    setSaving(false)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: theme.colors.backgroundAlt,
        border: '3px solid black',
        boxShadow: '4px 4px 0 black',
      }}
    >
      {/* Chat Messages */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[80%] p-3 rounded-xl"
              style={{
                backgroundColor: message.role === 'user' ? theme.colors.userMessage : theme.colors.background,
                border: '2px solid black',
                color: theme.colors.text,
              }}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            </div>
          </div>
        ))}

        {/* Streaming Content */}
        {streamingContent && (
          <div className="flex justify-start">
            <div
              className="max-w-[80%] p-3 rounded-xl"
              style={{
                backgroundColor: theme.colors.background,
                border: '2px solid black',
                color: theme.colors.text,
              }}
            >
              <div className="whitespace-pre-wrap text-sm">{streamingContent}</div>
            </div>
          </div>
        )}

        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2 rounded-xl"
              style={{
                backgroundColor: theme.colors.background,
                border: '2px solid black',
              }}
            >
              <span className="animate-pulse">thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pending Element Card */}
      {pendingElement && (
        <div
          className="mx-4 mb-4 p-4 rounded-xl"
          style={{
            backgroundColor: ELEMENT_TYPES[pendingElement.type]?.color || '#888',
            border: '3px solid black',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{pendingElement.emoji}</span>
              <span className="font-bold" style={{ color: theme.colors.text }}>
                {pendingElement.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
              >
                {pendingElement.type}
              </span>
            </div>
            <button
              onClick={handleSaveElement}
              disabled={saving}
              className="px-4 py-2 font-bold rounded-full hover:scale-105 transition-transform text-sm"
              style={{
                backgroundColor: theme.colors.buttonSuccess,
                border: '2px solid black',
                boxShadow: '2px 2px 0 black',
                color: theme.colors.text,
              }}
            >
              {saving ? 'Saving...' : 'Add to World'}
            </button>
          </div>
          {pendingElement.description && (
            <p className="text-sm" style={{ color: theme.colors.text, opacity: 0.9 }}>
              {pendingElement.description}
            </p>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t-2 border-black">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to create..."
            rows={2}
            className="flex-1 p-3 rounded-xl resize-none"
            style={{
              backgroundColor: theme.colors.background,
              border: '2px solid black',
              color: theme.colors.text,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              border: '2px solid black',
              boxShadow: '3px 3px 0 black',
              color: theme.colors.text,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
