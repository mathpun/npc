import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

interface CheckinRow {
  checkin_date: string
  questions: string
  responses: string
  mood: string | null
  ai_summary: string | null
}

interface ActivityRow {
  chat_count: number
  journal_count: number
}

interface ChatTopicRow {
  content: string
}

// GET - Fetch report data for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    // Get user info
    const user = await db.prepare(`
      SELECT name, age, interests, goals, created_at FROM users WHERE id = ?
    `).get(userId) as { name: string; age: number; interests: string; goals: string | null; created_at: string } | undefined

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get check-ins from the last 7 days
    const checkins = await db.prepare(`
      SELECT checkin_date, questions, responses, mood, ai_summary
      FROM daily_checkins
      WHERE user_id = ?
      AND checkin_date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY checkin_date DESC
    `).all(userId) as CheckinRow[]

    // Get daily activity from the last 7 days
    const activity = await db.prepare(`
      SELECT COALESCE(SUM(chat_count), 0) as chat_count,
             COALESCE(SUM(journal_count), 0) as journal_count
      FROM daily_activity
      WHERE user_id = ?
      AND activity_date >= CURRENT_DATE - INTERVAL '7 days'
    `).get(userId) as ActivityRow | undefined

    // Get mood trends from check-ins
    const moodTrend = checkins
      .filter(c => c.mood)
      .map(c => ({ date: c.checkin_date, mood: c.mood }))

    // Calculate mood trend direction
    const moodValues: Record<string, number> = {
      'rough': 1, 'meh': 2, 'okay': 3, 'good': 4, 'great': 5
    }
    let moodTrendDirection = 'stable'
    if (moodTrend.length >= 2) {
      const recentMoods = moodTrend.slice(0, 3).map(m => moodValues[m.mood || 'okay'] || 3)
      const olderMoods = moodTrend.slice(-3).map(m => moodValues[m.mood || 'okay'] || 3)
      const recentAvg = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
      const olderAvg = olderMoods.reduce((a, b) => a + b, 0) / olderMoods.length
      if (recentAvg > olderAvg + 0.5) moodTrendDirection = 'improving'
      else if (recentAvg < olderAvg - 0.5) moodTrendDirection = 'declining'
    }

    // Get recent chat topics
    const recentChats = await db.prepare(`
      SELECT content FROM chat_messages
      WHERE user_id = ? AND role = 'user'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 20
    `).all(userId) as ChatTopicRow[]

    // Simple topic extraction (first few words of each message, deduplicated)
    const topicCounts: Record<string, number> = {}
    for (const chat of recentChats) {
      const topic = chat.content.split(' ').slice(0, 4).join(' ')
      topicCounts[topic] = (topicCounts[topic] || 0) + 1
    }
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }))

    // Get streak
    const streakDays = await db.prepare(`
      SELECT COUNT(DISTINCT activity_date) as days
      FROM daily_activity
      WHERE user_id = ?
      AND activity_date >= CURRENT_DATE - INTERVAL '30 days'
    `).get(userId) as { days: number } | undefined

    // Build highlights from check-in summaries
    const highlights = checkins
      .filter(c => c.ai_summary)
      .slice(0, 3)
      .map((c, i) => ({
        text: c.ai_summary || '',
        date: c.checkin_date,
        emoji: ['💡', '🌟', '✨'][i],
        category: 'checkin'
      }))

    // Calculate week date range
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weekOf = `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

    return NextResponse.json({
      user: {
        name: user.name,
        age: user.age,
        interests: user.interests,
      },
      weekOf,
      summary: {
        reflections: activity?.chat_count || 0,
        checkins: checkins.length,
        journalEntries: activity?.journal_count || 0,
        streakDays: streakDays?.days || 0,
        moodTrend: moodTrendDirection,
      },
      checkins: checkins.map(c => ({
        date: c.checkin_date,
        questions: JSON.parse(c.questions),
        responses: JSON.parse(c.responses),
        mood: c.mood,
        summary: c.ai_summary,
      })),
      moodTrend,
      highlights,
      topTopics,
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
