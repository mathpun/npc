'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import WorldCard from '@/components/world/WorldCard'
import MuseumGiftShop from '@/components/MuseumGiftShop'
import MuseumChat from '@/components/MuseumChat'
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

interface MuseumItem {
  id: number
  emoji: string
  name: string
  description: string
  origin_story: string | null
  image_url?: string | null
  created_at: string
}

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

type CreateMode = 'museum' | 'worlds'

export default function CreatePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<CreateMode>('museum')

  // Museum state
  const [items, setItems] = useState<MuseumItem[]>([])
  const [museumView, setMuseumView] = useState<'chat' | 'shop'>('chat')

  // Worlds state
  const [ownedWorlds, setOwnedWorlds] = useState<World[]>([])
  const [collaboratingWorlds, setCollaboratingWorlds] = useState<World[]>([])
  const [loading, setLoading] = useState(true)

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
    if (userId) {
      fetchItems()
      fetchWorlds()
    }
  }, [userId])

  const fetchItems = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/museum/items?userId=${userId}`)
      const data = await res.json()
      if (data.items) {
        setItems(data.items)
      }
    } catch (err) {
      console.error('Failed to fetch museum items:', err)
    }
  }

  const fetchWorlds = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/world?userId=${userId}`)
      const data = await res.json()
      if (data.ownedWorlds) setOwnedWorlds(data.ownedWorlds)
      if (data.collaboratingWorlds) setCollaboratingWorlds(data.collaboratingWorlds)
    } catch (err) {
      console.error('Failed to fetch worlds:', err)
    }
    setLoading(false)
  }

  if (!profile || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">✨</div>
          <p className="text-xl font-bold">loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col text-black" style={{ backgroundColor: theme.colors.background }}>
      <NavBar />

      {/* Fun Header */}
      <header
        className="relative z-10 px-4 py-4 border-b-4 border-black border-dashed"
        style={{
          background: 'linear-gradient(135deg, #DDA0DD 0%, #FFD700 50%, #87CEEB 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl animate-pulse">✨</div>
            <div>
              <h1 className="font-bold text-2xl">create with your mind</h1>
              <p className="text-sm opacity-80">explore who you are through creation</p>
            </div>
          </div>

          {/* Mode Toggle - Big fun buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveMode('museum')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: activeMode === 'museum' ? '#DDA0DD' : 'white',
                border: '3px solid black',
                borderRadius: '16px',
                boxShadow: activeMode === 'museum' ? '4px 4px 0 black' : '2px 2px 0 black',
              }}
            >
              <span className="text-2xl">🏛️</span>
              <div className="text-left">
                <div className="font-bold">my museum</div>
                <div className="text-xs opacity-70">{items.length} treasures</div>
              </div>
            </button>
            <button
              onClick={() => setActiveMode('worlds')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: activeMode === 'worlds' ? '#87CEEB' : 'white',
                border: '3px solid black',
                borderRadius: '16px',
                boxShadow: activeMode === 'worlds' ? '4px 4px 0 black' : '2px 2px 0 black',
              }}
            >
              <span className="text-2xl">🌍</span>
              <div className="text-left">
                <div className="font-bold">my worlds</div>
                <div className="text-xs opacity-70">{ownedWorlds.length + collaboratingWorlds.length} worlds</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 relative z-10">
        {activeMode === 'museum' ? (
          <>
            {/* Museum sub-nav */}
            <div className="px-4 py-3 border-b-2 border-black border-dashed" style={{ backgroundColor: theme.colors.backgroundAlt }}>
              <div className="max-w-5xl mx-auto flex gap-2">
                <button
                  onClick={() => setMuseumView('chat')}
                  className="px-4 py-2 font-bold transition-transform hover:scale-105"
                  style={{
                    backgroundColor: museumView === 'chat' ? '#FFD700' : 'white',
                    border: '2px solid black',
                    borderRadius: '9999px',
                    boxShadow: museumView === 'chat' ? '3px 3px 0 black' : '2px 2px 0 black',
                  }}
                >
                  💬 discover items
                </button>
                <button
                  onClick={() => setMuseumView('shop')}
                  className="px-4 py-2 font-bold transition-transform hover:scale-105"
                  style={{
                    backgroundColor: museumView === 'shop' ? '#FFD700' : 'white',
                    border: '2px solid black',
                    borderRadius: '9999px',
                    boxShadow: museumView === 'shop' ? '3px 3px 0 black' : '2px 2px 0 black',
                  }}
                >
                  🛍️ my collection ({items.length})
                </button>
              </div>
            </div>

            {museumView === 'chat' ? (
              <div className="h-full">
                <MuseumChat
                  userId={userId}
                  profile={profile}
                  onItemAdded={fetchItems}
                  existingItems={items}
                />
              </div>
            ) : (
              <div className="p-4 max-w-5xl mx-auto">
                <MuseumGiftShop
                  userId={userId}
                  items={items}
                  onItemsChange={fetchItems}
                />
              </div>
            )}
          </>
        ) : (
          /* Worlds Section */
          <div className="p-4 max-w-4xl mx-auto">
            {/* Create World Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => router.push('/create/new')}
                className="px-8 py-4 text-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #90EE90 0%, #7BED9F 100%)',
                  border: '4px solid black',
                  borderRadius: '9999px',
                  boxShadow: '6px 6px 0 black',
                }}
              >
                <span className="text-2xl">✨</span>
                <span>create new world</span>
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
                    <h2 className="text-xl font-bold mb-4">Your Worlds</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ownedWorlds.map((world) => (
                        <WorldCard key={world.id} world={world} onClick={() => router.push(`/create/${world.id}`)} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Collaborating */}
                {collaboratingWorlds.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Collaborating On</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {collaboratingWorlds.map((world) => (
                        <WorldCard key={world.id} world={world} onClick={() => router.push(`/create/${world.id}`)} showOwner />
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
                    <h3 className="text-2xl font-bold mb-2">No worlds yet!</h3>
                    <p className="mb-6 text-gray-600">
                      Create your first world and start building
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 right-8 text-3xl rotate-12 opacity-20">🎨</div>
        <div className="absolute bottom-32 left-8 text-3xl -rotate-12 opacity-20">🖼️</div>
        <div className="absolute top-1/3 left-4 text-2xl opacity-20">✨</div>
        <div className="absolute bottom-1/4 right-4 text-2xl opacity-20">🌈</div>
      </div>
    </main>
  )
}
