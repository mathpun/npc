'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { ELEMENT_TYPES } from './WorldElementCard'

interface AddElementFlowProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  worldId: number
  userId: string
}

const COMMON_EMOJIS = ['👤', '👑', '🧙', '⚔️', '🐉', '🏰', '🌲', '📜', '✨', '⚡', '🔮', '💎', '🌙', '☀️', '🌊', '🔥']

export default function AddElementFlow({
  isOpen,
  onClose,
  onCreated,
  worldId,
  userId,
}: AddElementFlowProps) {
  const { theme } = useTheme()
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [elementType, setElementType] = useState<string>('')
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const reset = () => {
    setStep('type')
    setElementType('')
    setName('')
    setEmoji('')
    setDescription('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleTypeSelect = (type: string) => {
    setElementType(type)
    setEmoji(ELEMENT_TYPES[type]?.emoji || '❓')
    setStep('details')
  }

  const handleCreate = async () => {
    if (!name.trim()) return

    setCreating(true)
    try {
      const res = await fetch(`/api/world/${worldId}/elements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          elementType,
          emoji: emoji || null,
          name: name.trim(),
          description: description.trim() || null,
        }),
      })

      if (res.ok) {
        reset()
        onCreated()
      }
    } catch (err) {
      console.error('Failed to create element:', err)
    }
    setCreating(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6"
        style={{
          backgroundColor: theme.colors.background,
          border: '4px solid black',
          boxShadow: '6px 6px 0 black',
        }}
      >
        {step === 'type' ? (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: theme.colors.text }}>
              What are you creating?
            </h2>
            <p className="text-center mb-6" style={{ color: theme.colors.textMuted }}>
              Pick an element type
            </p>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ELEMENT_TYPES).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="p-4 rounded-xl hover:scale-105 transition-transform text-left"
                  style={{
                    backgroundColor: config.color,
                    border: '3px solid black',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  <span className="text-3xl block mb-1">{config.emoji}</span>
                  <span className="font-bold" style={{ color: theme.colors.text }}>
                    {config.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleClose}
              className="w-full mt-6 py-3 font-bold rounded-xl hover:scale-105 transition-transform"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px solid black',
                color: theme.colors.text,
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setStep('type')}
                className="text-2xl hover:scale-110 transition-transform"
              >
                ←
              </button>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.text }}>
                New {ELEMENT_TYPES[elementType]?.label}
              </h2>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Name your ${elementType}...`}
                className="w-full p-3 rounded-xl font-medium"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '2px solid black',
                  color: theme.colors.text,
                }}
                autoFocus
              />
            </div>

            {/* Emoji */}
            <div className="mb-4">
              <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className="w-10 h-10 text-xl rounded-lg hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: emoji === e ? theme.colors.accent1 : theme.colors.backgroundAlt,
                      border: emoji === e ? '2px solid black' : '2px solid transparent',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this element..."
                rows={4}
                className="w-full p-3 rounded-xl font-medium resize-none"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '2px solid black',
                  color: theme.colors.text,
                }}
              />
            </div>

            {/* Preview */}
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                backgroundColor: ELEMENT_TYPES[elementType]?.color || '#888',
                border: '3px solid black',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <span className="font-bold" style={{ color: theme.colors.text }}>
                  {name || 'Element Name'}
                </span>
              </div>
              {description && (
                <p className="mt-2 text-sm" style={{ color: theme.colors.text, opacity: 0.8 }}>
                  {description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 font-bold rounded-xl hover:scale-105 transition-transform"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '2px solid black',
                  color: theme.colors.text,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                className="flex-1 py-3 font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: theme.colors.buttonSuccess,
                  border: '2px solid black',
                  boxShadow: '3px 3px 0 black',
                  color: theme.colors.text,
                }}
              >
                {creating ? 'Creating...' : 'Add Element'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
