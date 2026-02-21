'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import WorldElementCard from '@/components/world/WorldElementCard'
import { ELEMENT_TYPES } from '@/components/world/WorldElementCard'
import { useTheme } from '@/lib/ThemeContext'

interface World {
  id: number
  world_name: string
  world_emoji: string
  world_vibe: string | null
  world_description: string | null
  color_theme: string
  owner_name: string
  owner_nickname: string | null
  collaborator_count: number
  created_at: string
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

interface Collaborator {
  name: string
  nickname: string | null
}

export default function PublicWorldPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const { theme } = useTheme()
  const [world, setWorld] = useState<World | null>(null)
  const [elements, setElements] = useState<WorldElement[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string | null>(null)

  useEffect(() => {
    fetchWorld()
  }, [slug])

  const fetchWorld = async () => {
    try {
      const res = await fetch(`/api/world/public/${slug}`)
      if (res.status === 404) {
        setWorld(null)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (data.world) {
        setWorld(data.world)
        setElements(data.elements || [])
        setCollaborators(data.collaborators || [])
      }
    } catch (err) {
      console.error('Failed to fetch world:', err)
    }
    setLoading(false)
  }

  const filteredElements = filterType
    ? elements.filter((el) => el.element_type === filterType)
    : elements

  const typeCounts = elements.reduce((acc, el) => {
    acc[el.element_type] = (acc[el.element_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🌍</div>
          <p className="text-xl font-bold" style={{ color: theme.colors.text }}>Loading world...</p>
        </div>
      </div>
    )
  }

  if (!world) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
            World Not Found
          </h1>
          <p className="mb-6" style={{ color: theme.colors.textMuted }}>
            This world doesn&apos;t exist or isn&apos;t public
          </p>
          <Link
            href="/create"
            className="px-6 py-3 font-bold rounded-full inline-block hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              border: '3px solid black',
              boxShadow: '3px 3px 0 black',
              color: theme.colors.text,
            }}
          >
            Create Your Own World
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* World Header */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: world.color_theme,
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{world.world_emoji}</span>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: theme.colors.text }}>
                {world.world_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {world.world_vibe && (
                  <span
                    className="text-sm px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.15)',
                      color: theme.colors.text,
                    }}
                  >
                    {world.world_vibe}
                  </span>
                )}
                <span className="text-sm" style={{ color: theme.colors.text, opacity: 0.7 }}>
                  by {world.owner_nickname || world.owner_name}
                </span>
              </div>
            </div>
          </div>

          {world.world_description && (
            <p className="text-lg mb-4" style={{ color: theme.colors.text, opacity: 0.9 }}>
              {world.world_description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4">
            <span
              className="px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: theme.colors.text }}
            >
              {elements.length} elements
            </span>
            {collaborators.length > 0 && (
              <span
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: theme.colors.text }}
              >
                {collaborators.length + 1} creators
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        {elements.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setFilterType(null)}
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
                  onClick={() => setFilterType(filterType === type ? null : type)}
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
        )}

        {/* Elements Grid */}
        {filteredElements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredElements.map((element) => (
              <WorldElementCard
                key={element.id}
                element={element}
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
            <div className="text-5xl mb-4">🌌</div>
            <p className="text-lg font-medium" style={{ color: theme.colors.text }}>
              No elements yet
            </p>
            <p style={{ color: theme.colors.textMuted }}>
              This world is still being built
            </p>
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-8 p-6 rounded-2xl text-center"
          style={{
            backgroundColor: theme.colors.accent1,
            border: '3px solid black',
          }}
        >
          <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>
            Inspired? Create your own world!
          </h3>
          <p className="mb-4" style={{ color: theme.colors.text, opacity: 0.8 }}>
            Build your universe, invite friends, and let AI help you create
          </p>
          <Link
            href="/create"
            className="px-6 py-3 font-bold rounded-full inline-block hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.colors.buttonSuccess,
              border: '3px solid black',
              boxShadow: '3px 3px 0 black',
              color: theme.colors.text,
            }}
          >
            Start Building
          </Link>
        </div>
      </main>
    </div>
  )
}
