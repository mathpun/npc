import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// GET invite code for a world
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    // Check if user has access to see invite code (owner or collaborator)
    const world = await db.prepare('SELECT user_id, invite_code, world_name, world_emoji FROM worlds WHERE id = ?').get(id) as {
      user_id: string
      invite_code: string | null
      world_name: string
      world_emoji: string
    } | undefined

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

    return NextResponse.json({
      inviteCode: world.invite_code,
      worldName: world.world_name,
      worldEmoji: world.world_emoji,
    })
  } catch (error) {
    console.error('Error fetching invite code:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST regenerate invite code
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check ownership
    const world = await db.prepare('SELECT user_id FROM worlds WHERE id = ?').get(id) as { user_id: string } | undefined

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 })
    }

    if (world.user_id !== userId) {
      return NextResponse.json({ error: 'Only the owner can regenerate invite codes' }, { status: 403 })
    }

    // Generate new unique invite code
    let inviteCode = generateInviteCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await db.prepare('SELECT id FROM worlds WHERE invite_code = ?').get(inviteCode)
      if (!existing) break
      inviteCode = generateInviteCode()
      attempts++
    }

    await db.prepare(`
      UPDATE worlds SET invite_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(inviteCode, id)

    return NextResponse.json({ inviteCode })
  } catch (error) {
    console.error('Error regenerating invite code:', error)
    return NextResponse.json({ error: 'Failed to regenerate invite code' }, { status: 500 })
  }
}
