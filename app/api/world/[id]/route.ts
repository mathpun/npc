import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET a specific world with elements
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  try {
    const world = await db.prepare(`
      SELECT w.*,
        u.name as owner_name,
        u.nickname as owner_nickname
      FROM worlds w
      JOIN users u ON w.user_id = u.id
      WHERE w.id = ?
    `).get(id) as {
      id: number
      user_id: string
      world_name: string
      world_emoji: string
      world_vibe: string | null
      world_description: string | null
      color_theme: string
      share_slug: string | null
      invite_code: string | null
      is_public: number
      owner_name: string
      owner_nickname: string | null
      created_at: string
      updated_at: string
    } | undefined

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 })
    }

    // Check if user has access
    const isOwner = world.user_id === userId
    const isCollaborator = userId ? await db.prepare(`
      SELECT id FROM world_collaborators WHERE world_id = ? AND user_id = ?
    `).get(id, userId) : null
    const hasAccess = isOwner || isCollaborator || world.is_public === 1

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get elements
    const elements = await db.prepare(`
      SELECT we.*, u.name as creator_name, u.nickname as creator_nickname
      FROM world_elements we
      JOIN users u ON we.creator_id = u.id
      WHERE we.world_id = ?
      ORDER BY we.created_at DESC
    `).all(id)

    // Get collaborators
    const collaborators = await db.prepare(`
      SELECT wc.*, u.name, u.nickname
      FROM world_collaborators wc
      JOIN users u ON wc.user_id = u.id
      WHERE wc.world_id = ?
      ORDER BY wc.joined_at ASC
    `).all(id)

    return NextResponse.json({
      world,
      elements,
      collaborators,
      isOwner,
      isCollaborator: !!isCollaborator,
    })
  } catch (error) {
    console.error('Error fetching world:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// PUT update a world
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId, worldName, worldEmoji, worldVibe, worldDescription, colorTheme } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check ownership
    const world = await db.prepare('SELECT user_id FROM worlds WHERE id = ?').get(id) as { user_id: string } | undefined
    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 })
    }
    if (world.user_id !== userId) {
      return NextResponse.json({ error: 'Only the owner can update world settings' }, { status: 403 })
    }

    await db.prepare(`
      UPDATE worlds
      SET world_name = COALESCE(?, world_name),
          world_emoji = COALESCE(?, world_emoji),
          world_vibe = COALESCE(?, world_vibe),
          world_description = COALESCE(?, world_description),
          color_theme = COALESCE(?, color_theme),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(worldName, worldEmoji, worldVibe, worldDescription, colorTheme, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating world:', error)
    return NextResponse.json({ error: 'Failed to update world' }, { status: 500 })
  }
}

// DELETE a world
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    // Check ownership
    const world = await db.prepare('SELECT user_id FROM worlds WHERE id = ?').get(id) as { user_id: string } | undefined
    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 })
    }
    if (world.user_id !== userId) {
      return NextResponse.json({ error: 'Only the owner can delete a world' }, { status: 403 })
    }

    // Delete world (cascades to elements and collaborators)
    await db.prepare('DELETE FROM worlds WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting world:', error)
    return NextResponse.json({ error: 'Failed to delete world' }, { status: 500 })
  }
}
