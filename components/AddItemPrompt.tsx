'use client'

import { useState } from 'react'

interface SuggestedItem {
  emoji: string
  name: string
  description: string
}

interface AddItemPromptProps {
  item: SuggestedItem
  onAdd: (item: SuggestedItem, originStory?: string) => Promise<void>
  onDismiss: () => void
}

export default function AddItemPrompt({ item, onAdd, onDismiss }: AddItemPromptProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState(item)
  const [originStory, setOriginStory] = useState('')

  const handleAdd = async () => {
    setIsAdding(true)
    await onAdd(isEditing ? editedItem : item, originStory || undefined)
    setIsAdding(false)
  }

  return (
    <div
      className="p-4 my-4 animate-fadeIn"
      style={{
        backgroundColor: '#FFFACD',
        border: '3px solid black',
        borderRadius: '16px',
        boxShadow: '4px 4px 0 black',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-bold text-gray-600">gift shop item suggestion</span>
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-black transition-colors"
        >
          ✕
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={editedItem.emoji}
              onChange={(e) => setEditedItem({ ...editedItem, emoji: e.target.value })}
              className="w-16 px-2 py-1 text-2xl text-center"
              style={{
                border: '2px solid black',
                borderRadius: '8px',
              }}
              maxLength={4}
            />
            <input
              type="text"
              value={editedItem.name}
              onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
              className="flex-1 px-3 py-1 font-bold"
              style={{
                border: '2px solid black',
                borderRadius: '8px',
              }}
              placeholder="Item name"
            />
          </div>
          <textarea
            value={editedItem.description}
            onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
            className="w-full px-3 py-2 text-sm italic"
            style={{
              border: '2px solid black',
              borderRadius: '8px',
            }}
            rows={2}
            placeholder="Item description"
          />
        </div>
      ) : (
        <div className="text-center mb-3">
          <div className="text-4xl mb-2">{item.emoji}</div>
          <h3 className="font-bold text-lg">{item.name}</h3>
          <p className="text-sm italic text-gray-700">{item.description}</p>
        </div>
      )}

      <div className="mt-3">
        <input
          type="text"
          value={originStory}
          onChange={(e) => setOriginStory(e.target.value)}
          className="w-full px-3 py-2 text-sm mb-3"
          style={{
            border: '2px solid black',
            borderRadius: '8px',
            backgroundColor: 'white',
          }}
          placeholder="Add context about why this matters to you (optional)"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="flex-1 py-2 font-bold hover:scale-105 transition-transform disabled:opacity-50"
          style={{
            backgroundColor: '#90EE90',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: '2px 2px 0 black',
          }}
        >
          {isAdding ? 'adding...' : '✓ add to shop'}
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: '#87CEEB',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: '2px 2px 0 black',
          }}
        >
          {isEditing ? '👁️' : '✏️'}
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '3px solid black',
            borderRadius: '9999px',
          }}
        >
          skip
        </button>
      </div>
    </div>
  )
}

// Helper function to parse gift shop items from AI response
export function parseGiftShopItem(text: string): { emoji: string; name: string; description: string } | null {
  // Try multiple patterns to catch different AI output formats
  // Use a broad emoji pattern that works without /u flag
  const emojiPattern = '([^\\s\\*a-zA-Z0-9]+)'

  // Pattern 1: emoji **Name** followed by *description*
  // Example: "🎪 **Circus of Contradictions Snow Globe**\n*A snow globe where...*"
  const pattern1 = text.match(new RegExp(emojiPattern + '\\s*\\*\\*([^*]+)\\*\\*'))
  if (pattern1) {
    const emoji = pattern1[1].trim()
    const name = pattern1[2].trim()
    const descMatch = text.match(/\*\*[^*]+\*\*\s*\n?\*([^*]+)\*/)
    const description = descMatch ? descMatch[1].trim() : ''
    if (emoji && name && isLikelyEmoji(emoji)) return { emoji, name, description }
  }

  // Pattern 2: emoji Name: description or emoji "Name" - description
  // Example: "🎨 The Creativity Spark: A tiny flame that never goes out"
  const pattern2 = text.match(new RegExp(emojiPattern + '\\s+(?:"([^"]+)"|([^:\\n]+)):\\s*(.+)'))
  if (pattern2) {
    const emoji = pattern2[1].trim()
    const name = (pattern2[2] || pattern2[3]).trim()
    const description = pattern2[4].trim()
    if (emoji && name && isLikelyEmoji(emoji)) return { emoji, name, description }
  }

  // Pattern 3: "Item: emoji Name - description" format
  // Example: "Item: 🌟 Starlight Memory Jar - A jar that captures..."
  const pattern3 = text.match(new RegExp('item:\\s*' + emojiPattern + '\\s+([^-–\\n]+)[-–]\\s*(.+)', 'i'))
  if (pattern3) {
    const emoji = pattern3[1].trim()
    const name = pattern3[2].trim()
    const description = pattern3[3].trim()
    if (emoji && name && isLikelyEmoji(emoji)) return { emoji, name, description }
  }

  // Pattern 4: Just emoji followed by bolded or quoted name
  // Example: "🌈 **Rainbow Collection Box**" or "🌈 'Rainbow Collection Box'"
  const pattern4 = text.match(new RegExp(emojiPattern + '\\s+(?:\\*\\*|"|[\'])([^*"\']+)(?:\\*\\*|"|[\'])'))
  if (pattern4) {
    const emoji = pattern4[1].trim()
    const name = pattern4[2].trim()
    // Look for any description after the name
    const afterName = text.slice(text.indexOf(name) + name.length)
    const descMatch = afterName.match(/[-–:]\s*(.+?)(?:\n|$)/)
    const description = descMatch ? descMatch[1].trim() : ''
    if (emoji && name && isLikelyEmoji(emoji)) return { emoji, name, description }
  }

  // Fallback: original simple pattern
  const simpleFallback = text.match(/([^\s\*]+)\s+\*\*([^*]+)\*\*/)
  if (simpleFallback) {
    const emoji = simpleFallback[1].trim()
    const name = simpleFallback[2].trim()
    const descMatch = text.match(/\*\*[^*]+\*\*\s*\n?\*([^*]+)\*/)
    const description = descMatch ? descMatch[1].trim() : ''
    if (emoji && name && isLikelyEmoji(emoji)) return { emoji, name, description }
  }

  return null
}

// Helper to check if a string is likely an emoji (not just punctuation or symbols)
function isLikelyEmoji(str: string): boolean {
  // Check if string is 1-4 chars and contains at least one character above ASCII
  if (str.length === 0 || str.length > 8) return false
  // Must contain non-ASCII characters (emojis are typically above U+00FF)
  return /[^\x00-\x7F]/.test(str)
}
