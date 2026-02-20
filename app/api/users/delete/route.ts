import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify user exists and check password (if not Google auth)
    const user = await db.prepare(
      'SELECT id, password_hash, auth_provider FROM users WHERE id = ?'
    ).get(userId) as { id: string; password_hash: string | null; auth_provider: string } | undefined

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user has password auth, verify password
    if (user.auth_provider === 'password' && user.password_hash) {
      const bcrypt = await import('bcryptjs')
      const passwordMatch = await bcrypt.compare(password || '', user.password_hash)
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
      }
    }

    // Delete all user data in order (respecting foreign key constraints)
    // Order matters: delete child records before parent records

    // 1. Delete prompt_responses (references parent_prompts)
    await db.prepare('DELETE FROM prompt_responses WHERE user_id = ?').run(userId)

    // 2. Delete parent_reports (references parent_connections)
    await db.prepare('DELETE FROM parent_reports WHERE user_id = ?').run(userId)

    // 3. Delete flagged_messages (references chat_messages)
    await db.prepare('DELETE FROM flagged_messages WHERE user_id = ?').run(userId)

    // 4. Delete chat_messages (references chat_sessions)
    await db.prepare('DELETE FROM chat_messages WHERE user_id = ?').run(userId)

    // 5. Delete chat_sessions (references chat_buckets)
    await db.prepare('DELETE FROM chat_sessions WHERE user_id = ?').run(userId)

    // 6. Now delete all other tables that reference users directly
    await db.prepare('DELETE FROM chat_buckets WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM activity_log WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM journal_entries WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM user_goals WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM milestones WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM daily_activity WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM achievements WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM parent_prompts WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM museum_items WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM museums WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM daily_checkins WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM user_challenges WHERE user_id = ?').run(userId)
    await db.prepare('DELETE FROM parent_connections WHERE user_id = ?').run(userId)

    // 7. Finally delete the user
    await db.prepare('DELETE FROM users WHERE id = ?').run(userId)

    return NextResponse.json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
