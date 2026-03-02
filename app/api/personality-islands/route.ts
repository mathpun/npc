import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface Island {
  id: number
  theme_name: string
  theme_emoji: string
  theme_description: string | null
  image_url: string | null
  strength: number
}

// GET - Fetch user's personality islands
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const islands = await db.prepare(`
      SELECT id, theme_name, theme_emoji, theme_description, image_url, strength
      FROM personality_islands
      WHERE user_id = ?
      ORDER BY strength DESC, created_at ASC
    `).all(userId) as Island[]

    return NextResponse.json({ islands })
  } catch (error) {
    console.error('Error fetching islands:', error)
    return NextResponse.json({ error: 'Failed to fetch islands' }, { status: 500 })
  }
}

// POST - Create or update islands from analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, themes } = body

    if (!userId || !themes || !Array.isArray(themes)) {
      return NextResponse.json({ error: 'Missing userId or themes array' }, { status: 400 })
    }

    // Upsert each theme as an island
    for (const theme of themes) {
      await db.prepare(`
        INSERT INTO personality_islands (user_id, theme_name, theme_emoji, theme_description, strength)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (user_id, theme_name)
        DO UPDATE SET
          theme_emoji = ?,
          theme_description = ?,
          strength = ?,
          updated_at = CURRENT_TIMESTAMP
      `).run(
        userId,
        theme.name,
        theme.emoji,
        theme.description,
        theme.strength || 0.5,
        theme.emoji,
        theme.description,
        theme.strength || 0.5
      )
    }

    // Fetch the updated islands
    const islands = await db.prepare(`
      SELECT id, theme_name, theme_emoji, theme_description, image_url, strength
      FROM personality_islands
      WHERE user_id = ?
      ORDER BY strength DESC, created_at ASC
    `).all(userId) as Island[]

    return NextResponse.json({ islands, updated: true })
  } catch (error) {
    console.error('Error updating islands:', error)
    return NextResponse.json({ error: 'Failed to update islands' }, { status: 500 })
  }
}

// DELETE - Remove an island
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const islandId = searchParams.get('islandId')

  if (!userId || !islandId) {
    return NextResponse.json({ error: 'Missing userId or islandId' }, { status: 400 })
  }

  try {
    await db.prepare(`
      DELETE FROM personality_islands
      WHERE id = ? AND user_id = ?
    `).run(islandId, userId)

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Error deleting island:', error)
    return NextResponse.json({ error: 'Failed to delete island' }, { status: 500 })
  }
}
