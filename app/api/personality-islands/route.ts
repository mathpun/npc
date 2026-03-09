import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface Island {
  id: number
  theme_name: string
  theme_emoji: string
  theme_description: string | null
  image_url: string | null
  strength: number
  details_json: string | null
}

interface ThemeDetails {
  keyMemories?: string[]
  symbols?: string[]
  emotions?: string[]
  people?: string[]
  colors?: string[]
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
      SELECT id, theme_name, theme_emoji, theme_description, image_url, strength, details_json
      FROM personality_islands
      WHERE user_id = ?
      ORDER BY strength DESC, created_at ASC
    `).all(userId) as Island[]

    // Parse details_json for each island
    const enrichedIslands = islands.map(island => ({
      ...island,
      details: island.details_json ? JSON.parse(island.details_json) : null,
    }))

    return NextResponse.json({ islands: enrichedIslands })
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

    // Upsert each theme as an island with rich details
    for (const theme of themes) {
      // Package the detailed data as JSON
      const details: ThemeDetails = {
        keyMemories: theme.keyMemories || [],
        symbols: theme.symbols || [],
        emotions: theme.emotions || [],
        people: theme.people || [],
        colors: theme.colors || [],
      }
      const detailsJson = JSON.stringify(details)

      await db.prepare(`
        INSERT INTO personality_islands (user_id, theme_name, theme_emoji, theme_description, strength, details_json)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (user_id, theme_name)
        DO UPDATE SET
          theme_emoji = ?,
          theme_description = ?,
          strength = ?,
          details_json = ?,
          updated_at = CURRENT_TIMESTAMP
      `).run(
        userId,
        theme.name,
        theme.emoji,
        theme.description,
        theme.strength || 0.5,
        detailsJson,
        theme.emoji,
        theme.description,
        theme.strength || 0.5,
        detailsJson
      )
    }

    // Fetch the updated islands
    const islands = await db.prepare(`
      SELECT id, theme_name, theme_emoji, theme_description, image_url, strength, details_json
      FROM personality_islands
      WHERE user_id = ?
      ORDER BY strength DESC, created_at ASC
    `).all(userId) as Island[]

    // Parse details_json for each island
    const enrichedIslands = islands.map(island => ({
      ...island,
      details: island.details_json ? JSON.parse(island.details_json) : null,
    }))

    return NextResponse.json({ islands: enrichedIslands, updated: true })
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
