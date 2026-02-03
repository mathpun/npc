import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// Simple admin password - in production, use proper auth!
const ADMIN_PASSWORD = 'npc-admin-2024'

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const password = authHeader.replace('Bearer ', '')
  return password === ADMIN_PASSWORD
}

// GET admin dashboard data
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get overall stats
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
    const activeToday = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM activity_log
      WHERE date(created_at) = date('now')
    `).get() as { count: number }
    const totalChats = db.prepare(`
      SELECT COUNT(*) as count FROM activity_log WHERE activity_type = 'chat_message'
    `).get() as { count: number }
    const totalJournals = db.prepare(`
      SELECT COUNT(*) as count FROM journal_entries
    `).get() as { count: number }

    // Get all users with their stats
    const users = db.prepare(`
      SELECT
        u.*,
        (SELECT COUNT(*) FROM activity_log WHERE user_id = u.id) as total_activities,
        (SELECT COUNT(*) FROM activity_log WHERE user_id = u.id AND activity_type = 'chat_message') as chat_count,
        (SELECT COUNT(*) FROM journal_entries WHERE user_id = u.id) as journal_count,
        (SELECT COUNT(*) FROM achievements WHERE user_id = u.id) as achievement_count,
        (SELECT COUNT(*) FROM milestones WHERE user_id = u.id) as milestone_count,
        (SELECT COUNT(*) FROM user_goals WHERE user_id = u.id AND status = 'completed') as goals_completed
      FROM users u
      ORDER BY u.last_active DESC
    `).all()

    // Get recent activity feed
    const recentActivity = db.prepare(`
      SELECT
        al.*,
        u.name as user_name
      FROM activity_log al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `).all()

    // Get activity by day (last 7 days)
    const dailyActivity = db.prepare(`
      SELECT
        date(created_at) as date,
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as unique_users
      FROM activity_log
      WHERE created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date DESC
    `).all()

    // Get popular topics from chat
    const topTopics = db.prepare(`
      SELECT
        session_topic,
        COUNT(*) as count
      FROM chat_sessions
      WHERE session_topic IS NOT NULL
      GROUP BY session_topic
      ORDER BY count DESC
      LIMIT 10
    `).all()

    // Get recent chat messages
    const chatMessages = db.prepare(`
      SELECT
        cm.*,
        u.name as user_name
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      ORDER BY cm.created_at DESC
      LIMIT 200
    `).all()

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers.count,
        activeToday: activeToday.count,
        totalChats: totalChats.count,
        totalJournals: totalJournals.count,
      },
      users,
      recentActivity,
      dailyActivity,
      topTopics,
      chatMessages,
    })
  } catch (error) {
    console.error('Admin data error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST - verify admin password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
