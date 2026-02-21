import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST toggle public sharing
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId, isPublic } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check ownership
    const world = await db.prepare('SELECT user_id, share_slug FROM worlds WHERE id = ?').get(id) as {
      user_id: string
      share_slug: string | null
    } | undefined

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 })
    }

    if (world.user_id !== userId) {
      return NextResponse.json({ error: 'Only the owner can change sharing settings' }, { status: 403 })
    }

    await db.prepare(`
      UPDATE worlds SET is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(isPublic ? 1 : 0, id)

    return NextResponse.json({
      success: true,
      isPublic,
      shareSlug: world.share_slug,
    })
  } catch (error) {
    console.error('Error updating share settings:', error)
    return NextResponse.json({ error: 'Failed to update share settings' }, { status: 500 })
  }
}
