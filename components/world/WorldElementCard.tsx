'use client'

import { useTheme } from '@/lib/ThemeContext'

const ELEMENT_TYPES: Record<string, { emoji: string; label: string; color: string }> = {
  character: { emoji: '👤', label: 'Character', color: '#FF6B6B' },
  creature: { emoji: '🐉', label: 'Creature', color: '#9B59B6' },
  place: { emoji: '🏰', label: 'Place', color: '#3498DB' },
  artifact: { emoji: '⚔️', label: 'Artifact', color: '#F39C12' },
  story: { emoji: '📜', label: 'Story', color: '#2ECC71' },
  rule: { emoji: '⚡', label: 'Rule', color: '#E74C3C' },
  vibe: { emoji: '✨', label: 'Vibe', color: '#FF69B4' },
}

interface WorldElement {
  id: number
  element_type: string
  emoji: string | null
  name: string
  description: string | null
  creator_name: string
  creator_nickname: string | null
  created_at: string
}

interface WorldElementCardProps {
  element: WorldElement
  onClick?: () => void
  onDelete?: () => void
  canDelete?: boolean
}

export default function WorldElementCard({
  element,
  onClick,
  onDelete,
  canDelete = false,
}: WorldElementCardProps) {
  const { theme } = useTheme()
  const typeConfig = ELEMENT_TYPES[element.element_type] || { emoji: '❓', label: element.element_type, color: '#888' }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && window.confirm(`Delete "${element.name}"?`)) {
      onDelete()
    }
  }

  return (
    <div
      onClick={onClick}
      className="relative p-4 rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
      style={{
        backgroundColor: typeConfig.color,
        border: '3px solid black',
        boxShadow: '4px 4px 0 black',
      }}
    >
      {/* Delete button */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-sm hover:scale-110 transition-transform"
          style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: theme.colors.text,
          }}
        >
          ×
        </button>
      )}

      {/* Type badge */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-lg">{typeConfig.emoji}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: 'rgba(255,255,255,0.4)',
            color: theme.colors.text,
          }}
        >
          {typeConfig.label}
        </span>
      </div>

      {/* Element info */}
      <div className="flex items-start gap-2 mb-2">
        {element.emoji && <span className="text-2xl">{element.emoji}</span>}
        <h3 className="font-bold text-lg" style={{ color: theme.colors.text }}>
          {element.name}
        </h3>
      </div>

      {/* Description */}
      {element.description && (
        <p
          className="text-sm mb-3 line-clamp-3"
          style={{ color: theme.colors.text, opacity: 0.9 }}
        >
          {element.description}
        </p>
      )}

      {/* Creator */}
      <div
        className="text-xs pt-2 border-t"
        style={{ borderColor: 'rgba(0,0,0,0.2)', color: theme.colors.text, opacity: 0.7 }}
      >
        by {element.creator_nickname || element.creator_name}
      </div>
    </div>
  )
}

export { ELEMENT_TYPES }
