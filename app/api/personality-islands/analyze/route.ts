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

interface Theme {
  name: string
  emoji: string
  description: string
  strength: number
}

// POST - Analyze user's chat history and identify 3-5 core themes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Check if analysis already exists for today
    const existingAnalysis = await db.prepare(`
      SELECT themes_json FROM theme_analysis
      WHERE user_id = ? AND analysis_date = ?
    `).get(userId, today) as { themes_json: string } | undefined

    if (existingAnalysis) {
      return NextResponse.json({
        themes: JSON.parse(existingAnalysis.themes_json),
        cached: true,
      })
    }

    // Get user profile
    const user = await db.prepare(`
      SELECT name, nickname, interests, goals FROM users WHERE id = ?
    `).get(userId) as { name: string; nickname?: string; interests: string; goals?: string } | undefined

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get chat sessions with topics
    const sessions = await db.prepare(`
      SELECT session_goal, session_topic, message_count
      FROM chat_sessions
      WHERE user_id = ?
      ORDER BY started_at DESC
      LIMIT 50
    `).all(userId) as { session_goal: string | null; session_topic: string | null; message_count: number }[]

    // Get recent messages for deeper analysis
    const messages = await db.prepare(`
      SELECT content FROM chat_messages
      WHERE user_id = ? AND role = 'user'
      ORDER BY created_at DESC
      LIMIT 100
    `).all(userId) as { content: string }[]

    // Get check-in data
    const checkins = await db.prepare(`
      SELECT mood, ai_summary FROM daily_checkins
      WHERE user_id = ?
      ORDER BY checkin_date DESC
      LIMIT 30
    `).all(userId) as { mood: string | null; ai_summary: string | null }[]

    // Build context for Claude
    const sessionTopics = sessions
      .filter(s => s.session_topic)
      .map(s => `${s.session_goal}: ${s.session_topic}`)
      .slice(0, 20)
      .join('\n')

    const messageSnippets = messages
      .map(m => m.content.slice(0, 200))
      .slice(0, 30)
      .join('\n---\n')

    const moodData = checkins
      .filter(c => c.mood || c.ai_summary)
      .map(c => c.ai_summary || c.mood)
      .slice(0, 10)
      .join('\n')

    // If not enough data, return some starter themes
    if (sessions.length < 3 && messages.length < 5) {
      const starterThemes: Theme[] = [
        { name: 'Self-Discovery', emoji: '🔍', description: 'Exploring who you are and what matters to you', strength: 0.5 },
        { name: 'Relationships', emoji: '💕', description: 'Connections with friends, family, and others', strength: 0.5 },
        { name: 'Growth', emoji: '🌱', description: 'Learning, improving, and becoming your best self', strength: 0.5 },
      ]

      await db.prepare(`
        INSERT INTO theme_analysis (user_id, analysis_date, themes_json)
        VALUES (?, ?, ?)
        ON CONFLICT (user_id, analysis_date) DO UPDATE SET themes_json = ?
      `).run(userId, today, JSON.stringify(starterThemes), JSON.stringify(starterThemes))

      return NextResponse.json({
        themes: starterThemes,
        cached: false,
        isStarter: true,
      })
    }

    // Use Claude to analyze and extract themes
    const prompt = `You are analyzing a teen's chat history to identify their core personality themes - like the Islands of Personality from Inside Out.

User interests: ${user.interests}
${user.goals ? `User goals: ${user.goals}` : ''}

Recent session topics:
${sessionTopics || 'No sessions yet'}

Sample messages from the user:
${messageSnippets || 'No messages yet'}

Recent moods/reflections:
${moodData || 'No check-ins yet'}

Based on this data, identify 3-5 core themes that define this person's inner world. These should be:
- Specific to THIS person (not generic like "happiness")
- Named in a way a teen would relate to (e.g., "Creative Projects" not "Artistic Expression")
- Based on patterns you actually see in the data
- Each with a unique, fitting emoji

Examples of good themes: "Friendships", "School Stress", "Creative Projects", "Music & Vibes", "Future Dreams", "Family Stuff", "Gaming World", "Identity Questions"

Output as JSON array with exactly this format:
[
  {"name": "Theme Name", "emoji": "emoji", "description": "One sentence description", "strength": 0.8},
  ...
]

strength should be 0.0-1.0 based on how much this theme appears in the data.

Output ONLY the JSON array, nothing else.`

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    let themes: Theme[] = []

    const textContent = response.content.find(block => block.type === 'text')
    if (textContent && textContent.type === 'text') {
      try {
        themes = JSON.parse(textContent.text)
        // Validate and clean up
        themes = themes.slice(0, 5).map(t => ({
          name: String(t.name || 'Unknown').slice(0, 50),
          emoji: String(t.emoji || '🏝️').slice(0, 4),
          description: String(t.description || '').slice(0, 200),
          strength: Math.max(0, Math.min(1, Number(t.strength) || 0.5)),
        }))
      } catch {
        // Fallback if parsing fails
        themes = [
          { name: 'Self-Discovery', emoji: '🔍', description: 'Exploring who you are', strength: 0.5 },
          { name: 'Relationships', emoji: '💕', description: 'Connections with others', strength: 0.5 },
          { name: 'Growth', emoji: '🌱', description: 'Learning and improving', strength: 0.5 },
        ]
      }
    }

    // Cache the analysis
    await db.prepare(`
      INSERT INTO theme_analysis (user_id, analysis_date, themes_json)
      VALUES (?, ?, ?)
      ON CONFLICT (user_id, analysis_date) DO UPDATE SET themes_json = ?
    `).run(userId, today, JSON.stringify(themes), JSON.stringify(themes))

    return NextResponse.json({
      themes,
      cached: false,
    })
  } catch (error) {
    console.error('Error analyzing themes:', error)
    return NextResponse.json({ error: 'Failed to analyze themes' }, { status: 500 })
  }
}
