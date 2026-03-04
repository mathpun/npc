import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import db from '@/lib/db'

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

// GET - Fetch today's insight (generate if not exists)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    // Check if insight already exists for today
    const existingInsight = await db.prepare(`
      SELECT insight_text, insight_emoji FROM daily_insights
      WHERE user_id = ? AND insight_date = ?
    `).get(userId, today) as { insight_text: string; insight_emoji: string } | undefined

    if (existingInsight) {
      return NextResponse.json({
        insight: existingInsight.insight_text,
        emoji: existingInsight.insight_emoji,
        cached: true,
      })
    }

    // Get user profile and recent context
    const user = await db.prepare(`
      SELECT name, nickname, interests, goals FROM users WHERE id = ?
    `).get(userId) as { name: string; nickname?: string; interests: string; goals?: string } | undefined

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const displayName = user.nickname || user.name

    // Get recent check-ins (last 7 days)
    const recentCheckins = await db.prepare(`
      SELECT mood, ai_summary FROM daily_checkins
      WHERE user_id = ? AND checkin_date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY checkin_date DESC
      LIMIT 5
    `).all(userId) as { mood: string | null; ai_summary: string | null }[]

    // Get recent chat topics
    const recentSessions = await db.prepare(`
      SELECT session_goal, session_topic FROM chat_sessions
      WHERE user_id = ? AND started_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      ORDER BY started_at DESC
      LIMIT 5
    `).all(userId) as { session_goal: string | null; session_topic: string | null }[]

    // Build context for the insight
    const moodContext = recentCheckins
      .filter(c => c.mood || c.ai_summary)
      .map(c => c.ai_summary || c.mood)
      .slice(0, 3)
      .join('; ')

    const topicContext = recentSessions
      .filter(s => s.session_topic)
      .map(s => s.session_topic)
      .slice(0, 3)
      .join(', ')

    // Generate personalized insight using Claude
    const prompt = `You are creating a short, personalized daily insight for a teen named ${displayName}.

Their interests: ${user.interests}
${user.goals ? `Their goals: ${user.goals}` : ''}
${moodContext ? `Recent moods/reflections: ${moodContext}` : ''}
${topicContext ? `Recent topics they've been thinking about: ${topicContext}` : ''}

Create a 2-3 sentence horoscope-style message that:
- Sparks JOY! Make them smile or feel good about themselves
- Feels warm, playful, and personal to THEM
- Has a touch of humor or delightful energy
- References something specific from their context if available
- Sounds like a fun friend hyping them up, not generic advice
- Could make them laugh or at least go "aww"
- Is appropriate for a teenager

Vibe: fortune cookie meets best friend meets daily affirmation meets inside joke

Also suggest ONE emoji that captures the vibe (fun ones! not generic star/sparkle).

Format your response as JSON:
{"insight": "Your message here...", "emoji": "emoji"}

Output ONLY the JSON, nothing else.`

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    let insight = `Today is a good day to be curious about something new, ${displayName}.`
    let emoji = '✨'

    const textContent = response.content.find(block => block.type === 'text')
    if (textContent && textContent.type === 'text') {
      try {
        const parsed = JSON.parse(textContent.text)
        insight = parsed.insight || insight
        emoji = parsed.emoji || emoji
      } catch {
        // If JSON parsing fails, use the raw text as insight
        insight = textContent.text.slice(0, 300)
      }
    }

    // Cache the insight in the database
    await db.prepare(`
      INSERT INTO daily_insights (user_id, insight_date, insight_text, insight_emoji)
      VALUES (?, ?, ?, ?)
      ON CONFLICT (user_id, insight_date)
      DO UPDATE SET insight_text = ?, insight_emoji = ?
    `).run(userId, today, insight, emoji, insight, emoji)

    return NextResponse.json({
      insight,
      emoji,
      cached: false,
    })
  } catch (error) {
    console.error('Error generating daily insight:', error)
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 })
  }
}
