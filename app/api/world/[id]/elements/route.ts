import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET all elements for a world
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const elementType = searchParams.get('type')

  try {
    // Check access
    const world = await db.prepare(`
      SELECT user_id, is_public FROM worlds WHERE id = ?
    `).get(id) as { user_id: string; is_public: number } | undefined

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 })
    }

    const isOwner = world.user_id === userId
    const isCollaborator = userId ? await db.prepare(`
      SELECT id FROM world_collaborators WHERE world_id = ? AND user_id = ?
    `).get(id, userId) : null
    const hasAccess = isOwner || isCollaborator || world.is_public === 1

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    let query = `
      SELECT we.*, u.name as creator_name, u.nickname as creator_nickname
      FROM world_elements we
      JOIN users u ON we.creator_id = u.id
      WHERE we.world_id = ?
    `
    const queryParams: (string | number)[] = [parseInt(id)]

    if (elementType) {
      query += ' AND we.element_type = ?'
      queryParams.push(elementType)
    }

    query += ' ORDER BY we.created_at DESC'

    const elements = await db.prepare(query).all(...queryParams)

    return NextResponse.json({ elements })
  } catch (error) {
    console.error('Error fetching elements:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST create a new element
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId, elementType, emoji, name, description, details, connections } = body

    if (!userId || !elementType || !name) {
      return NextResponse.json({ error: 'User ID, element type, and name are required' }, { status: 400 })
    }

    // Check access (owner or collaborator)
    const world = await db.prepare('SELECT user_id FROM worlds WHERE id = ?').get(id) as { user_id: string } | undefined
    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 })
    }

    const isOwner = world.user_id === userId
    const isCollaborator = await db.prepare(`
      SELECT id FROM world_collaborators WHERE world_id = ? AND user_id = ?
    `).get(id, userId)

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await db.prepare(`
      INSERT INTO world_elements (world_id, creator_id, element_type, emoji, name, description, details, connections)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      elementType,
      emoji || null,
      name,
      description || null,
      details ? JSON.stringify(details) : null,
      connections ? JSON.stringify(connections) : null
    )

    // Update world's updated_at
    await db.prepare('UPDATE worlds SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id)

    // Get the created element
    const element = await db.prepare(`
      SELECT we.*, u.name as creator_name, u.nickname as creator_nickname
      FROM world_elements we
      JOIN users u ON we.creator_id = u.id
      WHERE we.world_id = ? AND we.creator_id = ?
      ORDER BY we.created_at DESC LIMIT 1
    `).get(id, userId)

    // Log the activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'element_created', ?)
    `).run(userId, JSON.stringify({ name, elementType, worldId: id }))

    return NextResponse.json({ element })
  } catch (error) {
    console.error('Error creating element:', error)
    return NextResponse.json({ error: 'Failed to create element' }, { status: 500 })
  }
}

// PUT update an element
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId, elementId, emoji, name, description, details, connections } = body

    if (!userId || !elementId) {
      return NextResponse.json({ error: 'User ID and element ID are required' }, { status: 400 })
    }

    // Check if user is creator or world owner
    const element = await db.prepare(`
      SELECT we.creator_id, w.user_id as world_owner
      FROM world_elements we
      JOIN worlds w ON we.world_id = w.id
      WHERE we.id = ? AND we.world_id = ?
    `).get(elementId, id) as { creator_id: string; world_owner: string } | undefined

    if (!element) {
      return NextResponse.json({ error: 'Element not found' }, { status: 404 })
    }

    if (element.creator_id !== userId && element.world_owner !== userId) {
      return NextResponse.json({ error: 'Only the creator or world owner can edit this element' }, { status: 403 })
    }

    await db.prepare(`
      UPDATE world_elements
      SET emoji = COALESCE(?, emoji),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          details = COALESCE(?, details),
          connections = COALESCE(?, connections),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      emoji,
      name,
      description,
      details ? JSON.stringify(details) : null,
      connections ? JSON.stringify(connections) : null,
      elementId
    )

    // Update world's updated_at
    await db.prepare('UPDATE worlds SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating element:', error)
    return NextResponse.json({ error: 'Failed to update element' }, { status: 500 })
  }
}

// DELETE an element
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const elementId = searchParams.get('elementId')

  if (!userId || !elementId) {
    return NextResponse.json({ error: 'User ID and element ID are required' }, { status: 400 })
  }

  try {
    // Check if user is creator or world owner
    const element = await db.prepare(`
      SELECT we.creator_id, w.user_id as world_owner
      FROM world_elements we
      JOIN worlds w ON we.world_id = w.id
      WHERE we.id = ? AND we.world_id = ?
    `).get(elementId, id) as { creator_id: string; world_owner: string } | undefined

    if (!element) {
      return NextResponse.json({ error: 'Element not found' }, { status: 404 })
    }

    if (element.creator_id !== userId && element.world_owner !== userId) {
      return NextResponse.json({ error: 'Only the creator or world owner can delete this element' }, { status: 403 })
    }

    await db.prepare('DELETE FROM world_elements WHERE id = ?').run(elementId)

    // Update world's updated_at
    await db.prepare('UPDATE worlds SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting element:', error)
    return NextResponse.json({ error: 'Failed to delete element' }, { status: 500 })
  }
}
