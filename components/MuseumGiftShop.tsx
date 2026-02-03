'use client'

import { useState, useEffect } from 'react'
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
      <div
        className="p-8 text-center"
        style={{
          backgroundColor: 'white',
          border: '3px dashed black',
          borderRadius: '16px',
        }}
      >
        <div className="text-5xl mb-4">🏛️</div>
        <h3 className="font-bold text-lg mb-2">your gift shop is empty!</h3>
        <p className="text-gray-600 text-sm">
          {isPublicView
            ? "this museum doesn't have any items yet"
            : "chat with me to discover items that belong in the museum of your life"
          }
        </p>
      </div>
    )
  }

  return (
    <div style={{  }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <MuseumItemCard
            key={item.id}
            item={item}
            onDelete={isPublicView ? undefined : handleDelete}
            isPublicView={isPublicView}
          />
        ))}
      </div>
    </div>
  )
}
