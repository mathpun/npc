'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface CreateWorldModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  userId: string
}

const WORLD_VIBES = [
  { value: 'fantasy', label: 'Fantasy', emoji: '🧙' },
  { value: 'sci-fi', label: 'Sci-Fi', emoji: '🚀' },
  { value: 'cozy', label: 'Cozy', emoji: '☕' },
  { value: 'chaotic', label: 'Chaotic', emoji: '🌪️' },
  { value: 'dark', label: 'Dark', emoji: '🌑' },
  { value: 'whimsical', label: 'Whimsical', emoji: '🎪' },
  { value: 'post-apocalyptic', label: 'Post-Apocalyptic', emoji: '☢️' },
  { value: 'steampunk', label: 'Steampunk', emoji: '⚙️' },
]

const WORLD_EMOJIS = ['🌍', '🌎', '🌏', '🪐', '🌙', '⭐', '🌟', '✨', '🔮', '🏰', '🗺️', '🌋', '🏔️', '🌊', '🌲', '🎭']

const COLOR_THEMES = [
  '#FF69B4', '#FF6B6B', '#9B59B6', '#3498DB', '#2ECC71',
  '#F39C12', '#E74C3C', '#1ABC9C', '#34495E', '#8E44AD',
]

export default function CreateWorldModal({ isOpen, onClose, onCreated, userId }: CreateWorldModalProps) {
  const { theme } = useTheme()
  const [worldName, setWorldName] = useState('')
  const [worldEmoji, setWorldEmoji] = useState('🌍')
  const [worldVibe, setWorldVibe] = useState('')
  const [worldDescription, setWorldDescription] = useState('')
  const [colorTheme, setColorTheme] = useState('#FF69B4')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!worldName.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          worldName: worldName.trim(),
          worldEmoji,
          worldVibe: worldVibe || null,
          worldDescription: worldDescription.trim() || null,
          colorTheme,
        }),
      })

      if (res.ok) {
        setWorldName('')
        setWorldEmoji('🌍')
        setWorldVibe('')
        setWorldDescription('')
        setColorTheme('#FF69B4')
        onCreated()
      }
    } catch (err) {
      console.error('Failed to create world:', err)
    }
    setCreating(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6"
        style={{
          backgroundColor: theme.colors.background,
          border: '4px solid black',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.text }}>
          Create New World
        </h2>

        {/* World Name */}
        <div className="mb-4">
          <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
            World Name
          </label>
          <input
            type="text"
            value={worldName}
            onChange={(e) => setWorldName(e.target.value)}
            placeholder="The Void Realm, Cozy Chaos Kingdom..."
            className="w-full p-3 rounded-xl font-medium"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '2px solid black',
              color: theme.colors.text,
            }}
          />
        </div>

        {/* Emoji Picker */}
        <div className="mb-4">
          <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
            World Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {WORLD_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setWorldEmoji(emoji)}
                className="w-10 h-10 text-xl rounded-lg hover:scale-110 transition-transform"
                style={{
                  backgroundColor: worldEmoji === emoji ? theme.colors.accent1 : theme.colors.backgroundAlt,
                  border: worldEmoji === emoji ? '2px solid black' : '2px solid transparent',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Vibe Selector */}
        <div className="mb-4">
          <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
            World Vibe
          </label>
          <div className="flex flex-wrap gap-2">
            {WORLD_VIBES.map((vibe) => (
              <button
                key={vibe.value}
                onClick={() => setWorldVibe(worldVibe === vibe.value ? '' : vibe.value)}
                className="px-3 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform"
                style={{
                  backgroundColor: worldVibe === vibe.value ? theme.colors.accent2 : theme.colors.backgroundAlt,
                  border: worldVibe === vibe.value ? '2px solid black' : '2px solid transparent',
                  color: theme.colors.text,
                }}
              >
                {vibe.emoji} {vibe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Theme */}
        <div className="mb-4">
          <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
            Color Theme
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_THEMES.map((color) => (
              <button
                key={color}
                onClick={() => setColorTheme(color)}
                className="w-8 h-8 rounded-full hover:scale-110 transition-transform"
                style={{
                  backgroundColor: color,
                  border: colorTheme === color ? '3px solid black' : '2px solid rgba(0,0,0,0.2)',
                  boxShadow: colorTheme === color ? '2px 2px 0 black' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
            World Description <span className="font-normal opacity-60">(optional)</span>
          </label>
          <textarea
            value={worldDescription}
            onChange={(e) => setWorldDescription(e.target.value)}
            placeholder="What's this world about? Set the scene..."
            rows={3}
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
            backgroundColor: colorTheme,
            border: '3px solid black',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{worldEmoji}</span>
            <span className="font-bold" style={{ color: theme.colors.text }}>
              {worldName || 'Your World'}
            </span>
            {worldVibe && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
              >
                {worldVibe}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
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
            disabled={!worldName.trim() || creating}
            className="flex-1 py-3 font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            style={{
              backgroundColor: theme.colors.buttonSuccess,
              border: '2px solid black',
              boxShadow: '3px 3px 0 black',
              color: theme.colors.text,
            }}
          >
            {creating ? 'Creating...' : 'Create World'}
          </button>
        </div>
      </div>
    </div>
  )
}
