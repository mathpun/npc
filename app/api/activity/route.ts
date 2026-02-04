import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// POST log activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, activityType, activityData } = body

    if (!userId || !activityType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Log the activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, ?, ?)
    `).run(userId, activityType, activityData ? JSON.stringify(activityData) : null)

    // Update user's last_active
    await db.prepare(`
      UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?
    `).run(userId)

    // Update daily activity counts
    const today = new Date().toISOString().split('T')[0]

    if (activityType === 'chat_message') {
      await db.prepare(`
        INSERT INTO daily_activity (user_id, activity_date, chat_count)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, activity_date)
        DO UPDATE SET chat_count = chat_count + 1
      `).run(userId, today)
    } else if (activityType === 'journal_entry') {
      await db.prepare(`
        INSERT INTO daily_activity (user_id, activity_date, journal_count)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, activity_date)
        DO UPDATE SET journal_count = journal_count + 1
      `).run(userId, today)
    }

    // Check for achievements
    await checkAndGrantAchievements(userId, activityType)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 })
  }
}

// GET activity for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    if (userId) {
      const activities = await db.prepare(`
        SELECT * FROM activity_log
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `).all(userId, limit)
      return NextResponse.json(activities)
    }

    // Get all recent activity (for admin)
    const activities = await db.prepare(`
      SELECT al.*, u.name as user_name
      FROM activity_log al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(limit)
    return NextResponse.json(activities)
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

async function checkAndGrantAchievements(userId: string, activityType: string) {
  try {
    // First chat achievement
    if (activityType === 'chat_message') {
      const chatCount = await db.prepare(`
        SELECT COUNT(*) as count FROM activity_log
        WHERE user_id = ? AND activity_type = 'chat_message'
      `).get(userId) as { count: number } | undefined

      if (chatCount?.count === 1) {
        await db.prepare(`
          INSERT INTO achievements (user_id, achievement_key)
          VALUES (?, 'first_chat')
          ON CONFLICT (user_id, achievement_key) DO NOTHING
        `).run(userId)

        await db.prepare(`
          INSERT INTO milestones (user_id, milestone_type, title, description, color)
          VALUES (?, 'first_chat', 'First Deep Chat', 'Had your first meaningful conversation!', '#87CEEB')
        `).run(userId)
      }

      if (chatCount?.count === 10) {
        await db.prepare(`
          INSERT INTO achievements (user_id, achievement_key)
          VALUES (?, 'deep_thinker')
          ON CONFLICT (user_id, achievement_key) DO NOTHING
        `).run(userId)
      }
    }

    // Journal achievements
    if (activityType === 'journal_entry') {
      const journalCount = await db.prepare(`
        SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?
      `).get(userId) as { count: number } | undefined

      if (journalCount?.count === 1) {
        await db.prepare(`
          INSERT INTO milestones (user_id, milestone_type, title, description, color)
          VALUES (?, 'first_journal', 'First Journal Entry', 'Started documenting your journey!', '#FFD700')
        `).run(userId)
      }

      if (journalCount?.count === 5) {
        await db.prepare(`
          INSERT INTO achievements (user_id, achievement_key)
          VALUES (?, 'journal_keeper')
          ON CONFLICT (user_id, achievement_key) DO NOTHING
        `).run(userId)
      }
    }

    // Check streak achievements
    const streakDays = await db.prepare(`
      SELECT COUNT(DISTINCT activity_date) as days
      FROM daily_activity
      WHERE user_id = ?
      AND activity_date >= CURRENT_DATE - INTERVAL '30 days'
    `).get(userId) as { days: number } | undefined

    if (streakDays && streakDays.days >= 3) {
      await db.prepare(`
        INSERT INTO achievements (user_id, achievement_key)
        VALUES (?, 'streak_3')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
      `).run(userId)
    }
    if (streakDays && streakDays.days >= 7) {
      await db.prepare(`
        INSERT INTO achievements (user_id, achievement_key)
        VALUES (?, 'streak_7')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
      `).run(userId)
    }
    if (streakDays && streakDays.days >= 30) {
      await db.prepare(`
        INSERT INTO achievements (user_id, achievement_key)
        VALUES (?, 'streak_30')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
      `).run(userId)
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}
