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
  // Deep details for rich island generation
  keyMemories?: string[]      // Specific moments/conversations
  symbols?: string[]          // Objects that represent this theme
  emotions?: string[]         // Feelings associated
  people?: string[]           // People connected to this theme
  colors?: string[]           // Color palette for this island
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

    // Use Claude to analyze and extract themes - DEEP analysis
    const prompt = `You are creating detailed "Islands of Personality" (like Pixar's Inside Out) for a specific person based on their chat history. These islands need to be DEEPLY PERSONAL and SPECIFIC - not generic.

=== USER DATA ===
Name: ${user.name}${user.nickname ? ` (${user.nickname})` : ''}
Interests: ${user.interests}
${user.goals ? `Goals: ${user.goals}` : ''}

=== CHAT SESSION TOPICS ===
${sessionTopics || 'No sessions yet'}

=== ACTUAL MESSAGES FROM USER ===
${messageSnippets || 'No messages yet'}

=== MOODS & REFLECTIONS ===
${moodData || 'No check-ins yet'}

=== YOUR TASK ===
Identify 4-5 SPECIFIC personality islands that define THIS person's inner world.

CRITICAL: Be SPECIFIC, not generic!
- BAD: "Relationships" (too generic)
- GOOD: "Building NPC" (their specific startup)
- GOOD: "Music Production Dreams" (their specific passion)
- GOOD: "College Anxiety" (their specific worry)

For each island, include:
1. name: A specific, personal name (not generic categories)
2. emoji: Perfect emoji for this theme
3. description: 2-3 sentences about what this represents for them
4. strength: 0.0-1.0 how prominent this is
5. keyMemories: 2-3 specific moments/topics from their chats
6. symbols: 4-6 physical objects that could appear on this island (be creative and specific!)
7. emotions: 2-3 feelings associated with this theme
8. people: Any people mentioned connected to this (or "self" if internal)
9. colors: 2-3 colors that represent this theme's mood

Example of GOOD detailed island:
{
  "name": "Startup Dreams",
  "emoji": "🚀",
  "description": "The burning passion to build something that helps people. Late nights coding, user interviews, the thrill of seeing it work.",
  "strength": 0.95,
  "keyMemories": ["discussing user feedback", "planning new features", "worrying about growth"],
  "symbols": ["glowing laptop", "rocket launchpad", "whiteboard with diagrams", "coffee cups", "user feedback notes", "celebration confetti"],
  "emotions": ["excited", "anxious", "determined"],
  "people": ["co-founders", "users", "mentors"],
  "colors": ["electric blue", "gold", "purple"]
}

Output ONLY a JSON array of 4-5 islands. No explanation, just valid JSON.`

    const response = await getAnthropicClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000, // More tokens for detailed islands
      messages: [{ role: 'user', content: prompt }],
    })

    let themes: Theme[] = []

    const textContent = response.content.find(block => block.type === 'text')
    if (textContent && textContent.type === 'text') {
      try {
        // Try to extract JSON from the response
        let jsonText = textContent.text.trim()
        // Handle markdown code blocks if present
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
        }
        themes = JSON.parse(jsonText)
        // Validate and clean up while preserving new fields
        themes = themes.slice(0, 5).map(t => ({
          name: String(t.name || 'Unknown').slice(0, 50),
          emoji: String(t.emoji || '🏝️').slice(0, 4),
          description: String(t.description || '').slice(0, 500),
          strength: Math.max(0, Math.min(1, Number(t.strength) || 0.5)),
          keyMemories: Array.isArray(t.keyMemories) ? t.keyMemories.slice(0, 5) : [],
          symbols: Array.isArray(t.symbols) ? t.symbols.slice(0, 8) : [],
          emotions: Array.isArray(t.emotions) ? t.emotions.slice(0, 4) : [],
          people: Array.isArray(t.people) ? t.people.slice(0, 5) : [],
          colors: Array.isArray(t.colors) ? t.colors.slice(0, 4) : [],
        }))
      } catch (parseError) {
        console.error('Failed to parse themes JSON:', parseError, textContent.text)
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
