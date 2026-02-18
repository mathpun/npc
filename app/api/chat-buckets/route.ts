import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch all buckets for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const buckets = await db.prepare(`
      SELECT
        b.*,
        (SELECT COUNT(*) FROM chat_sessions WHERE bucket_id = b.id) as session_count
      FROM chat_buckets b
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(userId)

    return NextResponse.json({ buckets })
  } catch (error) {
    console.error('Error fetching buckets:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST - Create a new bucket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, emoji, color, description } = body

    if (!userId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await db.prepare(`
      INSERT INTO chat_buckets (user_id, name, emoji, color, description)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `).get(userId, name, emoji || '📁', color || '#87CEEB', description || null)

    return NextResponse.json({ bucket: result })
  } catch (error: unknown) {
    console.error('Error creating bucket:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ error: 'A bucket with this name already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// PUT - Update a bucket
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bucketId, userId, name, emoji, color, description } = body

    if (!bucketId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updates: string[] = []
    const values: unknown[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (emoji !== undefined) {
      updates.push('emoji = ?')
      values.push(emoji)
    }
    if (color !== undefined) {
      updates.push('color = ?')
      values.push(color)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      values.push(description)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    values.push(bucketId, userId)

    await db.prepare(`
      UPDATE chat_buckets
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `).run(...values)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating bucket:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// DELETE - Delete a bucket
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bucketId = searchParams.get('bucketId')
  const userId = searchParams.get('userId')

  if (!bucketId || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Sessions with this bucket will have bucket_id set to NULL (ON DELETE SET NULL)
    await db.prepare(`
      DELETE FROM chat_buckets WHERE id = ? AND user_id = ?
    `).run(bucketId, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bucket:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
