import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import db from '@/lib/db'
import { buildCheckinPrompt, buildCheckinSummaryPrompt, CheckinContext, DAYS_OF_WEEK } from '@/lib/checkin-prompts'

let anthropic: Anthropic | null = null
function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }
    anthropic = new Anthropic({ apiKey })
  }
  return anthropic
}

// GET - Check if user has done today's check-in and get questions if needed
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    // Check if user has already checked in today
    const today = new Date().toISOString().split('T')[0]
    const existingCheckin = await db.prepare(`
      SELECT * FROM daily_checkins
      WHERE user_id = ? AND checkin_date = ?
    `).get(userId, today) as { id: number; questions: string; responses: string; mood: string } | undefined

    if (existingCheckin) {
      return NextResponse.json({
        hasCheckedInToday: true,
        checkin: {
          ...existingCheckin,
          questions: JSON.parse(existingCheckin.questions),
          responses: JSON.parse(existingCheckin.responses),
        }
      })
    }

    // User hasn't checked in today - generate questions
    const user = await db.prepare(`
      SELECT name, age, interests, goals FROM users WHERE id = ?
    `).get(userId) as { name: string; age: number; interests: string; goals: string | null } | undefined

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get recent chat topics (last 7 days)
    const recentMessages = await db.prepare(`
      SELECT DISTINCT content FROM chat_messages
      WHERE user_id = ? AND role = 'user'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 10
    `).all(userId) as { content: string }[]

    // Extract topics from recent messages (first few words of each)
    const recentTopics = recentMessages
      .map(m => m.content.split(' ').slice(0, 5).join(' '))
      .slice(0, 5)

    // Get last mood
    const lastCheckin = await db.prepare(`
      SELECT mood FROM daily_checkins
      WHERE user_id = ?
      ORDER BY checkin_date DESC
      LIMIT 1
    `).get(userId) as { mood: string | null } | undefined

    // Build context for question generation
    const dayOfWeek = DAYS_OF_WEEK[new Date().getDay()]
    const context: CheckinContext = {
      name: user.name,
      age: user.age,
      interests: user.interests,
      goals: user.goals,
      recentTopics,
      dayOfWeek,
      lastMood: lastCheckin?.mood || null,
    }

    // Fallback question - always have this ready
    const fallbackQuestions = [
      `Hey ${user.name}! What's one thing on your mind right now?`,
    ]

    // Start with fallback questions - they'll be replaced if AI succeeds
    let questions: string[] = [...fallbackQuestions]

    // Try to generate personalized questions using Claude
    try {
      const prompt = buildCheckinPrompt(context)
      const response = await getAnthropicClient().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      })

      const textContent = response.content.find(block => block.type === 'text')
      if (textContent && textContent.type === 'text') {
        try {
          const parsed = JSON.parse(textContent.text)
          // Only use AI questions if we got a valid array with content
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            questions = parsed
          }
        } catch {
          // JSON parsing failed - keep using fallback
          console.log('Failed to parse AI questions, using fallback')
        }
      }
    } catch (err) {
      // AI call failed - keep using fallback
      console.error('Failed to generate questions with AI:', err)
    }

    // Final safety check - ensure we always have questions
    if (!Array.isArray(questions) || questions.length === 0) {
      questions = fallbackQuestions
    }

    return NextResponse.json({
      hasCheckedInToday: false,
      questions,
      userName: user.name,
    })
  } catch (error) {
    console.error('Error checking check-in status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}

// POST - Save check-in responses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, questions, responses, mood } = body

    if (!userId || !questions || !responses) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Get user name for summary
    const user = await db.prepare(`
      SELECT name FROM users WHERE id = ?
    `).get(userId) as { name: string } | undefined

    // Generate AI summary of the check-in
    let aiSummary = ''
    try {
      const summaryPrompt = buildCheckinSummaryPrompt(
        user?.name || 'User',
        questions,
        responses,
        mood
      )
      const summaryResponse = await getAnthropicClient().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: summaryPrompt }],
      })
      const summaryContent = summaryResponse.content.find(block => block.type === 'text')
      if (summaryContent && summaryContent.type === 'text') {
        aiSummary = summaryContent.text
      }
    } catch (err) {
      console.error('Failed to generate summary:', err)
    }

    // Save the check-in
    await db.prepare(`
      INSERT INTO daily_checkins (user_id, checkin_date, questions, responses, mood, ai_summary)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (user_id, checkin_date)
      DO UPDATE SET questions = ?, responses = ?, mood = ?, ai_summary = ?
    `).run(
      userId,
      today,
      JSON.stringify(questions),
      JSON.stringify(responses),
      mood || null,
      aiSummary,
      JSON.stringify(questions),
      JSON.stringify(responses),
      mood || null,
      aiSummary
    )

    // Update daily activity
    await db.prepare(`
      INSERT INTO daily_activity (user_id, activity_date, journal_count)
      VALUES (?, ?, 1)
      ON CONFLICT(user_id, activity_date)
      DO UPDATE SET journal_count = journal_count + 1
    `).run(userId, today)

    // Log the activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'daily_checkin', ?)
    `).run(userId, JSON.stringify({ mood, questionCount: questions.length }))

    // Update streak tracking
    const streakInfo = await updateCheckinStreak(userId, today)

    // Check for check-in achievements
    await checkCheckinAchievements(userId)

    return NextResponse.json({
      success: true,
      summary: aiSummary,
      streak: streakInfo,
    })
  } catch (error) {
    console.error('Error saving check-in:', error)
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 })
  }
}

async function updateCheckinStreak(userId: string, today: string): Promise<{
  currentStreak: number
  longestStreak: number
  isNewRecord: boolean
}> {
  try {
    // Get user's current streak info
    const user = await db.prepare(`
      SELECT checkin_streak, longest_checkin_streak, last_checkin_date
      FROM users WHERE id = ?
    `).get(userId) as {
      checkin_streak: number | null
      longest_checkin_streak: number | null
      last_checkin_date: string | null
    } | undefined

    const currentStreak = user?.checkin_streak || 0
    const longestStreak = user?.longest_checkin_streak || 0
    const lastCheckinDate = user?.last_checkin_date

    let newStreak: number

    if (!lastCheckinDate) {
      // First ever check-in
      newStreak = 1
    } else {
      // Calculate days between last check-in and today
      const lastDate = new Date(lastCheckinDate)
      const todayDate = new Date(today)
      const diffTime = todayDate.getTime() - lastDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Already checked in today - no streak change
        newStreak = currentStreak || 1
      } else if (diffDays === 1) {
        // Consecutive day - increment streak!
        newStreak = currentStreak + 1
      } else {
        // Missed days - reset streak
        newStreak = 1
      }
    }

    // Check if this is a new record
    const newLongestStreak = Math.max(newStreak, longestStreak)
    const isNewRecord = newStreak > longestStreak && newStreak > 1

    // Update the user's streak info
    await db.prepare(`
      UPDATE users
      SET checkin_streak = ?,
          longest_checkin_streak = ?,
          last_checkin_date = ?
      WHERE id = ?
    `).run(newStreak, newLongestStreak, today, userId)

    return {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      isNewRecord,
    }
  } catch (error) {
    console.error('Error updating streak:', error)
    return { currentStreak: 1, longestStreak: 1, isNewRecord: false }
  }
}

async function checkCheckinAchievements(userId: string) {
  try {
    // Count total check-ins
    const checkinCount = await db.prepare(`
      SELECT COUNT(*) as count FROM daily_checkins WHERE user_id = ?
    `).get(userId) as { count: number } | undefined

    // First check-in achievement
    if (checkinCount?.count === 1) {
      await db.prepare(`
        INSERT INTO achievements (user_id, achievement_key)
        VALUES (?, 'first_checkin')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
      `).run(userId)

      await db.prepare(`
        INSERT INTO milestones (user_id, milestone_type, title, description, color)
        VALUES (?, 'first_checkin', 'First Check-In', 'Started reflecting on your day!', '#98FB98')
      `).run(userId)
    }

    // Check for 7-day check-in streak
    const streakCount = await db.prepare(`
      SELECT COUNT(*) as count FROM daily_checkins
      WHERE user_id = ?
      AND checkin_date >= CURRENT_DATE - INTERVAL '7 days'
    `).get(userId) as { count: number } | undefined

    if (streakCount && streakCount.count >= 7) {
      await db.prepare(`
        INSERT INTO achievements (user_id, achievement_key)
        VALUES (?, 'checkin_streak_7')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
      `).run(userId)
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}
