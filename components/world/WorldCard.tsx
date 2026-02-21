'use client'

import { useTheme } from '@/lib/ThemeContext'

interface World {
  id: number
  world_name: string
  world_emoji: string
  world_vibe: string | null
  world_description: string | null
  color_theme: string
  element_count: number
  collaborator_count: number
  user_role: string
  owner_name?: string
  updated_at: string
}

interface WorldCardProps {
  world: World
  onClick: () => void
  showOwner?: boolean
}

export default function WorldCard({ world, onClick, showOwner = false }: WorldCardProps) {
  const { theme } = useTheme()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl hover:scale-[1.02] transition-transform"
      style={{
        backgroundColor: world.color_theme || theme.colors.backgroundAlt,
        border: '3px solid black',
        boxShadow: '4px 4px 0 black',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{world.world_emoji}</span>
          <div>
            <h3 className="font-bold text-lg" style={{ color: theme.colors.text }}>
              {world.world_name}
            </h3>
            {world.world_vibe && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  color: theme.colors.text,
                }}
              >
                {world.world_vibe}
              </span>
            )}
          </div>
        </div>
        {world.user_role === 'owner' && (
          <span
            className="text-xs px-2 py-1 rounded-full font-bold"
            style={{
              backgroundColor: theme.colors.buttonSuccess,
              border: '1px solid black',
            }}
          >
            owner
          </span>
        )}
      </div>

      {/* Description */}
      {world.world_description && (
        <p
          className="text-sm mb-3 line-clamp-2"
          style={{ color: theme.colors.text, opacity: 0.8 }}
        >
          {world.world_description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm">
        <span
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: theme.colors.text }}
        >
          {world.element_count || 0} elements
        </span>
        <span
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: theme.colors.text }}
        >
          {world.collaborator_count || 0} collaborators
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/20">
        {showOwner && world.owner_name && (
          <span className="text-xs" style={{ color: theme.colors.text, opacity: 0.7 }}>
            by {world.owner_name}
          </span>
        )}
        <span className="text-xs ml-auto" style={{ color: theme.colors.text, opacity: 0.7 }}>
          updated {formatDate(world.updated_at)}
        </span>
      </div>
    </button>
  )
}
