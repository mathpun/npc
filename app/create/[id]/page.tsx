'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import NavBar from '@/components/NavBar'
import WorldHeader from '@/components/world/WorldHeader'
import WorldElementGrid from '@/components/world/WorldElementGrid'
import WorldChat from '@/components/world/WorldChat'
import WorldInvite from '@/components/world/WorldInvite'
import AddElementFlow from '@/components/world/AddElementFlow'
import WorldCanvas from '@/components/world/WorldCanvas'
import { useTheme } from '@/lib/ThemeContext'

interface World {
  id: number
  user_id: string
  world_name: string
  world_emoji: string
  world_vibe: string | null
  world_description: string | null
  color_theme: string
  share_slug: string | null
  invite_code: string | null
  is_public: number
  owner_name: string
  owner_nickname: string | null
  created_at: string
  updated_at: string
}

interface WorldElement {
  id: number
  world_id: number
  creator_id: string
  element_type: string
  emoji: string | null
  name: string
  description: string | null
  details: string | null
  connections: string | null
  canvas_x: number
  canvas_y: number
  image_url: string | null
  creator_name: string
  creator_nickname: string | null
  created_at: string
}

interface Collaborator {
  id: number
  user_id: string
  role: string
  name: string
  nickname: string | null
  joined_at: string
}

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

