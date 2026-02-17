import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

const ADMIN_PASSWORD = 'npc-admin-2024'

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const password = authHeader.replace('Bearer ', '')
  return password === ADMIN_PASSWORD
}

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET detailed user activity
export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: userId } = await params

  try {
    // Get user info
    const user = await db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).get(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's chat messages (last 100)
    const chatMessages = await db.prepare(`
      SELECT * FROM chat_messages
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(userId)

    // Get user's chat sessions
    const chatSessions = await db.prepare(`
      SELECT * FROM chat_sessions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(userId)

    // Get user's journal entries
    const journalEntries = await db.prepare(`
      SELECT * FROM journal_entries
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(userId)

    // Get user's daily check-ins
    const dailyCheckins = await db.prepare(`
      SELECT * FROM daily_checkins
      WHERE user_id = ?
      ORDER BY checkin_date DESC
      LIMIT 30
    `).all(userId)

    // Get user's achievements
    const achievements = await db.prepare(`
      SELECT * FROM achievements
      WHERE user_id = ?
      ORDER BY earned_at DESC
    `).all(userId)

    // Get user's goals
    const goals = await db.prepare(`
      SELECT * FROM user_goals
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId)

    // Get user's activity log
    const activityLog = await db.prepare(`
      SELECT * FROM activity_log
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(userId)

    // Get user's flagged messages
    const flaggedMessages = await db.prepare(`
      SELECT * FROM flagged_messages
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId)

    // Get activity stats by day (last 30 days)
    const activityByDay = await db.prepare(`
      SELECT
        created_at::date as date,
        COUNT(*) as total,
        SUM(CASE WHEN activity_type = 'chat_message' THEN 1 ELSE 0 END) as chats,
        SUM(CASE WHEN activity_type = 'journal_entry' THEN 1 ELSE 0 END) as journals
      FROM activity_log
      WHERE user_id = ? AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY created_at::date
      ORDER BY date DESC
    `).all(userId)

    // Get parent connections
    const parentConnections = await db.prepare(`
      SELECT * FROM parent_connections
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId)

    // Get parent reports
    const parentReports = await db.prepare(`
      SELECT * FROM parent_reports
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(userId)

    return NextResponse.json({
      user,
      chatMessages,
      chatSessions,
      journalEntries,
      dailyCheckins,
      achievements,
      goals,
      activityLog,
      flaggedMessages,
      activityByDay,
      parentConnections,
      parentReports,
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
