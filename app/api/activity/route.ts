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
    db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, ?, ?)
    `).run(userId, activityType, activityData ? JSON.stringify(activityData) : null)

    // Update user's last_active
    db.prepare(`
      UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?
    `).run(userId)

    // Update daily activity counts
    const today = new Date().toISOString().split('T')[0]

    if (activityType === 'chat_message') {
      db.prepare(`
        INSERT INTO daily_activity (user_id, activity_date, chat_count)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, activity_date)
        DO UPDATE SET chat_count = chat_count + 1
      `).run(userId, today)
    } else if (activityType === 'journal_entry') {
      db.prepare(`
        INSERT INTO daily_activity (user_id, activity_date, journal_count)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, activity_date)
        DO UPDATE SET journal_count = journal_count + 1
      `).run(userId, today)
    }

    // Check for achievements
    checkAndGrantAchievements(userId, activityType)

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
      const activities = db.prepare(`
        SELECT * FROM activity_log
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `).all(userId, limit)
      return NextResponse.json(activities)
    }

    // Get all recent activity (for admin)
    const activities = db.prepare(`
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

function checkAndGrantAchievements(userId: string, activityType: string) {
  try {
    // First chat achievement
    if (activityType === 'chat_message') {
      const chatCount = db.prepare(`
        SELECT COUNT(*) as count FROM activity_log
        WHERE user_id = ? AND activity_type = 'chat_message'
      `).get(userId) as { count: number }

      if (chatCount.count === 1) {
        db.prepare(`
          INSERT OR IGNORE INTO achievements (user_id, achievement_key)
          VALUES (?, 'first_chat')
        `).run(userId)

        db.prepare(`
          INSERT INTO milestones (user_id, milestone_type, title, description, color)
          VALUES (?, 'first_chat', 'First Deep Chat', 'Had your first meaningful conversation!', '#87CEEB')
        `).run(userId)
      }

      if (chatCount.count === 10) {
        db.prepare(`
          INSERT OR IGNORE INTO achievements (user_id, achievement_key)
          VALUES (?, 'deep_thinker')
        `).run(userId)
      }
    }

    // Journal achievements
    if (activityType === 'journal_entry') {
      const journalCount = db.prepare(`
        SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?
      `).get(userId) as { count: number }

      if (journalCount.count === 1) {
        db.prepare(`
          INSERT INTO milestones (user_id, milestone_type, title, description, color)
          VALUES (?, 'first_journal', 'First Journal Entry', 'Started documenting your journey!', '#FFD700')
        `).run(userId)
      }

      if (journalCount.count === 5) {
        db.prepare(`
          INSERT OR IGNORE INTO achievements (user_id, achievement_key)
          VALUES (?, 'journal_keeper')
        `).run(userId)
      }
    }

    // Check streak achievements
    const streakDays = db.prepare(`
      SELECT COUNT(DISTINCT activity_date) as days
      FROM daily_activity
      WHERE user_id = ?
      AND activity_date >= date('now', '-30 days')
    `).get(userId) as { days: number }

    if (streakDays.days >= 3) {
      db.prepare(`
        INSERT OR IGNORE INTO achievements (user_id, achievement_key)
        VALUES (?, 'streak_3')
      `).run(userId)
    }
    if (streakDays.days >= 7) {
      db.prepare(`
        INSERT OR IGNORE INTO achievements (user_id, achievement_key)
        VALUES (?, 'streak_7')
      `).run(userId)
    }
    if (streakDays.days >= 30) {
      db.prepare(`
        INSERT OR IGNORE INTO achievements (user_id, achievement_key)
        VALUES (?, 'streak_30')
      `).run(userId)
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}
