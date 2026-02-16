import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import db from '@/lib/db'

const anthropic = new Anthropic()

// POST - Generate an AI parent report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, parentConnectionId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get user info
    const user = await db.prepare(`
      SELECT name, age, interests FROM users WHERE id = ?
    `).get(userId) as { name: string; age: number; interests: string } | undefined

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the last 7 days of data
    const weekEnd = new Date()
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get check-ins from the week
    const checkins = await db.prepare(`
      SELECT checkin_date, mood, ai_summary
      FROM daily_checkins
      WHERE user_id = ?
      AND checkin_date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY checkin_date DESC
    `).all(userId) as { checkin_date: string; mood: string | null; ai_summary: string | null }[]

    // Get chat session summaries (topics, not content)
    const sessions = await db.prepare(`
      SELECT session_goal, session_topic, persona, message_count, started_at
      FROM chat_sessions
      WHERE user_id = ?
      AND started_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      ORDER BY started_at DESC
    `).all(userId) as { session_goal: string | null; session_topic: string | null; persona: string | null; message_count: number; started_at: string }[]

    // Get high-level themes from recent messages (first few words only, for AI to summarize)
    const recentTopics = await db.prepare(`
      SELECT SUBSTRING(content, 1, 100) as snippet
      FROM chat_messages
      WHERE user_id = ? AND role = 'user'
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 15
    `).all(userId) as { snippet: string }[]

    // Calculate engagement stats
    const totalSessions = sessions.length
    const totalMessages = sessions.reduce((sum, s) => sum + (s.message_count || 0), 0)
    const totalCheckins = checkins.length

    // Calculate mood trend
    const moodValues: Record<string, number> = {
      'rough': 1, 'meh': 2, 'okay': 3, 'good': 4, 'great': 5
    }
    const moodScores = checkins
      .filter(c => c.mood)
      .map(c => moodValues[c.mood!] || 3)
    const avgMood = moodScores.length > 0
      ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
      : null

    // Use AI to generate a privacy-respecting summary
    const aiPrompt = `You are helping create a weekly summary for a parent about their teen's reflection journey.
The teen uses an app called "npc" to think through problems and develop reflection skills.

IMPORTANT: This summary should be HIGH-LEVEL and PRIVACY-RESPECTING.
- Do NOT include specific details about what the teen discussed
- Focus on THEMES and PATTERNS, not specific content
- Frame everything positively and constructively
- The goal is to spark conversation, not surveillance

Teen's name: ${user.name}
Teen's age: ${user.age}

This week's data:
- ${totalCheckins} daily check-ins completed
- ${totalSessions} reflection sessions
- ${totalMessages} messages exchanged
- Average mood score: ${avgMood ? avgMood.toFixed(1) + '/5' : 'Not enough data'}

Session topics explored (general categories):
${sessions.map(s => `- ${s.session_goal || 'general reflection'}${s.session_topic ? ': ' + s.session_topic : ''}`).join('\n') || '- General reflection'}

Check-in summaries:
${checkins.map(c => c.ai_summary).filter(Boolean).join('\n') || 'No check-in summaries available'}

Topic snippets (for theme extraction only):
${recentTopics.map(t => t.snippet).join('\n') || 'No recent topics'}

Please generate:
1. THEMES_DISCUSSED: A brief, 1-2 sentence summary of general themes (e.g., "Explored feelings about school and friendships" NOT "Talked about fight with Sarah")
2. MOOD_SUMMARY: A supportive 1 sentence observation about their emotional week
3. GROWTH_HIGHLIGHTS: 1-2 positive observations about their reflection practice (e.g., "Showed great self-awareness" or "Engaged consistently")

Format your response as JSON:
{
  "themes_discussed": "...",
  "mood_summary": "...",
  "growth_highlights": "..."
}`

    let themes_discussed = "Engaged in personal reflection this week"
    let mood_summary = "Showed consistent engagement with daily check-ins"
    let growth_highlights = "Continued building a reflection practice"

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: aiPrompt }]
      })

      const content = response.content[0]
      if (content.type === 'text') {
        // Parse the JSON response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          themes_discussed = parsed.themes_discussed || themes_discussed
          mood_summary = parsed.mood_summary || mood_summary
          growth_highlights = parsed.growth_highlights || growth_highlights
        }
      }
    } catch (aiError) {
      console.error('AI generation error, using defaults:', aiError)
    }

    // Create the report in draft status
    const result = await db.prepare(`
      INSERT INTO parent_reports (
        user_id, parent_connection_id, report_type,
        week_start, week_end,
        themes_discussed, mood_summary, growth_highlights,
        engagement_stats, status
      )
      VALUES (?, ?, 'weekly', ?, ?, ?, ?, ?, ?, 'draft')
    `).run(
      userId,
      parentConnectionId || null,
      weekStart.toISOString().split('T')[0],
      weekEnd.toISOString().split('T')[0],
      themes_discussed,
      mood_summary,
      growth_highlights,
      JSON.stringify({
        checkins: totalCheckins,
        sessions: totalSessions,
        messages: totalMessages,
        avgMood: avgMood ? avgMood.toFixed(1) : null
      })
    )

    // Get the created report
    const report = await db.prepare(`
      SELECT * FROM parent_reports
      WHERE user_id = ?
      ORDER BY generated_at DESC
      LIMIT 1
    `).get(userId)

    return NextResponse.json({
      success: true,
      report,
      message: 'Report generated! Review and approve before sending.'
    })
  } catch (error) {
    console.error('Error generating parent report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
