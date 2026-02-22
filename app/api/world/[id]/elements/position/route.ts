import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT update element position on canvas
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId, elementId, canvasX, canvasY } = body

    if (!userId || !elementId) {
      return NextResponse.json({ error: 'User ID and element ID are required' }, { status: 400 })
    }

    // Check if user has access (owner or collaborator)
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

    // Update position
    await db.prepare(`
      UPDATE world_elements
      SET canvas_x = ?, canvas_y = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND world_id = ?
    `).run(canvasX, canvasY, elementId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating element position:', error)
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 })
  }
}
