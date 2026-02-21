import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface RouteParams {
  params: Promise<{ slug: string }>
}

// GET public world by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params

  try {
    const world = await db.prepare(`
      SELECT w.*,
        u.name as owner_name, u.nickname as owner_nickname,
        (SELECT COUNT(*) FROM world_collaborators WHERE world_id = w.id) as collaborator_count
      FROM worlds w
      JOIN users u ON w.user_id = u.id
      WHERE w.share_slug = ? AND w.is_public = 1
    `).get(slug) as {
      id: number
      user_id: string
      world_name: string
      world_emoji: string
      world_vibe: string | null
      world_description: string | null
      color_theme: string
      share_slug: string
      is_public: number
      owner_name: string
      owner_nickname: string | null
      collaborator_count: number
      created_at: string
    } | undefined

    if (!world) {
      return NextResponse.json({ error: 'World not found or not public' }, { status: 404 })
    }

    // Get elements
    const elements = await db.prepare(`
      SELECT we.*, u.name as creator_name, u.nickname as creator_nickname
      FROM world_elements we
      JOIN users u ON we.creator_id = u.id
      WHERE we.world_id = ?
      ORDER BY we.created_at DESC
    `).all(world.id)

    // Get collaborators (just names for public view)
    const collaborators = await db.prepare(`
      SELECT u.name, u.nickname
      FROM world_collaborators wc
      JOIN users u ON wc.user_id = u.id
      WHERE wc.world_id = ?
    `).all(world.id)

    return NextResponse.json({
      world,
      elements,
      collaborators,
    })
  } catch (error) {
    console.error('Error fetching public world:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
