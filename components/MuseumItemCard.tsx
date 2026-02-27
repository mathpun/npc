'use client'

import { useState } from 'react'
import Image from 'next/image'

interface MuseumItem {
  id: number
  emoji: string
  name: string
  description: string
  origin_story: string | null
  image_url?: string | null
  created_at: string
}

interface MuseumItemCardProps {
  item: MuseumItem
  userId?: string
  onDelete?: (itemId: number) => void
  onImageGenerated?: () => void
  isPublicView?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

const ITEM_COLORS = [
  { bg: '#FFB6C1', glow: 'rgba(255, 182, 193, 0.5)' },
  { bg: '#87CEEB', glow: 'rgba(135, 206, 235, 0.5)' },
  { bg: '#98FB98', glow: 'rgba(152, 251, 152, 0.5)' },
  { bg: '#DDA0DD', glow: 'rgba(221, 160, 221, 0.5)' },
  { bg: '#FFD700', glow: 'rgba(255, 215, 0, 0.5)' },
  { bg: '#FFDAB9', glow: 'rgba(255, 218, 185, 0.5)' },
  { bg: '#E6E6FA', glow: 'rgba(230, 230, 250, 0.5)' },
  { bg: '#F0E68C', glow: 'rgba(240, 230, 140, 0.5)' },
  { bg: '#B0E0E6', glow: 'rgba(176, 224, 230, 0.5)' },
  { bg: '#FFE4E1', glow: 'rgba(255, 228, 225, 0.5)' },
]

export default function MuseumItemCard({
  item,
  userId,
  onDelete,
  onImageGenerated,
  isPublicView = false,
  isExpanded = false,
  onToggleExpand
}: MuseumItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const colorIndex = item.id % ITEM_COLORS.length
  const colors = ITEM_COLORS[colorIndex]

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onDelete || isDeleting) return
    setIsDeleting(true)
    await onDelete(item.id)
  }

  const handleGenerateImage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userId || isGeneratingImage) return

    setIsGeneratingImage(true)
    try {
      const res = await fetch('/api/museum/items/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          userId,
          itemName: item.name,
          itemDescription: item.description,
          emoji: item.emoji,
        }),
      })

      if (res.ok) {
        onImageGenerated?.()
      }
    } catch (err) {
      console.error('Failed to generate image:', err)
    }
    setIsGeneratingImage(false)
  }

  const handleClick = () => {
    onToggleExpand?.()
  }

  return (
    <div
      className="relative cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'transform 0.2s ease-out',
      }}
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          backgroundColor: colors.glow,
          filter: 'blur(12px)',
          opacity: isHovered ? 0.8 : 0,
          transform: 'scale(0.9)',
        }}
      />

      {/* Card */}
      <div
        className="relative p-3 sm:p-4"
        style={{
          backgroundColor: colors.bg,
          border: '3px solid black',
          borderRadius: '16px',
          boxShadow: isHovered ? '6px 6px 0 black' : '4px 4px 0 black',
        }}
      >
        {/* Delete button */}
        {!isPublicView && onDelete && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center text-sm font-bold transition-all z-20"
            style={{
              backgroundColor: '#FF6B6B',
              border: '2px solid black',
              borderRadius: '50%',
              boxShadow: '2px 2px 0 black',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'scale(1)' : 'scale(0.8)',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            title="Remove from shop"
          >
            {isDeleting ? '...' : '×'}
          </button>
        )}

        {/* Image or Emoji */}
        <div className="flex justify-center mb-3">
          {item.image_url ? (
            <div
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden transition-transform duration-300"
              style={{
                border: '2px solid black',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="relative text-4xl sm:text-5xl transition-transform duration-300"
              style={{
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'none',
              }}
            >
              {item.emoji}
            </div>
          )}
        </div>

        {/* Generate image button (if no image yet) */}
        {!isPublicView && !item.image_url && userId && (
          <button
            onClick={handleGenerateImage}
            disabled={isGeneratingImage}
            className="w-full mb-2 px-2 py-1 text-xs font-bold rounded-lg transition-all hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: 'white',
              border: '2px solid black',
              boxShadow: '2px 2px 0 black',
            }}
          >
            {isGeneratingImage ? '✨ creating...' : '🎨 generate art'}
          </button>
        )}

        {/* Item name */}
        <h3
          className="font-bold text-center text-xs sm:text-sm mb-1 text-black leading-tight"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.name}
        </h3>

        {/* Description */}
        <p
          className="text-xs text-center text-gray-700 italic"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 10 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </p>

        {/* Origin story (shown when expanded) */}
        {isExpanded && item.origin_story && (
          <div
            className="mt-3 pt-3 text-xs animate-fadeIn"
            style={{
              borderTop: '2px dashed rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center gap-1 mb-1 text-gray-600">
              <span>📜</span>
              <span className="font-bold">Origin</span>
            </div>
            <p className="text-gray-800 leading-relaxed">
              {item.origin_story}
            </p>
          </div>
        )}

        {/* Expand indicator */}
        <div
          className="text-center mt-2 text-xs text-gray-500"
          style={{
            opacity: isHovered && !isExpanded ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          tap to expand
        </div>

        {/* Museum plaque effect at bottom */}
        <div
          className="absolute bottom-2 left-1/2 w-8 h-1 rounded-full"
          style={{
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.15)',
          }}
        />
      </div>
    </div>
  )
}
