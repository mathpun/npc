'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'what\'s on your mind?',
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { theme } = useTheme()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative" style={{  }}>
      <div
        className="p-2 sm:p-3 flex items-end gap-2 sm:gap-3"
        style={{
          backgroundColor: 'white',
          border: '2px solid black',
          borderRadius: '16px',
          boxShadow: '3px 3px 0 black',
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none px-2 py-2 sm:px-3 text-base max-h-36 text-black placeholder:text-gray-500"
          style={{
            backgroundColor: '#FFFACD',
            border: '2px solid black',
            borderRadius: '10px',
          }}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-4 py-2 sm:px-5 sm:py-2 text-base font-bold transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: message.trim() && !disabled ? theme.colors.buttonSuccess : '#ccc',
            border: '2px solid black',
            borderRadius: '10px',
            boxShadow: message.trim() && !disabled ? '2px 2px 0 black' : 'none',
            cursor: message.trim() && !disabled ? 'pointer' : 'not-allowed',
          }}
        >
          {disabled ? (
            <span className="animate-spin inline-block">⏳</span>
          ) : (
            <span>send</span>
          )}
        </button>
      </div>
      <p
        className="hidden sm:block text-xs text-center mt-2 px-3 py-1 mx-auto w-fit"
        style={{
          backgroundColor: 'white',
          border: '2px dashed black',
          borderRadius: '8px',
        }}
      >
        press enter to send, shift+enter for new line
      </p>
    </form>
  )
}