export default function WorldViewPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { theme } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [world, setWorld] = useState<World | null>(null)
  const [elements, setElements] = useState<WorldElement[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [isCollaborator, setIsCollaborator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'grid' | 'chat' | 'canvas'>('grid')
  const [showInvite, setShowInvite] = useState(false)
  const [showAddElement, setShowAddElement] = useState(false)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [connections, setConnections] = useState<Array<{ from: number; to: number }>>([])
  const [localElements, setLocalElements] = useState<WorldElement[]>([])

  useEffect(() => {
    const savedProfile = localStorage.getItem('youthai_profile')
    const savedUserId = localStorage.getItem('npc_user_id')

    if (savedProfile && savedUserId) {
      setProfile(JSON.parse(savedProfile))
      setUserId(savedUserId)
    } else {
      router.push('/onboarding')
    }
  }, [router])

  useEffect(() => {
    if (userId && id) {
      fetchWorld()
    }
  }, [userId, id])

  const fetchWorld = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/world/${id}?userId=${userId}`)
      if (res.status === 404) {
        router.push('/create')
        return
      }
      if (res.status === 403) {
        router.push('/create')
        return
      }
      const data = await res.json()
      if (data.world) {
        setWorld(data.world)
        setElements(data.elements || [])
        setCollaborators(data.collaborators || [])
        setIsOwner(data.isOwner)
        setIsCollaborator(data.isCollaborator)
      }
    } catch (err) {
      console.error('Failed to fetch world:', err)
    }
    setLoading(false)
  }

  // Sync local elements for canvas
  useEffect(() => {
    setLocalElements(elements.map((el, i) => ({
      ...el,
      canvas_x: el.canvas_x || 150 + (i % 4) * 180,
      canvas_y: el.canvas_y || 150 + Math.floor(i / 4) * 180,
    })))
  }, [elements])

  const handleElementAdded = () => {
    fetchWorld()
    setShowAddElement(false)
  }

  const handleElementDeleted = async (elementId: number) => {
    if (!userId) return
    try {
      const res = await fetch(`/api/world/${id}/elements?userId=${userId}&elementId=${elementId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchWorld()
      }
    } catch (err) {
      console.error('Failed to delete element:', err)
    }
  }

  const handleShareToggle = async () => {
    if (!userId || !world) return
    try {
      const res = await fetch(`/api/world/${id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          isPublic: world.is_public === 0,
        }),
      })
      if (res.ok) {
        fetchWorld()
      }
    } catch (err) {
      console.error('Failed to toggle share:', err)
    }
  }

  const handleElementMove = async (elementId: number, x: number, y: number) => {
    // Update local state immediately for smooth dragging
    setLocalElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, canvas_x: x, canvas_y: y } : el
    ))

    // Debounce save to server
    try {
      await fetch(`/api/world/${id}/elements/position`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          elementId,
          canvasX: x,
          canvasY: y,
        }),
      })
    } catch (err) {
      console.error('Failed to save position:', err)
    }
  }

  const handleConnectionAdd = (fromId: number, toId: number) => {
    // Check if connection already exists
    const exists = connections.some(
      c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
    )
    if (!exists) {
      setConnections(prev => [...prev, { from: fromId, to: toId }])
    }
  }

  if (loading || !profile || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🌍</div>
          <p className="text-xl font-bold" style={{ color: theme.colors.text }}>loading world...</p>
        </div>
      </div>
    )
  }

  if (!world) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl font-bold mb-4" style={{ color: theme.colors.text }}>World not found</p>
          <button
            onClick={() => router.push('/create')}
            className="px-6 py-3 font-bold rounded-full"
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              border: '3px solid black',
              boxShadow: '3px 3px 0 black',
            }}
          >
            Back to Worlds
          </button>
        </div>
      </div>
    )
  }

  const canEdit = isOwner || isCollaborator

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <NavBar showBack backHref="/create" backLabel="worlds" />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* World Header */}
        <WorldHeader
          world={world}
          isOwner={isOwner}
          collaborators={collaborators}
          onInviteClick={() => setShowInvite(true)}
          onShareToggle={handleShareToggle}
        />

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveView('grid')}
            className="px-6 py-2 font-bold rounded-full transition-transform hover:scale-105"
            style={{
              backgroundColor: activeView === 'grid' ? theme.colors.accent1 : theme.colors.backgroundAlt,
              border: '3px solid black',
              boxShadow: activeView === 'grid' ? '3px 3px 0 black' : 'none',
              color: theme.colors.text,
            }}
          >
            Cards
          </button>
          <button
            onClick={() => setActiveView('canvas')}
            className="px-6 py-2 font-bold rounded-full transition-transform hover:scale-105"
            style={{
              backgroundColor: activeView === 'canvas' ? theme.colors.accent3 : theme.colors.backgroundAlt,
              border: '3px solid black',
              boxShadow: activeView === 'canvas' ? '3px 3px 0 black' : 'none',
              color: theme.colors.text,
            }}
          >
            Map
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className="px-6 py-2 font-bold rounded-full transition-transform hover:scale-105"
            style={{
              backgroundColor: activeView === 'chat' ? theme.colors.accent2 : theme.colors.backgroundAlt,
              border: '3px solid black',
              boxShadow: activeView === 'chat' ? '3px 3px 0 black' : 'none',
              color: theme.colors.text,
            }}
          >
            AI Co-Create
          </button>
        </div>

        {/* Content */}
        {activeView === 'grid' && (
          <>
            {/* Add Element Button */}
            {canEdit && (
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setShowAddElement(true)}
                  className="px-6 py-3 font-bold rounded-full hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: theme.colors.buttonSuccess,
                    border: '3px solid black',
                    boxShadow: '3px 3px 0 black',
                    color: theme.colors.text,
                  }}
                >
                  + Add Element
                </button>
              </div>
            )}

            <WorldElementGrid
              elements={elements}
              filterType={filterType}
              onFilterChange={setFilterType}
              onElementClick={() => {}}
              onElementDelete={canEdit ? handleElementDeleted : undefined}
              userId={userId}
            />
          </>
        )}

        {activeView === 'canvas' && (
          <>
            {canEdit && (
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => setShowAddElement(true)}
                  className="px-6 py-3 font-bold rounded-full hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: theme.colors.buttonSuccess,
                    border: '3px solid black',
                    boxShadow: '3px 3px 0 black',
                    color: theme.colors.text,
                  }}
                >
                  + Add Element
                </button>
              </div>
            )}

            <WorldCanvas
              elements={localElements}
              connections={connections}
              worldId={parseInt(id)}
              userId={userId}
              canEdit={canEdit}
              onElementMove={handleElementMove}
              onElementClick={(el) => console.log('clicked', el)}
              onConnectionAdd={handleConnectionAdd}
            />
          </>
        )}

        {activeView === 'chat' && (
          <WorldChat
            worldId={parseInt(id)}
            profile={profile}
            userId={userId}
            onElementCreated={handleElementAdded}
          />
        )}
      </main>

      {/* Invite Modal */}
      <WorldInvite
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        worldId={parseInt(id)}
        worldName={world.world_name}
        inviteCode={world.invite_code}
        shareSlug={world.share_slug}
        isPublic={world.is_public === 1}
        isOwner={isOwner}
        userId={userId}
      />

      {/* Add Element Modal */}
      <AddElementFlow
        isOpen={showAddElement}
        onClose={() => setShowAddElement(false)}
        onCreated={handleElementAdded}
        worldId={parseInt(id)}
        userId={userId}
      />
    </div>
  )
}
