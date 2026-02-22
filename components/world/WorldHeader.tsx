'use client'

import { useTheme } from '@/lib/ThemeContext'

interface World {
  id: number
  world_name: string
  world_emoji: string
  world_vibe: string | null
  world_description: string | null
  color_theme: string
  is_public: number
  owner_name: string
  owner_nickname: string | null
}

interface Collaborator {
  name: string
  nickname: string | null
}

interface WorldHeaderProps {
  world: World
  isOwner: boolean
  collaborators: Collaborator[]
  onInviteClick: () => void
  onShareToggle: () => void
}

export default function WorldHeader({
  world,
  isOwner,
  collaborators,
  onInviteClick,
  onShareToggle,
}: WorldHeaderProps) {
  const { theme } = useTheme()

  return (
    <div
      className="rounded-2xl p-4 sm:p-6 mb-6"
      style={{
        backgroundColor: world.color_theme,
        border: '3px solid black',
        boxShadow: '4px 4px 0 black',
      }}
    >
      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-4xl sm:text-5xl flex-shrink-0">{world.world_emoji}</span>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate" style={{ color: theme.colors.text }}>
              {world.world_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {world.world_vibe && (
                <span
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    color: theme.colors.text,
                  }}
                >
                  {world.world_vibe}
                </span>
              )}
              <span className="text-xs sm:text-sm" style={{ color: theme.colors.text, opacity: 0.7 }}>
                by {world.owner_nickname || world.owner_name}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onInviteClick}
            className="px-3 sm:px-4 py-2 font-bold rounded-full hover:scale-105 transition-transform text-xs sm:text-sm"
            style={{
              backgroundColor: theme.colors.buttonSecondary,
              border: '2px solid black',
              boxShadow: '2px 2px 0 black',
              color: theme.colors.text,
            }}
          >
            Invite
          </button>
          {isOwner && (
            <button
              onClick={onShareToggle}
              className="px-3 sm:px-4 py-2 font-bold rounded-full hover:scale-105 transition-transform text-xs sm:text-sm"
              style={{
                backgroundColor: world.is_public ? theme.colors.buttonSuccess : theme.colors.backgroundAlt,
                border: '2px solid black',
                boxShadow: '2px 2px 0 black',
                color: theme.colors.text,
              }}
            >
              {world.is_public ? 'Public' : 'Private'}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {world.world_description && (
        <p
          className="text-lg mb-4"
          style={{ color: theme.colors.text, opacity: 0.9 }}
        >
          {world.world_description}
        </p>
      )}

      {/* Collaborators */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: theme.colors.text, opacity: 0.7 }}>
            Collaborators:
          </span>
          <div className="flex flex-wrap gap-1">
            {collaborators.slice(0, 5).map((collab, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  color: theme.colors.text,
                }}
              >
                {collab.nickname || collab.name}
              </span>
            ))}
            {collaborators.length > 5 && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  color: theme.colors.text,
                }}
              >
                +{collaborators.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
