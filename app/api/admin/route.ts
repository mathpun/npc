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
    const totalUsers = await db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number } | undefined

    // DAU - Daily Active Users (using Pacific timezone)
    const activeToday = await db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM activity_log
      WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Los_Angeles')::date
    `).get() as { count: number } | undefined

    // WAU - Weekly Active Users
    const activeThisWeek = await db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM activity_log
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `).get() as { count: number } | undefined

    // MAU - Monthly Active Users
    const activeThisMonth = await db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM activity_log
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `).get() as { count: number } | undefined

    const totalChats = await db.prepare(`
      SELECT COUNT(*) as count FROM chat_messages WHERE role = 'user'
    `).get() as { count: number } | undefined

    const totalJournals = await db.prepare(`
      SELECT COUNT(*) as count FROM journal_entries
    `).get() as { count: number } | undefined

    // New users this week
    const newUsersThisWeek = await db.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `).get() as { count: number } | undefined

    // New users today (using Pacific timezone)
    const newUsersToday = await db.prepare(`
      SELECT COUNT(*) as count FROM users
      WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Los_Angeles')::date
    `).get() as { count: number } | undefined

    // Total check-ins
    const totalCheckins = await db.prepare(`
      SELECT COUNT(*) as count FROM daily_checkins
    `).get() as { count: number } | undefined

    // Average messages per user
    const avgMessagesPerUser = await db.prepare(`
      SELECT ROUND(AVG(msg_count)::numeric, 1) as avg
      FROM (SELECT COUNT(*) as msg_count FROM chat_messages WHERE role = 'user' GROUP BY user_id) sub
    `).get() as { avg: number } | undefined

    // Returning users (users active more than once)
    const returningUsers = await db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT user_id FROM activity_log
        GROUP BY user_id
        HAVING COUNT(DISTINCT created_at::date) > 1
      ) sub
    `).get() as { count: number } | undefined

    // Get all users with their stats
    const users = await db.prepare(`
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
    const recentActivity = await db.prepare(`
      SELECT
        al.*,
        u.name as user_name
      FROM activity_log al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `).all()

    // Get activity by day (last 14 days)
    const dailyActivity = await db.prepare(`
      SELECT
        created_at::date as date,
        COUNT(*) as total,
        COUNT(DISTINCT user_id) as unique_users
      FROM activity_log
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY created_at::date
      ORDER BY date DESC
    `).all()

    // Get chats per day (last 14 days)
    const chatsPerDay = await db.prepare(`
      SELECT
        created_at::date as date,
        COUNT(*) as total
      FROM chat_messages
      WHERE role = 'user' AND created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY created_at::date
      ORDER BY date DESC
    `).all()

    // Get signups per day (last 14 days)
    const signupsPerDay = await db.prepare(`
      SELECT
        created_at::date as date,
        COUNT(*) as total
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY created_at::date
      ORDER BY date DESC
    `).all()

    // Get check-ins per day (last 14 days)
    const checkinsPerDay = await db.prepare(`
      SELECT
        checkin_date as date,
        COUNT(*) as total
      FROM daily_checkins
      WHERE checkin_date >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY checkin_date
      ORDER BY date DESC
    `).all()

    // Get popular topics from chat
    const topTopics = await db.prepare(`
      SELECT
        session_topic,
        COUNT(*) as count
      FROM chat_sessions
      WHERE session_topic IS NOT NULL
      GROUP BY session_topic
      ORDER BY count DESC
      LIMIT 10
    `).all()

    // Get persona usage stats
    const personaStats = await db.prepare(`
      SELECT
        COALESCE(persona, 'none') as persona,
        COUNT(*) as count
      FROM chat_sessions
      GROUP BY persona
      ORDER BY count DESC
    `).all()

    // Get theme/skin usage stats (most recent theme per user)
    const themeStats = await db.prepare(`
      SELECT
        activity_data->>'themeId' as theme_id,
        COUNT(DISTINCT user_id) as user_count
      FROM activity_log
      WHERE activity_type = 'theme_change'
        AND activity_data->>'themeId' IS NOT NULL
        AND id IN (
          SELECT MAX(id) FROM activity_log
          WHERE activity_type = 'theme_change'
          GROUP BY user_id
        )
      GROUP BY activity_data->>'themeId'
      ORDER BY user_count DESC
    `).all()

    // Get parent report stats
    const parentReportStats = await db.prepare(`
      SELECT
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_reports,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_reports,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_reports
      FROM parent_reports
    `).get() as { total_reports: number; sent_reports: number; draft_reports: number; approved_reports: number } | undefined

    // Get parent reports sent over time (last 14 days)
    const parentReportsPerDay = await db.prepare(`
      SELECT
        sent_at::date as date,
        COUNT(*) as total
      FROM parent_reports
      WHERE status = 'sent' AND sent_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY sent_at::date
      ORDER BY date DESC
    `).all()

    // Get time spent per user (from chat sessions) + chat count
    const timeSpentPerUser = await db.prepare(`
      SELECT
        u.id as user_id,
        u.name as user_name,
        u.age,
        COALESCE(SUM(
          EXTRACT(EPOCH FROM (COALESCE(cs.ended_at, cs.started_at + INTERVAL '5 minutes') - cs.started_at)) / 60
        ), 0)::integer as total_minutes,
        COUNT(DISTINCT cs.id) as session_count,
        COALESCE(AVG(
          EXTRACT(EPOCH FROM (COALESCE(cs.ended_at, cs.started_at + INTERVAL '5 minutes') - cs.started_at)) / 60
        ), 0)::integer as avg_session_minutes,
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.user_id = u.id) as chat_count
      FROM users u
      LEFT JOIN chat_sessions cs ON u.id = cs.user_id
      GROUP BY u.id, u.name, u.age
      ORDER BY total_minutes DESC
      LIMIT 50
    `).all()

    // Get total time spent in app (all users)
    const totalTimeStats = await db.prepare(`
      SELECT
        COALESCE(SUM(
          EXTRACT(EPOCH FROM (COALESCE(ended_at, started_at + INTERVAL '5 minutes') - started_at)) / 60
        ), 0)::integer as total_minutes,
        COUNT(*) as total_sessions,
        COALESCE(AVG(
          EXTRACT(EPOCH FROM (COALESCE(ended_at, started_at + INTERVAL '5 minutes') - started_at)) / 60
        ), 0)::integer as avg_session_minutes
      FROM chat_sessions
    `).get() as { total_minutes: number; total_sessions: number; avg_session_minutes: number } | undefined

    // Get custom personas created by users
    const customPersonas = await db.prepare(`
      SELECT
        al.activity_data,
        al.created_at,
        u.name as user_name
      FROM activity_log al
      JOIN users u ON al.user_id = u.id
      WHERE al.activity_type = 'session_start'
        AND al.activity_data LIKE '%"persona":"custom"%'
      ORDER BY al.created_at DESC
      LIMIT 50
    `).all()

    // Get recent chat messages
    const chatMessages = await db.prepare(`
      SELECT
        cm.*,
        u.name as user_name
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      ORDER BY cm.created_at DESC
      LIMIT 200
    `).all()

    // Get daily check-ins with user info
    const dailyCheckins = await db.prepare(`
      SELECT
        dc.*,
        u.name as user_name,
        u.age as user_age
      FROM daily_checkins dc
      JOIN users u ON dc.user_id = u.id
      ORDER BY dc.created_at DESC
      LIMIT 100
    `).all()

    // Get flagged messages for content safety
    const flaggedMessages = await db.prepare(`
      SELECT
        fm.*,
        u.name as user_name,
        u.age as user_age
      FROM flagged_messages fm
      JOIN users u ON fm.user_id = u.id
      ORDER BY
        CASE fm.severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        fm.created_at DESC
      LIMIT 100
    `).all()

    // Count unreviewed flagged messages
    const unreviewedFlags = await db.prepare(`
      SELECT COUNT(*) as count FROM flagged_messages WHERE reviewed = 0
    `).get() as { count: number } | undefined

    // Retention rate (returning users / total users)
    const retentionRate = totalUsers?.count
      ? Math.round(((returningUsers?.count || 0) / totalUsers.count) * 100)
      : 0

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers?.count || 0,
        activeToday: activeToday?.count || 0,
        activeThisWeek: activeThisWeek?.count || 0,
        activeThisMonth: activeThisMonth?.count || 0,
        totalChats: totalChats?.count || 0,
        totalJournals: totalJournals?.count || 0,
        totalCheckins: totalCheckins?.count || 0,
        newUsersToday: newUsersToday?.count || 0,
        newUsersThisWeek: newUsersThisWeek?.count || 0,
        avgMessagesPerUser: avgMessagesPerUser?.avg || 0,
        returningUsers: returningUsers?.count || 0,
        retentionRate,
        unreviewedFlags: unreviewedFlags?.count || 0,
        parentReportsSent: parentReportStats?.sent_reports || 0,
        parentReportsTotal: parentReportStats?.total_reports || 0,
        totalTimeMinutes: totalTimeStats?.total_minutes || 0,
        avgSessionMinutes: totalTimeStats?.avg_session_minutes || 0,
      },
      users,
      recentActivity,
      dailyActivity,
      chatsPerDay,
      signupsPerDay,
      checkinsPerDay,
      topTopics,
      personaStats,
      themeStats,
      parentReportStats,
      parentReportsPerDay,
      customPersonas,
      timeSpentPerUser,
      chatMessages,
      dailyCheckins,
      flaggedMessages,
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

// PUT - mark flagged message as reviewed
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { flagId, reviewed } = body

    if (!flagId) {
      return NextResponse.json({ error: 'Missing flagId' }, { status: 400 })
    }

    await db.prepare(`
      UPDATE flagged_messages
      SET reviewed = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(reviewed ? 1 : 0, flagId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating flagged message:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
