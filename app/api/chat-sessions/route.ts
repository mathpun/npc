import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// Chat categories (not exported, just used internally)
const CHAT_CATEGORIES = [
  { id: 'general', label: 'General', emoji: '💬', color: '#87CEEB' },
  { id: 'ideas', label: 'Ideas', emoji: '💡', color: '#FFD700' },
  { id: 'projects', label: 'Projects', emoji: '🚀', color: '#90EE90' },
  { id: 'feelings', label: 'Feelings', emoji: '💭', color: '#FFB6C1' },
  { id: 'school', label: 'School', emoji: '📚', color: '#DDA0DD' },
  { id: 'creative', label: 'Creative', emoji: '🎨', color: '#FFA500' },
]

// GET - fetch user's chat sessions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const sessionId = searchParams.get('sessionId')
  const category = searchParams.get('category')
  const bucketId = searchParams.get('bucketId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  try {
    // If sessionId provided, get that specific session with messages
    if (sessionId) {
      const session = await db.prepare(`
        SELECT cs.*, cb.name as bucket_name, cb.emoji as bucket_emoji
        FROM chat_sessions cs
        LEFT JOIN chat_buckets cb ON cs.bucket_id = cb.id
        WHERE cs.id = ? AND cs.user_id = ?
      `).get(parseInt(sessionId), userId)

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      const messages = await db.prepare(`
        SELECT id, role, content, created_at
        FROM chat_messages
        WHERE session_id = ?
        ORDER BY created_at ASC
      `).all(parseInt(sessionId))

      return NextResponse.json({ session, messages })
    }

    // Otherwise, get all sessions (optionally filtered by category or bucket)
    let query = `
      SELECT
        cs.*,
        cb.name as bucket_name,
        cb.emoji as bucket_emoji,
        (SELECT content FROM chat_messages WHERE session_id = cs.id ORDER BY created_at ASC LIMIT 1) as first_message
      FROM chat_sessions cs
      LEFT JOIN chat_buckets cb ON cs.bucket_id = cb.id
      WHERE cs.user_id = ?
    `
    const params: (string | number)[] = [userId]

    if (category && category !== 'all') {
      query += ` AND cs.category = ?`
      params.push(category)
    }

    if (bucketId) {
      if (bucketId === 'none') {
        query += ` AND cs.bucket_id IS NULL`
      } else {
        query += ` AND cs.bucket_id = ?`
        params.push(parseInt(bucketId))
      }
    }

    query += ` ORDER BY cs.started_at DESC LIMIT 50`

    const sessions = await db.prepare(query).all(...params)

    return NextResponse.json({ sessions, categories: CHAT_CATEGORIES })
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST - create a new chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, category, sessionGoal, sessionTopic, persona, bucketId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Create the session
    const result = await db.prepare(`
      INSERT INTO chat_sessions (user_id, title, category, session_goal, session_topic, persona, bucket_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, title || null, category || 'general', sessionGoal || null, sessionTopic || null, persona || null, bucketId || null)

    // Get the created session (PostgreSQL doesn't return lastInsertRowid the same way)
    const session = await db.prepare(`
      SELECT * FROM chat_sessions
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(userId)

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error creating chat session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// PUT - update a chat session (title, category, bucketId)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, userId, title, category, bucketId } = body

    if (!sessionId || !userId) {
      return NextResponse.json({ error: 'Session ID and User ID required' }, { status: 400 })
    }

    // Build dynamic update query
    const updates: string[] = []
    const values: unknown[] = []

    if (title !== undefined) {
      updates.push('title = ?')
      values.push(title)
    }
    if (category !== undefined) {
      updates.push('category = ?')
      values.push(category)
    }
    if (bucketId !== undefined) {
      updates.push('bucket_id = ?')
      values.push(bucketId === null || bucketId === 'none' ? null : bucketId)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    values.push(sessionId, userId)

    await db.prepare(`
      UPDATE chat_sessions
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `).run(...values)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating chat session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

// DELETE - delete a chat session and its messages
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  const userId = searchParams.get('userId')

  if (!sessionId || !userId) {
    return NextResponse.json({ error: 'Session ID and User ID required' }, { status: 400 })
  }

  try {
    // Delete messages first (foreign key constraint)
    await db.prepare(`
      DELETE FROM chat_messages WHERE session_id = ?
    `).run(parseInt(sessionId))

    // Delete the session
    await db.prepare(`
      DELETE FROM chat_sessions WHERE id = ? AND user_id = ?
    `).run(parseInt(sessionId), userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat session:', error)
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}
