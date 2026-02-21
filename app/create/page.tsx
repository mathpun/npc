'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import WorldCard from '@/components/world/WorldCard'
import CreateWorldModal from '@/components/world/CreateWorldModal'
import { useTheme } from '@/lib/ThemeContext'

interface World {
  id: number
  user_id: string
  world_name: string
  world_emoji: string
  world_vibe: string | null
  world_description: string | null
  color_theme: string
  element_count: number
  collaborator_count: number
  user_role: string
  owner_name?: string
  created_at: string
  updated_at: string
}

export default function CreatePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [ownedWorlds, setOwnedWorlds] = useState<World[]>([])
  const [collaboratingWorlds, setCollaboratingWorlds] = useState<World[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const savedUserId = localStorage.getItem('npc_user_id')
    if (savedUserId) {
      setUserId(savedUserId)
    } else {
      router.push('/onboarding')
    }
  }, [router])

  useEffect(() => {
    if (userId) {
      fetchWorlds()
    }
  }, [userId])

  const fetchWorlds = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/world?userId=${userId}`)
      const data = await res.json()
      if (data.ownedWorlds) {
        setOwnedWorlds(data.ownedWorlds)
      }
      if (data.collaboratingWorlds) {
        setCollaboratingWorlds(data.collaboratingWorlds)
      }
    } catch (err) {
      console.error('Failed to fetch worlds:', err)
    }
    setLoading(false)
  }

  const handleWorldCreated = () => {
    fetchWorlds()
    setShowCreateModal(false)
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">✨</div>
          <p className="text-xl font-bold" style={{ color: theme.colors.text }}>loading...</p>
        </div>
      </div>
    )
  }

  const totalElements = ownedWorlds.reduce((acc, w) => acc + (w.element_count || 0), 0) +
    collaboratingWorlds.reduce((acc, w) => acc + (w.element_count || 0), 0)
  const totalCollaborators = ownedWorlds.reduce((acc, w) => acc + (w.collaborator_count || 0), 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: theme.colors.text }}>
            ✨ World Builder
          </h1>
          <p className="text-lg" style={{ color: theme.colors.textMuted }}>
            Create worlds, invite friends, build together
          </p>

          {/* Quick stats */}
          {(ownedWorlds.length > 0 || collaboratingWorlds.length > 0) && (
            <div className="flex justify-center gap-4 mt-4">
              <div
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: theme.colors.accent1,
                  border: '2px solid black',
                }}
              >
                <span className="font-bold">{ownedWorlds.length + collaboratingWorlds.length}</span> worlds
              </div>
              <div
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: theme.colors.accent2,
                  border: '2px solid black',
                }}
              >
                <span className="font-bold">{totalElements}</span> elements
              </div>
              <div
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: theme.colors.accent3,
                  border: '2px solid black',
                }}
              >
                <span className="font-bold">{totalCollaborators}</span> collaborators
              </div>
            </div>
          )}
        </div>

        {/* Create World Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 text-xl font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '4px 4px 0 black',
              color: theme.colors.text,
            }}
          >
            + Create New World
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl animate-spin mb-4">🌍</div>
            <p style={{ color: theme.colors.textMuted }}>Loading your worlds...</p>
          </div>
        ) : (
          <>
            {/* Your Worlds */}
            {ownedWorlds.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.text }}>
                  Your Worlds
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ownedWorlds.map((world) => (
                    <WorldCard key={world.id} world={world} onClick={() => router.push(`/create/${world.id}`)} />
                  ))}
                </div>
              </section>
            )}

            {/* Collaborating Worlds */}
            {collaboratingWorlds.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.text }}>
                  Collaborating On
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collaboratingWorlds.map((world) => (
                    <WorldCard
                      key={world.id}
                      world={world}
                      onClick={() => router.push(`/create/${world.id}`)}
                      showOwner
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {ownedWorlds.length === 0 && collaboratingWorlds.length === 0 && (
              <div
                className="text-center py-12 rounded-2xl"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '3px dashed black',
                }}
              >
                <div className="text-6xl mb-4">🌌</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
                  No worlds yet!
                </h3>
                <p className="mb-6" style={{ color: theme.colors.textMuted }}>
                  Create your first world and start building your universe
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 font-bold hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: theme.colors.buttonSuccess,
                    border: '3px solid black',
                    borderRadius: '9999px',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  Create Your First World
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create World Modal */}
      <CreateWorldModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleWorldCreated}
        userId={userId}
      />
    </div>
  )
}
