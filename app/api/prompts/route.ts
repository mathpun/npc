import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET prompts - for admin (all) or for a specific user (their prompts)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const adminView = searchParams.get('admin') === 'true'

  try {
    if (adminView) {
      // Get all prompts for admin view
      const prompts = db.prepare(`
        SELECT pp.*, u.name as target_user_name,
          (SELECT COUNT(*) FROM prompt_responses WHERE prompt_id = pp.id) as response_count
        FROM parent_prompts pp
        LEFT JOIN users u ON pp.user_id = u.id
        ORDER BY pp.created_at DESC
      `).all()
      return NextResponse.json({ prompts })
    }

    if (userId) {
      // Get active prompts for this user (personal + global)
      const prompts = db.prepare(`
        SELECT pp.* FROM parent_prompts pp
        WHERE pp.is_active = 1
        AND (pp.user_id = ? OR pp.is_global = 1)
        AND (pp.expires_at IS NULL OR pp.expires_at > datetime('now'))
        AND pp.id NOT IN (
          SELECT prompt_id FROM prompt_responses WHERE user_id = ?
        )
        ORDER BY pp.created_at DESC
      `).all(userId, userId)
      return NextResponse.json({ prompts })
    }

    return NextResponse.json({ error: 'userId or admin flag required' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST - create a new prompt (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, promptType, title, description, emoji, isGlobal, expiresAt } = body

    if (!title || !promptType) {
      return NextResponse.json({ error: 'Title and promptType are required' }, { status: 400 })
    }

    const result = db.prepare(`
      INSERT INTO parent_prompts (user_id, prompt_type, title, description, emoji, is_global, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      isGlobal ? null : userId,
      promptType,
      title,
      description || null,
      emoji || '💭',
      isGlobal ? 1 : 0,
      expiresAt || null
    )

    return NextResponse.json({
      id: result.lastInsertRowid,
      title,
      promptType,
      success: true
    })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}

// PUT - respond to a prompt (teen) or update prompt (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { promptId, userId, responseType, responseText, isActive } = body

    // If updating active status (admin)
    if (isActive !== undefined && promptId) {
      db.prepare('UPDATE parent_prompts SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, promptId)
      return NextResponse.json({ success: true })
    }

    // If responding to a prompt (teen)
    if (promptId && userId) {
      db.prepare(`
        INSERT INTO prompt_responses (prompt_id, user_id, response_type, response_text)
        VALUES (?, ?, ?, ?)
      `).run(promptId, userId, responseType || 'seen', responseText || null)

      // Log the activity
      db.prepare(`
        INSERT INTO activity_log (user_id, activity_type, activity_data)
        VALUES (?, 'prompt_response', ?)
      `).run(userId, JSON.stringify({ promptId, responseType }))

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error updating prompt:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - remove a prompt (admin only)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const promptId = searchParams.get('promptId')

  if (!promptId) {
    return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 })
  }

  try {
    db.prepare('DELETE FROM prompt_responses WHERE prompt_id = ?').run(promptId)
    db.prepare('DELETE FROM parent_prompts WHERE id = ?').run(promptId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prompt:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
