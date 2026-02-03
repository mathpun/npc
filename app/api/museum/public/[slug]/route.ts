import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface Museum {
  id: number
  user_id: string
  share_slug: string
  museum_name: string | null
  tagline: string | null
  is_public: number
}

interface User {
  name: string
}

interface MuseumItem {
  id: number
  emoji: string
  name: string
  description: string
  origin_story: string | null
  created_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    // Find the museum by slug
    const museum = db.prepare(`
      SELECT * FROM museums WHERE share_slug = ? AND is_public = 1
    `).get(slug) as Museum | undefined

    if (!museum) {
      return NextResponse.json({ error: 'Museum not found' }, { status: 404 })
    }

    // Get the user's name
    const user = db.prepare(`
      SELECT name FROM users WHERE id = ?
    `).get(museum.user_id) as User | undefined

    // Get the museum items
    const items = db.prepare(`
      SELECT * FROM museum_items WHERE user_id = ? ORDER BY created_at DESC
    `).all(museum.user_id) as MuseumItem[]

    return NextResponse.json({
      museum: {
        name: museum.museum_name || `The Museum of ${user?.name || 'Someone'}`,
        tagline: museum.tagline,
        ownerName: user?.name || 'Someone',
      },
      items,
    })
  } catch (error) {
    console.error('Error fetching public museum:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
