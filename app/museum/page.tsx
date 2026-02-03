'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import MuseumGiftShop from '@/components/MuseumGiftShop'
import MuseumChat from '@/components/MuseumChat'
import MuseumSharePanel from '@/components/MuseumSharePanel'

interface MuseumItem {
  id: number
  emoji: string
  name: string
  description: string
  origin_story: string | null
  created_at: string
}

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

export default function MuseumPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState<MuseumItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'shop' | 'chat'>('chat')

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
    setLoading(false)
  }

  const handleItemAdded = () => {
    fetchItems()
  }

  if (!profile || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFEFD5' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🏛️</div>
          <p className="text-xl font-bold">loading museum...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col text-black" style={{ backgroundColor: '#FFEFD5' }}>
      <NavBar />

      {/* Museum Header */}
      <header
        className="relative z-10 px-4 py-4 border-b-4 border-black border-dashed"
        style={{ backgroundColor: '#DDA0DD' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏛️</span>
              <div>
                <h1 className="font-bold text-xl">The Museum of {profile.name}</h1>
                <p className="text-sm opacity-80">discover what belongs in your gift shop</p>
              </div>
            </div>
            <MuseumSharePanel userId={userId} itemCount={items.length} />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('chat')}
              className={`px-4 py-2 font-bold transition-transform hover:scale-105 ${activeView === 'chat' ? 'scale-105' : ''}`}
              style={{
                backgroundColor: activeView === 'chat' ? '#FFD700' : 'white',
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: activeView === 'chat' ? '3px 3px 0 black' : 'none',
              }}
            >
              💬 discover items
            </button>
            <button
              onClick={() => setActiveView('shop')}
              className={`px-4 py-2 font-bold transition-transform hover:scale-105 ${activeView === 'shop' ? 'scale-105' : ''}`}
              style={{
                backgroundColor: activeView === 'shop' ? '#FFD700' : 'white',
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: activeView === 'shop' ? '3px 3px 0 black' : 'none',
              }}
            >
              🛍️ gift shop ({items.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        {activeView === 'chat' ? (
          <div className="h-full">
            <MuseumChat
              userId={userId}
              profile={profile}
              onItemAdded={handleItemAdded}
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
      </div>

      {/* Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 right-8 text-3xl rotate-12 opacity-30">🎨</div>
        <div className="absolute bottom-32 left-8 text-3xl -rotate-12 opacity-30">🖼️</div>
        <div className="absolute top-1/3 left-4 text-2xl opacity-30">✨</div>
        <div className="absolute bottom-1/4 right-4 text-2xl opacity-30">🎪</div>
      </div>
    </main>
  )
}
