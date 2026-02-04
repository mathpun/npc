import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET user stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    // Get user info
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get chat count
    const chatCount = await db.prepare(`
      SELECT COUNT(*) as count FROM activity_log
      WHERE user_id = ? AND activity_type = 'chat_message'
    `).get(userId) as { count: number } | undefined

    // Get journal count
    const journalCount = await db.prepare(`
      SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?
    `).get(userId) as { count: number } | undefined

    // Get achievements
    const achievements = await db.prepare(`
      SELECT achievement_key, unlocked_at FROM achievements WHERE user_id = ?
    `).all(userId) as { achievement_key: string; unlocked_at: string }[]

    // Get milestones
    const milestones = await db.prepare(`
      SELECT * FROM milestones WHERE user_id = ? ORDER BY unlocked_at ASC
    `).all(userId)

    // Get goals
    const goals = await db.prepare(`
      SELECT * FROM user_goals WHERE user_id = ?
    `).all(userId) as any[]

    const goalsCompleted = goals.filter(g => g.status === 'completed').length

    // Calculate streak (days with activity in a row)
    const dailyActivity = await db.prepare(`
      SELECT activity_date FROM daily_activity
      WHERE user_id = ?
      ORDER BY activity_date DESC
    `).all(userId) as { activity_date: string }[]

    let streak = 0
    if (dailyActivity.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      // Check if user was active today or yesterday
      const lastActive = dailyActivity[0].activity_date
      if (lastActive === today || lastActive === yesterday) {
        streak = 1
        for (let i = 1; i < dailyActivity.length; i++) {
          const prevDate = new Date(dailyActivity[i - 1].activity_date)
          const currDate = new Date(dailyActivity[i].activity_date)
          const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000

          if (diffDays === 1) {
            streak++
          } else {
            break
          }
        }
      }
    }

    // Calculate level based on total activities
    const totalActivities = await db.prepare(`
      SELECT COUNT(*) as count FROM activity_log WHERE user_id = ?
    `).get(userId) as { count: number } | undefined

    const xp = (totalActivities?.count || 0) * 10 + (chatCount?.count || 0) * 5 + (journalCount?.count || 0) * 20 + goalsCompleted * 100
    const level = Math.floor(xp / 500) + 1
    const nextLevelXp = level * 500

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        age: user.age,
        interests: user.interests,
        goals: user.goals,
        createdAt: user.created_at,
      },
      stats: {
        streak,
        totalReflections: chatCount?.count || 0,
        journalEntries: journalCount?.count || 0,
        goalsCompleted,
        level,
        xp,
        nextLevelXp,
      },
      achievements,
      milestones,
      goals,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
