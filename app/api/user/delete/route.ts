import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Delete all user data in order (respecting foreign keys)
    // Order matters due to foreign key constraints

    // Delete chat messages
    await db.prepare(`DELETE FROM chat_messages WHERE user_id = ?`).run(userId)

    // Delete chat sessions
    await db.prepare(`DELETE FROM chat_sessions WHERE user_id = ?`).run(userId)

    // Delete chat buckets
    await db.prepare(`DELETE FROM chat_buckets WHERE user_id = ?`).run(userId)

    // Delete journal entries
    await db.prepare(`DELETE FROM journal_entries WHERE user_id = ?`).run(userId)

    // Delete daily check-ins
    await db.prepare(`DELETE FROM daily_checkins WHERE user_id = ?`).run(userId)

    // Delete personality islands
    await db.prepare(`DELETE FROM personality_islands WHERE user_id = ?`).run(userId)

    // Delete theme analysis
    await db.prepare(`DELETE FROM theme_analysis WHERE user_id = ?`).run(userId)

    // Delete daily insights
    await db.prepare(`DELETE FROM daily_insights WHERE user_id = ?`).run(userId)

    // Delete achievements
    await db.prepare(`DELETE FROM achievements WHERE user_id = ?`).run(userId)

    // Delete milestones
    await db.prepare(`DELETE FROM milestones WHERE user_id = ?`).run(userId)

    // Delete user goals
    await db.prepare(`DELETE FROM user_goals WHERE user_id = ?`).run(userId)

    // Delete daily activity
    await db.prepare(`DELETE FROM daily_activity WHERE user_id = ?`).run(userId)

    // Delete user challenges
    await db.prepare(`DELETE FROM user_challenges WHERE user_id = ?`).run(userId)

    // Delete museum items
    await db.prepare(`DELETE FROM museum_items WHERE user_id = ?`).run(userId)

    // Delete museum
    await db.prepare(`DELETE FROM museums WHERE user_id = ?`).run(userId)

    // Delete prompt responses
    await db.prepare(`DELETE FROM prompt_responses WHERE user_id = ?`).run(userId)

    // Delete flagged messages
    await db.prepare(`DELETE FROM flagged_messages WHERE user_id = ?`).run(userId)

    // Delete parent reports
    await db.prepare(`DELETE FROM parent_reports WHERE user_id = ?`).run(userId)

    // Delete parent connections
    await db.prepare(`DELETE FROM parent_connections WHERE user_id = ?`).run(userId)

    // Delete grass touches and points
    await db.prepare(`DELETE FROM grass_touches WHERE user_id = ?`).run(userId)
    await db.prepare(`DELETE FROM grass_points WHERE user_id = ?`).run(userId)

    // Delete image generation usage
    await db.prepare(`DELETE FROM image_generation_usage WHERE user_id = ?`).run(userId)

    // Delete world collaborators
    await db.prepare(`DELETE FROM world_collaborators WHERE user_id = ?`).run(userId)

    // Delete world elements for user's worlds
    await db.prepare(`
      DELETE FROM world_elements WHERE world_id IN (
        SELECT id FROM worlds WHERE user_id = ?
      )
    `).run(userId)

    // Delete worlds
    await db.prepare(`DELETE FROM worlds WHERE user_id = ?`).run(userId)

    // Delete activity log
    await db.prepare(`DELETE FROM activity_log WHERE user_id = ?`).run(userId)

    // Finally, delete the user
    await db.prepare(`DELETE FROM users WHERE id = ?`).run(userId)

    console.log(`[Delete Account] Successfully deleted all data for user: ${userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Delete Account] Error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
