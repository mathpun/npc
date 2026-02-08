import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Find all users with a given name and their data counts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: 'Name parameter required' }, { status: 400 })
  }

  try {
    // Find all users with this name (case-insensitive)
    const users = await db.prepare(`
      SELECT
        u.id,
        u.name,
        u.nickname,
        u.age,
        u.interests,
        u.password_hash IS NOT NULL as has_password,
        u.created_at,
        u.last_active,
        (SELECT COUNT(*) FROM chat_messages WHERE user_id = u.id) as message_count,
        (SELECT COUNT(*) FROM chat_sessions WHERE user_id = u.id) as session_count,
        (SELECT COUNT(*) FROM museum_items WHERE user_id = u.id) as museum_items,
        (SELECT COUNT(*) FROM daily_checkins WHERE user_id = u.id) as checkin_count,
        (SELECT COUNT(*) FROM achievements WHERE user_id = u.id) as achievement_count,
        (SELECT COUNT(*) FROM milestones WHERE user_id = u.id) as milestone_count
      FROM users u
      WHERE LOWER(u.name) = LOWER($1)
      ORDER BY u.last_active DESC
    `).all(name.trim())

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error finding users:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST - Merge data from one user to another (for recovery)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromUserId, toUserId, transferPassword } = body

    if (!fromUserId || !toUserId) {
      return NextResponse.json({ error: 'Both fromUserId and toUserId required' }, { status: 400 })
    }

    // Move all data from one user to another
    const tables = [
      'chat_messages',
      'chat_sessions',
      'museum_items',
      'daily_checkins',
      'achievements',
      'milestones',
      'activity_log',
      'journal_entries',
      'user_goals',
      'daily_activity',
    ]

    const results: Record<string, number> = {}

    for (const table of tables) {
      try {
        const result = await db.prepare(`
          UPDATE ${table} SET user_id = $1 WHERE user_id = $2
        `).run(toUserId, fromUserId)
        results[table] = result.changes || 0
      } catch (e) {
        // Table might not exist or have user_id column
        results[table] = 0
      }
    }

    // Optionally transfer password
    if (transferPassword) {
      await db.prepare(`
        UPDATE users
        SET password_hash = (SELECT password_hash FROM users WHERE id = $1)
        WHERE id = $2
      `).run(fromUserId, toUserId)
      results['password_transferred'] = 1
    }

    return NextResponse.json({
      success: true,
      message: `Data transferred from ${fromUserId} to ${toUserId}`,
      results
    })
  } catch (error) {
    console.error('Error transferring data:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
