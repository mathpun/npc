import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function generateSlug(): string {
  const adjectives = ['mystical', 'ancient', 'hidden', 'eternal', 'cosmic', 'enchanted', 'forgotten', 'shadow', 'crystal', 'wild']
  const nouns = ['realm', 'kingdom', 'dimension', 'sanctuary', 'domain', 'haven', 'world', 'lands', 'empire', 'territory']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 1000)
  return `${adj}-${noun}-${num}`
}

// GET user's worlds (owned + collaborating)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    // Get worlds the user owns
    const ownedWorlds = await db.prepare(`
      SELECT w.*,
        (SELECT COUNT(*) FROM world_elements WHERE world_id = w.id) as element_count,
        (SELECT COUNT(*) FROM world_collaborators WHERE world_id = w.id) as collaborator_count,
        'owner' as user_role
      FROM worlds w
      WHERE w.user_id = ?
      ORDER BY w.updated_at DESC
    `).all(userId) as Array<{
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
      element_count: number
      collaborator_count: number
      user_role: string
      created_at: string
      updated_at: string
    }>

    // Get worlds the user collaborates on
    const collaboratingWorlds = await db.prepare(`
      SELECT w.*,
        (SELECT COUNT(*) FROM world_elements WHERE world_id = w.id) as element_count,
        (SELECT COUNT(*) FROM world_collaborators WHERE world_id = w.id) as collaborator_count,
        wc.role as user_role,
        u.name as owner_name
      FROM worlds w
      JOIN world_collaborators wc ON w.id = wc.world_id
      JOIN users u ON w.user_id = u.id
      WHERE wc.user_id = ?
      ORDER BY w.updated_at DESC
    `).all(userId) as Array<{
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
      element_count: number
      collaborator_count: number
      user_role: string
      owner_name: string
      created_at: string
      updated_at: string
    }>

    return NextResponse.json({
      ownedWorlds,
      collaboratingWorlds,
    })
  } catch (error) {
    console.error('Error fetching worlds:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST create a new world
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, worldName, worldEmoji, worldVibe, worldDescription, colorTheme } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await db.prepare('SELECT id FROM worlds WHERE invite_code = ?').get(inviteCode)
      if (!existing) break
      inviteCode = generateInviteCode()
      attempts++
    }

    // Generate slug
    let shareSlug = generateSlug()
    attempts = 0
    while (attempts < 10) {
      const existing = await db.prepare('SELECT id FROM worlds WHERE share_slug = ?').get(shareSlug)
      if (!existing) break
      shareSlug = generateSlug()
      attempts++
    }

    await db.prepare(`
      INSERT INTO worlds (user_id, world_name, world_emoji, world_vibe, world_description, color_theme, invite_code, share_slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      worldName || 'My World',
      worldEmoji || '🌍',
      worldVibe || null,
      worldDescription || null,
      colorTheme || '#FF69B4',
      inviteCode,
      shareSlug
    )

    // Get the created world
    const world = await db.prepare(`
      SELECT * FROM worlds WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(userId)

    // Log the activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'world_created', ?)
    `).run(userId, JSON.stringify({ worldName: worldName || 'My World' }))

    return NextResponse.json({ world })
  } catch (error) {
    console.error('Error creating world:', error)
    return NextResponse.json({ error: 'Failed to create world' }, { status: 500 })
  }
}
