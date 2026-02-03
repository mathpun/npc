'use client'

import { useState, useEffect, useRef } from 'react'
import AddItemPrompt, { parseGiftShopItem } from './AddItemPrompt'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface MuseumItem {
  id: number
  emoji: string
  name: string
  description: string
  origin_story: string | null
  created_at: string
}

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

interface SuggestedItem {
  emoji: string
  name: string
  description: string
}

interface MuseumChatProps {
  userId: string
  profile: UserProfile
  onItemAdded: () => void
  existingItems: MuseumItem[]
}

export default function MuseumChat({ userId, profile, onItemAdded, existingItems }: MuseumChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [suggestedItem, setSuggestedItem] = useState<SuggestedItem | null>(null)
  const [pendingItemMessageId, setPendingItemMessageId] = useState<string | null>(null)
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
      const response = await fetch('/api/museum/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello! I want to explore my museum gift shop.' }],
          profile,
          existingItems: existingItems.map(item => ({
            emoji: item.emoji,
            name: item.name,
            description: item.description,
          })),
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
                // Ignore parse errors
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fullContent,
      }

      setMessages([assistantMessage])
      setStreamingContent('')

      // Check if the response contains a gift shop item
      checkForGiftShopItem(fullContent, assistantMessage.id)
    } catch (error) {
      console.error('Error getting greeting:', error)
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Welcome to the Museum of ${profile.name}! I'm the curator here, and I'm excited to help you discover what belongs in your gift shop. Let me ask you something to get started... What's a small, specific thing that made you smile recently - something most people wouldn't even notice?`,
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const checkForGiftShopItem = (content: string, messageId: string) => {
    const item = parseGiftShopItem(content)
    if (item) {
      setSuggestedItem(item)
      setPendingItemMessageId(messageId)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/museum/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          profile,
          existingItems: existingItems.map(item => ({
            emoji: item.emoji,
            name: item.name,
            description: item.description,
          })),
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
                // Ignore parse errors
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

      setMessages(prev => [...prev, assistantMessage])
      setStreamingContent('')

      // Check if the response contains a gift shop item
      checkForGiftShopItem(fullContent, assistantMessage.id)
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Can you try that again?",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddItem = async (item: SuggestedItem, originStory?: string) => {
    try {
      const res = await fetch('/api/museum/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          emoji: item.emoji,
          name: item.name,
          description: item.description,
          originStory,
        }),
      })

      if (res.ok) {
        onItemAdded()
        setSuggestedItem(null)
        setPendingItemMessageId(null)
      }
    } catch (err) {
      console.error('Failed to add item:', err)
    }
  }

  const handleDismissItem = () => {
    setSuggestedItem(null)
    setPendingItemMessageId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full" style={{  }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      backgroundColor: '#DDA0DD',
                      border: '3px solid black',
                    }}
                  >
                    🏛️
                  </div>
                )}
                <div
                  className={`px-4 py-3 max-w-[80%] ${message.role === 'user' ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'}`}
                  style={{
                    backgroundColor: message.role === 'user' ? '#FFB6C1' : 'white',
                    border: '3px solid black',
                    boxShadow: '4px 4px 0 black',
                  }}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>

              {/* Show add item prompt after the message that suggested it */}
              {suggestedItem && pendingItemMessageId === message.id && (
                <AddItemPrompt
                  item={suggestedItem}
                  onAdd={handleAddItem}
                  onDismiss={handleDismissItem}
                />
              )}
            </div>
          ))}

          {streamingContent && (
            <div className="flex gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  backgroundColor: '#DDA0DD',
                  border: '3px solid black',
                }}
              >
                🏛️
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80%]"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {streamingContent}
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingContent && (
            <div className="flex gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  backgroundColor: '#DDA0DD',
                  border: '3px solid black',
                }}
              >
                🏛️
              </div>
              <div
                className="px-4 py-3 rounded-2xl"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#DDA0DD', animationDelay: '0ms' }} />
                  <span className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#FFD700', animationDelay: '150ms' }} />
                  <span className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#90EE90', animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="px-4 py-4 border-t-4 border-black border-dashed"
        style={{ backgroundColor: 'white' }}
      >
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="share a memory, a quirk, or anything about you..."
            className="flex-1 px-4 py-3 resize-none"
            style={{
              border: '3px solid black',
              borderRadius: '16px',
              backgroundColor: '#FAFAFA',
              minHeight: '50px',
              maxHeight: '120px',
            }}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            style={{
              backgroundColor: '#FFD700',
              border: '3px solid black',
              borderRadius: '16px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            send
          </button>
        </div>
      </div>
    </div>
  )
}
