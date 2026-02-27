'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { ELEMENT_TYPES } from './WorldElementCard'

interface WorldElement {
  id: number
  world_id?: number
  creator_id?: string
  element_type: string
  emoji: string | null
  name: string
  description: string | null
  details?: string | null
  connections?: string | null
  image_url: string | null
  canvas_x?: number
  canvas_y?: number
  creator_name: string
  creator_nickname?: string | null
  created_at?: string
}

interface ElementDetailModalProps {
  element: WorldElement | null
  isOpen: boolean
  onClose: () => void
  worldId: number
  userId: string
  canEdit: boolean
  onImageGenerated: () => void
}

export default function ElementDetailModal({
  element,
  isOpen,
  onClose,
  worldId,
  userId,
  canEdit,
  onImageGenerated,
}: ElementDetailModalProps) {
  const { theme } = useTheme()
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imagePrompt, setImagePrompt] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [dailyLimit, setDailyLimit] = useState(10)

  // Fetch usage when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetch(`/api/world/image-usage?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          setRemaining(data.remaining)
          setDailyLimit(data.dailyLimit)
        })
        .catch(err => console.error('Failed to fetch usage:', err))
    }
  }, [isOpen, userId])

  if (!isOpen || !element) return null

  const typeConfig = ELEMENT_TYPES[element.element_type] || { emoji: '?', label: element.element_type, color: '#888' }

  const handleGenerateImage = async () => {
    setGenerating(true)
    setGeneratedImage(null)
    setImagePrompt(null)

    try {
      const res = await fetch(`/api/world/${worldId}/elements/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          elementId: element.id,
          generateAI: true,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setGeneratedImage(data.imageUrl)
        setImagePrompt(data.imagePrompt)
        if (typeof data.remaining === 'number') {
          setRemaining(data.remaining)
        }
        onImageGenerated()
      } else if (res.status === 429) {
        setRemaining(0)
      }
    } catch (err) {
      console.error('Failed to generate image:', err)
    }

    setGenerating(false)
  }

  const displayImage = generatedImage || element.image_url

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: theme.colors.backgroundAlt,
          border: '4px solid black',
          boxShadow: '8px 8px 0 black',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full font-bold text-xl hover:scale-110 transition-transform"
          style={{
            backgroundColor: theme.colors.background,
            border: '2px solid black',
            color: theme.colors.text,
          }}
        >
          x
        </button>

        {/* Header with type */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{
            backgroundColor: typeConfig.color,
            border: '2px solid black',
          }}
        >
          <span>{typeConfig.emoji}</span>
          <span className="font-bold text-sm" style={{ color: theme.colors.text }}>
            {typeConfig.label}
          </span>
        </div>

        {/* Element name */}
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: theme.colors.text }}>
          {element.emoji && <span className="text-3xl">{element.emoji}</span>}
          {element.name}
        </h2>

        {/* Description */}
        {element.description && (
          <p className="mb-4" style={{ color: theme.colors.textMuted }}>
            {element.description}
          </p>
        )}

        {/* Image display */}
        <div
          className="mb-4 rounded-xl overflow-hidden"
          style={{
            border: '3px solid black',
            backgroundColor: typeConfig.color + '40',
          }}
        >
          {displayImage ? (
            <div className="relative">
              <img
                src={displayImage}
                alt={element.name}
                className="w-full h-64 object-cover"
              />
              {generating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-4xl animate-spin">🎨</div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <div className="text-6xl">{element.emoji || typeConfig.emoji}</div>
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                No image yet
              </p>
            </div>
          )}
        </div>

        {/* Image prompt if just generated */}
        {imagePrompt && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: theme.colors.background,
              border: '2px dashed black',
              color: theme.colors.textMuted,
            }}
          >
            <span className="font-bold">AI prompt: </span>
            {imagePrompt}
          </div>
        )}

        {/* Generate button */}
        {canEdit && (
          <div className="space-y-2">
            {/* Usage indicator */}
            {remaining !== null && (
              <div
                className="text-center text-sm py-2 rounded-lg"
                style={{
                  backgroundColor: remaining === 0 ? theme.colors.background : 'transparent',
                  color: remaining === 0 ? theme.colors.textMuted : theme.colors.textMuted,
                }}
              >
                {remaining === 0 ? (
                  <span>No generations left today</span>
                ) : (
                  <span>{remaining} generation{remaining !== 1 ? 's' : ''} left today</span>
                )}
              </div>
            )}
            <button
              onClick={handleGenerateImage}
              disabled={generating || remaining === 0}
              className="w-full py-3 font-bold rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: generating || remaining === 0 ? theme.colors.backgroundAlt : theme.colors.buttonSuccess,
                border: '3px solid black',
                boxShadow: generating || remaining === 0 ? 'none' : '4px 4px 0 black',
                color: theme.colors.text,
              }}
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🎨</span>
                  Generating vision...
                </span>
              ) : remaining === 0 ? (
                '🎨 Limit reached'
              ) : displayImage ? (
                '🔄 Regenerate Image'
              ) : (
                '🎨 Generate AI Image'
              )}
            </button>
          </div>
        )}

        {/* Creator info */}
        <div
          className="mt-4 pt-3 text-sm text-center"
          style={{
            borderTop: '2px dashed black',
            color: theme.colors.textMuted,
          }}
        >
          Created by {element.creator_name}
        </div>
      </div>
    </div>
  )
}
