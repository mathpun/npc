import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET user stats for growth tab metrics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  try {
    // Get total sessions completed
    const sessionsResult = await db.prepare(`
      SELECT COUNT(*) as count FROM chat_sessions WHERE user_id = ?
    `).get(userId) as { count: number } | undefined

    // Get total messages sent by user
    const messagesResult = await db.prepare(`
      SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ? AND role = 'user'
    `).get(userId) as { count: number } | undefined

    // Get total check-ins completed
    const checkinsResult = await db.prepare(`
      SELECT COUNT(*) as count FROM daily_checkins WHERE user_id = ?
    `).get(userId) as { count: number } | undefined

    // Get completed goals
    const goalsResult = await db.prepare(`
      SELECT COUNT(*) as count FROM user_goals WHERE user_id = ? AND status = 'completed'
    `).get(userId) as { count: number } | undefined

    // Get total achievements
    const achievementsResult = await db.prepare(`
      SELECT COUNT(*) as count FROM achievements WHERE user_id = ?
    `).get(userId) as { count: number } | undefined

    // Get completed challenges
    const challengesResult = await db.prepare(`
      SELECT COUNT(*) as count FROM user_challenges WHERE user_id = ?
    `).get(userId) as { count: number } | undefined

    // Get sessions this week
    const sessionsThisWeekResult = await db.prepare(`
      SELECT COUNT(*) as count FROM chat_sessions
      WHERE user_id = ? AND started_at >= CURRENT_DATE - INTERVAL '7 days'
    `).get(userId) as { count: number } | undefined

    // Calculate average session length (in messages per session)
    const avgSessionResult = await db.prepare(`
      SELECT COALESCE(AVG(message_count), 0) as avg FROM chat_sessions
      WHERE user_id = ? AND message_count > 0
    `).get(userId) as { avg: number } | undefined

    // Calculate reflective thinking score based on:
    // - Number of sessions, check-ins, messages, and goals
    const sessionsCompleted = sessionsResult?.count || 0
    const messagesCount = messagesResult?.count || 0
    const checkinsCount = checkinsResult?.count || 0
    const goalsCompleted = goalsResult?.count || 0

    // Simple score calculation (can be refined)
    // Each session = 5 points, each message = 1 point, each check-in = 10 points, each goal = 15 points
    // Max score = 100
    const rawScore = (sessionsCompleted * 5) + (messagesCount * 1) + (checkinsCount * 10) + (goalsCompleted * 15)
    const reflectiveThinkingScore = Math.min(100, Math.round(rawScore / 2))

    // Get list of completed challenge IDs
    const completedChallenges = await db.prepare(`
      SELECT challenge_id FROM user_challenges WHERE user_id = ?
    `).all(userId) as { challenge_id: string }[]

    return NextResponse.json({
      sessionsCompleted: sessionsResult?.count || 0,
      messagesCount: messagesResult?.count || 0,
      checkinsCompleted: checkinsResult?.count || 0,
      goalsCompleted: goalsResult?.count || 0,
      achievementsCount: achievementsResult?.count || 0,
      challengesCompleted: challengesResult?.count || 0,
      sessionsThisWeek: sessionsThisWeekResult?.count || 0,
      avgSessionLength: Math.round(avgSessionResult?.avg || 0),
      reflectiveThinkingScore,
      completedChallengeIds: completedChallenges.map(c => c.challenge_id),
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
