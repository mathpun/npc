'use client'

import { useState } from 'react'
import MuseumItemCard from './MuseumItemCard'

interface MuseumItem {
  id: number
  emoji: string
  name: string
  description: string
  origin_story: string | null
  created_at: string
}

interface MuseumGiftShopProps {
  userId: string
  items: MuseumItem[]
  onItemsChange: () => void
  isPublicView?: boolean
}

export default function MuseumGiftShop({ userId, items, onItemsChange, isPublicView = false }: MuseumGiftShopProps) {
  const [deleting, setDeleting] = useState<number | null>(null)
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  const handleDelete = async (itemId: number) => {
    setDeleting(itemId)
    try {
      const res = await fetch(`/api/museum/items?itemId=${itemId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        onItemsChange()
      }
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
    setDeleting(null)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="p-8 text-center max-w-md"
          style={{
            backgroundColor: 'white',
            border: '4px dashed black',
            borderRadius: '24px',
            boxShadow: '8px 8px 0 rgba(0,0,0,0.1)',
          }}
        >
          <div className="text-6xl mb-4 animate-bounce">🏛️</div>
          <h3 className="font-bold text-xl mb-3">your gift shop is empty!</h3>
          <p className="text-gray-600 mb-4">
            {isPublicView
              ? "this museum doesn't have any items yet"
              : "chat with me to discover unique items that represent who you are"
            }
          </p>
          {!isPublicView && (
            <div className="flex justify-center gap-2 text-2xl">
              <span className="animate-pulse" style={{ animationDelay: '0ms' }}>✨</span>
              <span className="animate-pulse" style={{ animationDelay: '200ms' }}>🎨</span>
              <span className="animate-pulse" style={{ animationDelay: '400ms' }}>🌟</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Group items into shelves (3-4 items per shelf)
  const itemsPerShelf = 4
  const shelves: MuseumItem[][] = []
  for (let i = 0; i < items.length; i += itemsPerShelf) {
    shelves.push(items.slice(i, i + itemsPerShelf))
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome banner */}
      <div
        className="text-center py-4 px-6"
        style={{
          background: 'linear-gradient(135deg, #DDA0DD 0%, #FFD700 50%, #87CEEB 100%)',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '4px 4px 0 black',
        }}
      >
        <h2 className="font-bold text-xl">welcome to the gift shop!</h2>
        <p className="text-sm opacity-80">{items.length} treasures collected</p>
      </div>

      {/* Display shelves */}
      {shelves.map((shelfItems, shelfIndex) => (
        <div key={shelfIndex} className="relative">
          {/* Shelf label */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: '#FFD700',
                border: '2px solid black',
                borderRadius: '9999px',
              }}
            >
              shelf {shelfIndex + 1}
            </div>
            <div className="flex-1 border-b-2 border-dashed border-gray-300" />
          </div>

          {/* Glass display case */}
          <div
            className="relative p-6 pb-8"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.05), 8px 8px 0 rgba(0,0,0,0.1)',
            }}
          >
            {/* Glass reflection effect */}
            <div
              className="absolute top-0 left-0 right-0 h-16 opacity-30 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, white 0%, transparent 100%)',
                borderRadius: '16px 16px 0 0',
              }}
            />

            {/* Items grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
              {shelfItems.map((item) => (
                <MuseumItemCard
                  key={item.id}
                  item={item}
                  onDelete={isPublicView ? undefined : handleDelete}
                  isPublicView={isPublicView}
                  isExpanded={expandedItem === item.id}
                  onToggleExpand={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                />
              ))}
            </div>

            {/* Shelf edge */}
            <div
              className="absolute bottom-0 left-0 right-0 h-3"
              style={{
                background: 'linear-gradient(180deg, #8B4513 0%, #654321 100%)',
                borderRadius: '0 0 16px 16px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        </div>
      ))}

      {/* Footer decoration */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
          <span>✨</span>
          <span>each item tells your story</span>
          <span>✨</span>
        </div>
      </div>
    </div>
  )
}
