'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import MuseumGiftShop from '@/components/MuseumGiftShop'

interface MuseumItem {
  id: number
  emoji: string
  name: string
  description: string
  origin_story: string | null
  created_at: string
}

interface MuseumData {
  museum: {
    name: string
    tagline: string | null
    ownerName: string
  }
  items: MuseumItem[]
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function PublicMuseumPage({ params }: PageProps) {
  const { slug } = use(params)
  const [data, setData] = useState<MuseumData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMuseum()
  }, [slug])

  const fetchMuseum = async () => {
    try {
      const res = await fetch(`/api/museum/public/${slug}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Museum not found')
        } else {
          setError('Failed to load museum')
        }
        return
      }
      const museumData = await res.json()
      setData(museumData)
    } catch (err) {
      console.error('Failed to fetch museum:', err)
      setError('Failed to load museum')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFEFD5' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🏛️</div>
          <p className="text-xl font-bold">loading museum...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFEFD5' }}>
        <div
          className="text-center p-8 max-w-md"
          style={{
            backgroundColor: 'white',
            border: '3px solid black',
            borderRadius: '16px',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="font-bold text-xl mb-2">{error || 'Museum not found'}</h1>
          <p className="text-gray-600 mb-4">
            This museum might be private or doesn't exist.
          </p>
          <Link
            href="/museum"
            className="inline-block px-6 py-3 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#FFD700',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            create your own museum
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen text-black" style={{ backgroundColor: '#FFEFD5' }}>
      {/* Header */}
      <header
        className="px-4 py-6 border-b-4 border-black border-dashed"
        style={{ backgroundColor: '#DDA0DD' }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl mb-3">🏛️</div>
          <h1 className="font-bold text-2xl mb-1">{data.museum.name}</h1>
          {data.museum.tagline && (
            <p className="text-gray-700 italic">{data.museum.tagline}</p>
          )}
          <p className="text-sm mt-2 opacity-70">
            a museum curated by {data.museum.ownerName}
          </p>
        </div>
      </header>

      {/* Gift Shop Section */}
      <section className="px-4 py-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🛍️</span>
          <h2 className="font-bold text-xl">gift shop</h2>
          <span
            className="px-3 py-1 text-sm font-bold"
            style={{
              backgroundColor: '#FFD700',
              border: '2px solid black',
              borderRadius: '9999px',
            }}
          >
            {data.items.length} items
          </span>
        </div>

        <MuseumGiftShop
          userId=""
          items={data.items}
          onItemsChange={() => {}}
          isPublicView={true}
        />
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-8 text-center">
        <div
          className="max-w-md mx-auto p-6"
          style={{
            backgroundColor: 'white',
            border: '3px solid black',
            borderRadius: '16px',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <h3 className="font-bold text-lg mb-2">want your own museum?</h3>
          <p className="text-sm text-gray-600 mb-4">
            discover what would be in the gift shop of a museum about YOUR life
          </p>
          <Link
            href="/museum"
            className="inline-block px-6 py-3 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#FFD700',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            create your museum
          </Link>
        </div>
      </section>

      {/* Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-24 right-8 text-3xl rotate-12 opacity-20">🎨</div>
        <div className="absolute bottom-32 left-8 text-3xl -rotate-12 opacity-20">🖼️</div>
        <div className="absolute top-1/3 left-4 text-2xl opacity-20">✨</div>
        <div className="absolute bottom-1/4 right-4 text-2xl opacity-20">🎪</div>
      </div>
    </main>
  )
}
