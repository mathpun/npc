import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET items for a user's museum
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const items = await db.prepare(`
      SELECT * FROM museum_items
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId)

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching museum items:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST create a new museum item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, emoji, name, description, originStory } = body

    if (!userId || !emoji || !name || !description) {
      return NextResponse.json({ error: 'User ID, emoji, name, and description are required' }, { status: 400 })
    }

    await db.prepare(`
      INSERT INTO museum_items (user_id, emoji, name, description, origin_story)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, emoji, name, description, originStory || null)

    // Log the activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'museum_item_added', ?)
    `).run(userId, JSON.stringify({ name, emoji }))

    // Check if this is their first museum item
    const itemCount = await db.prepare(`
      SELECT COUNT(*) as count FROM museum_items WHERE user_id = ?
    `).get(userId) as { count: number } | undefined

    return NextResponse.json({
      emoji,
      name,
      description,
      originStory: originStory || null,
      isFirstItem: itemCount?.count === 1
    })
  } catch (error) {
    console.error('Error creating museum item:', error)
    return NextResponse.json({ error: 'Failed to create museum item' }, { status: 500 })
  }
}

// PUT update a museum item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, emoji, name, description, originStory } = body

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    await db.prepare(`
      UPDATE museum_items
      SET emoji = COALESCE(?, emoji),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          origin_story = COALESCE(?, origin_story)
      WHERE id = ?
    `).run(emoji, name, description, originStory, itemId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating museum item:', error)
    return NextResponse.json({ error: 'Failed to update museum item' }, { status: 500 })
  }
}

// DELETE a museum item
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get('itemId')

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
  }

  try {
    await db.prepare('DELETE FROM museum_items WHERE id = ?').run(itemId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting museum item:', error)
    return NextResponse.json({ error: 'Failed to delete museum item' }, { status: 500 })
  }
}
