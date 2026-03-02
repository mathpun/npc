'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from '@/lib/ThemeContext'

interface ChatInputProps {
  onSend: (message: string, imageData?: string) => void
  disabled?: boolean
  placeholder?: string
  allowImages?: boolean
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'what\'s on your mind?',
  allowImages = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [message])

  // Keep input visible when mobile keyboard opens
  const handleFocus = () => {
    // Small delay to let the keyboard fully appear
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large! Please use an image under 5MB.')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setImagePreview(result)
      setImageData(result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((message.trim() || imageData) && !disabled) {
      onSend(message.trim(), imageData || undefined)
      setMessage('')
      setImagePreview(null)
      setImageData(null)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
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
    <form onSubmit={handleSubmit} className="relative">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          <div
            className="relative w-32 h-32 rounded-xl overflow-hidden"
            style={{
              border: '2px solid black',
              boxShadow: '2px 2px 0 black',
            }}
          >
            <Image
              src={imagePreview}
              alt="Screenshot preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{
              backgroundColor: '#ff4444',
              border: '2px solid black',
            }}
          >
            ×
          </button>
        </div>
      )}

      <div
        className="p-2 sm:p-3 flex items-end gap-2 sm:gap-3"
        style={{
          backgroundColor: 'white',
          border: '2px solid black',
          borderRadius: '16px',
          boxShadow: '3px 3px 0 black',
        }}
      >
        {/* Image Upload Button */}
        {allowImages && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="px-3 py-2 text-xl hover:scale-110 transition-transform"
              style={{
                backgroundColor: imageData ? theme.colors.accent2 : theme.colors.backgroundAlt,
                border: '2px solid black',
                borderRadius: '10px',
              }}
              title="Upload screenshot"
            >
              📷
            </button>
          </>
        )}

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
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
          disabled={(!message.trim() && !imageData) || disabled}
          className="px-4 py-2 sm:px-5 sm:py-2 text-base font-bold transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: (message.trim() || imageData) && !disabled ? theme.colors.buttonSuccess : '#ccc',
            border: '2px solid black',
            borderRadius: '10px',
            boxShadow: (message.trim() || imageData) && !disabled ? '2px 2px 0 black' : 'none',
            cursor: (message.trim() || imageData) && !disabled ? 'pointer' : 'not-allowed',
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
        {allowImages ? 'upload a screenshot or type your message' : 'press enter to send, shift+enter for new line'}
      </p>
    </form>
  )
}
