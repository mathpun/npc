import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface RouteParams {
  params: Promise<{ inviteCode: string }>
}

// GET world preview by invite code
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { inviteCode } = await params

  try {
    const world = await db.prepare(`
      SELECT w.id, w.world_name, w.world_emoji, w.world_vibe, w.world_description, w.color_theme,
        u.name as owner_name, u.nickname as owner_nickname,
        (SELECT COUNT(*) FROM world_elements WHERE world_id = w.id) as element_count,
        (SELECT COUNT(*) FROM world_collaborators WHERE world_id = w.id) as collaborator_count
      FROM worlds w
      JOIN users u ON w.user_id = u.id
      WHERE w.invite_code = ?
    `).get(inviteCode) as {
      id: number
      world_name: string
      world_emoji: string
      world_vibe: string | null
      world_description: string | null
      color_theme: string
      owner_name: string
      owner_nickname: string | null
      element_count: number
      collaborator_count: number
    } | undefined

    if (!world) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    return NextResponse.json({ world })
  } catch (error) {
    console.error('Error fetching world by invite:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST join world as collaborator
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { inviteCode } = await params

  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Find the world
    const world = await db.prepare(`
      SELECT id, user_id, world_name FROM worlds WHERE invite_code = ?
    `).get(inviteCode) as { id: number; user_id: string; world_name: string } | undefined

    if (!world) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    // Check if user is the owner
    if (world.user_id === userId) {
      return NextResponse.json({ error: 'You already own this world' }, { status: 400 })
    }

    // Check if already a collaborator
    const existing = await db.prepare(`
      SELECT id FROM world_collaborators WHERE world_id = ? AND user_id = ?
    `).get(world.id, userId)

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyMember: true,
        worldId: world.id,
        worldName: world.world_name,
      })
    }

    // Add as collaborator
    await db.prepare(`
      INSERT INTO world_collaborators (world_id, user_id, role)
      VALUES (?, ?, 'collaborator')
    `).run(world.id, userId)

    // Log the activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'world_joined', ?)
    `).run(userId, JSON.stringify({ worldId: world.id, worldName: world.world_name }))

    return NextResponse.json({
      success: true,
      worldId: world.id,
      worldName: world.world_name,
    })
  } catch (error) {
    console.error('Error joining world:', error)
    return NextResponse.json({ error: 'Failed to join world' }, { status: 500 })
  }
}
