import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(request: NextRequest) {
  // Simple auth check
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer migrate-secret-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create pool inside handler to ensure proper connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    const data = await request.json()
    const client = await pool.connect()

    try {
      // Migrate users
      if (data.users) {
        for (const user of data.users) {
          await client.query(`
            INSERT INTO users (id, name, age, interests, goals, created_at, last_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO NOTHING
          `, [user.id, user.name, user.age, user.interests, user.goals, user.created_at, user.last_active])
        }
      }

      // Migrate activity_log
      if (data.activity_log) {
        for (const act of data.activity_log) {
          await client.query(`
            INSERT INTO activity_log (user_id, activity_type, activity_data, created_at)
            VALUES ($1, $2, $3, $4)
          `, [act.user_id, act.activity_type, act.activity_data, act.created_at])
        }
      }

      // Migrate achievements
      if (data.achievements) {
        for (const ach of data.achievements) {
          await client.query(`
            INSERT INTO achievements (user_id, achievement_key, unlocked_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, achievement_key) DO NOTHING
          `, [ach.user_id, ach.achievement_key, ach.unlocked_at])
        }
      }

      // Migrate milestones
      if (data.milestones) {
        for (const ms of data.milestones) {
          await client.query(`
            INSERT INTO milestones (user_id, milestone_type, title, description, color, unlocked_at)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [ms.user_id, ms.milestone_type, ms.title, ms.description, ms.color, ms.unlocked_at])
        }
      }

      // Migrate chat_messages
      if (data.chat_messages) {
        for (const msg of data.chat_messages) {
          await client.query(`
            INSERT INTO chat_messages (user_id, role, content, created_at)
            VALUES ($1, $2, $3, $4)
          `, [msg.user_id, msg.role, msg.content, msg.created_at])
        }
      }

      // Migrate museum_items
      if (data.museum_items) {
        for (const item of data.museum_items) {
          await client.query(`
            INSERT INTO museum_items (user_id, emoji, name, description, origin_story, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [item.user_id, item.emoji, item.name, item.description, item.origin_story, item.created_at])
        }
      }

      // Migrate museums
      if (data.museums) {
        for (const museum of data.museums) {
          await client.query(`
            INSERT INTO museums (user_id, share_slug, museum_name, tagline, is_public, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id) DO NOTHING
          `, [museum.user_id, museum.share_slug, museum.museum_name, museum.tagline, museum.is_public, museum.created_at])
        }
      }

      // Migrate daily_activity
      if (data.daily_activity) {
        for (const d of data.daily_activity) {
          await client.query(`
            INSERT INTO daily_activity (user_id, activity_date, chat_count, journal_count)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, activity_date) DO NOTHING
          `, [d.user_id, d.activity_date, d.chat_count, d.journal_count])
        }
      }

      return NextResponse.json({
        success: true,
        migrated: {
          users: data.users?.length || 0,
          activity_log: data.activity_log?.length || 0,
          achievements: data.achievements?.length || 0,
          milestones: data.milestones?.length || 0,
          chat_messages: data.chat_messages?.length || 0,
          museum_items: data.museum_items?.length || 0,
          museums: data.museums?.length || 0,
          daily_activity: data.daily_activity?.length || 0,
        }
      })
    } finally {
      client.release()
      await pool.end()
    }
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed', details: String(error) }, { status: 500 })
  }
}
