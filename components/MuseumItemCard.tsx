'use client'

import { useState } from 'react'

interface MuseumItem {
  id: number
  emoji: string
  name: string
  description: string
  origin_story: string | null
  created_at: string
}

interface MuseumItemCardProps {
  item: MuseumItem
  onDelete?: (itemId: number) => void
  isPublicView?: boolean
}

const ITEM_COLORS = ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#FFD700', '#FFDAB9', '#E6E6FA']

export default function MuseumItemCard({ item, onDelete, isPublicView = false }: MuseumItemCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const colorIndex = item.id % ITEM_COLORS.length
  const bgColor = ITEM_COLORS[colorIndex]

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return
    setIsDeleting(true)
    await onDelete(item.id)
  }

  return (
    <div
      className="p-4 cursor-pointer hover:scale-105 transition-transform relative"
      style={{
        backgroundColor: bgColor,
        border: '3px solid black',
        borderRadius: '12px',
        boxShadow: '4px 4px 0 black',
      }}
      onClick={() => setShowDetails(!showDetails)}
    >
      {!isPublicView && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '50%',
          }}
          title="Remove from shop"
        >
          {isDeleting ? '...' : '×'}
        </button>
      )}

      <div className="text-4xl text-center mb-2">{item.emoji}</div>

      <h3 className="font-bold text-center text-sm mb-1 text-black">{item.name}</h3>

      <p className="text-xs text-center text-gray-700 italic">
        {item.description}
      </p>

      {showDetails && item.origin_story && (
        <div
          className="mt-3 pt-3 text-xs"
          style={{
            borderTop: '2px dashed black',
          }}
        >
          <p className="text-gray-800">
            <span className="font-bold">Origin: </span>
            {item.origin_story}
          </p>
        </div>
      )}
    </div>
  )
}
