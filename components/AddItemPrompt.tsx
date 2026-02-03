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
  // Look for pattern: emoji **Name** followed by *description* or italic description
  // Example: "🎪 **Circus of Contradictions Snow Globe**\n*A snow globe where...*"

  const emojiMatch = text.match(/([^\s\*]+)\s+\*\*([^*]+)\*\*/)
  if (!emojiMatch) return null

  const emoji = emojiMatch[1].trim()
  const name = emojiMatch[2].trim()

  // Look for italic description after the name
  const descMatch = text.match(/\*\*[^*]+\*\*\s*\n?\*([^*]+)\*/)
  const description = descMatch ? descMatch[1].trim() : ''

  if (!emoji || !name) return null

  return { emoji, name, description }
}
