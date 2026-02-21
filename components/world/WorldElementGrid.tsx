'use client'

import { useTheme } from '@/lib/ThemeContext'
import WorldElementCard, { ELEMENT_TYPES } from './WorldElementCard'

interface WorldElement {
  id: number
  world_id: number
  creator_id: string
  element_type: string
  emoji: string | null
  name: string
  description: string | null
  creator_name: string
  creator_nickname: string | null
  created_at: string
}

interface WorldElementGridProps {
  elements: WorldElement[]
  filterType: string | null
  onFilterChange: (type: string | null) => void
  onElementClick: (element: WorldElement) => void
  onElementDelete?: (elementId: number) => void
  userId: string
}

export default function WorldElementGrid({
  elements,
  filterType,
  onFilterChange,
  onElementClick,
  onElementDelete,
  userId,
}: WorldElementGridProps) {
  const { theme } = useTheme()

  const filteredElements = filterType
    ? elements.filter((el) => el.element_type === filterType)
    : elements

  // Count elements by type
  const typeCounts = elements.reduce((acc, el) => {
    acc[el.element_type] = (acc[el.element_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button
          onClick={() => onFilterChange(null)}
          className="px-4 py-2 rounded-full font-medium text-sm hover:scale-105 transition-transform"
          style={{
            backgroundColor: filterType === null ? theme.colors.accent1 : theme.colors.backgroundAlt,
            border: filterType === null ? '2px solid black' : '2px solid transparent',
            color: theme.colors.text,
          }}
        >
          All ({elements.length})
        </button>
        {Object.entries(ELEMENT_TYPES).map(([type, config]) => {
          const count = typeCounts[type] || 0
          if (count === 0) return null
          return (
            <button
              key={type}
              onClick={() => onFilterChange(filterType === type ? null : type)}
              className="px-4 py-2 rounded-full font-medium text-sm hover:scale-105 transition-transform"
              style={{
                backgroundColor: filterType === type ? config.color : theme.colors.backgroundAlt,
                border: filterType === type ? '2px solid black' : '2px solid transparent',
                color: theme.colors.text,
              }}
            >
              {config.emoji} {config.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Elements Grid */}
      {filteredElements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredElements.map((element) => (
            <WorldElementCard
              key={element.id}
              element={element}
              onClick={() => onElementClick(element)}
              onDelete={onElementDelete ? () => onElementDelete(element.id) : undefined}
              canDelete={!!onElementDelete && element.creator_id === userId}
            />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12 rounded-2xl"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '3px dashed black',
          }}
        >
          <div className="text-5xl mb-4">
            {filterType ? ELEMENT_TYPES[filterType]?.emoji || '❓' : '🌌'}
          </div>
          <p className="text-lg font-medium" style={{ color: theme.colors.text }}>
            {filterType
              ? `No ${ELEMENT_TYPES[filterType]?.label.toLowerCase() || filterType}s yet`
              : 'No elements yet'}
          </p>
          <p style={{ color: theme.colors.textMuted }}>
            Start creating with AI or add elements manually
          </p>
        </div>
      )}
    </div>
  )
}
