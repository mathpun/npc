import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// Gratitude prompts for journaling
const GRATITUDE_PROMPTS = [
  { id: 'grateful-today', prompt: "What are 3 things you're grateful for today?", emoji: '🙏' },
  { id: 'made-smile', prompt: "What made you smile today?", emoji: '😊' },
  { id: 'proud-of', prompt: "What's something you're proud of recently?", emoji: '🌟' },
  { id: 'kind-person', prompt: "Who was kind to you lately? How did it feel?", emoji: '💝' },
  { id: 'simple-joy', prompt: "What simple thing brought you joy today?", emoji: '✨' },
  { id: 'learned', prompt: "What's something new you learned or noticed?", emoji: '💡' },
  { id: 'looking-forward', prompt: "What are you looking forward to?", emoji: '🔮' },
  { id: 'self-care', prompt: "How did you take care of yourself today?", emoji: '🧘' },
  { id: 'challenge-overcome', prompt: "What challenge did you handle well?", emoji: '💪' },
  { id: 'nature', prompt: "What's something beautiful you saw in nature?", emoji: '🌿' },
  { id: 'friendship', prompt: "What do you appreciate about a friend?", emoji: '👯' },
  { id: 'body-thanks', prompt: "What can you thank your body for today?", emoji: '🫀' },
  { id: 'comfort', prompt: "What's something that brings you comfort?", emoji: '🧸' },
  { id: 'music-art', prompt: "What song or art made you feel something?", emoji: '🎵' },
  { id: 'growth', prompt: "How have you grown as a person lately?", emoji: '🌱' },
]

// GET - Fetch journal entries and get a prompt
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const action = searchParams.get('action')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    // Get a random prompt
    if (action === 'prompt') {
      const randomPrompt = GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)]
      return NextResponse.json({ prompt: randomPrompt })
    }

    // Get all prompts
    if (action === 'prompts') {
      return NextResponse.json({ prompts: GRATITUDE_PROMPTS })
    }

    // Get recent entries
    const entries = await db.prepare(`
      SELECT id, entry_type, prompt_id, content, voice_url, mood, created_at
      FROM journal_entries
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 30
    `).all(userId)

    // Get streak info
    const streakInfo = await calculateStreak(userId)

    return NextResponse.json({
      entries,
      streak: streakInfo,
      prompts: GRATITUDE_PROMPTS,
    })
  } catch (error) {
    console.error('Error fetching journal:', error)
    return NextResponse.json({ error: 'Failed to fetch journal' }, { status: 500 })
  }
}

// POST - Create new journal entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, entryType, promptId, content, voiceUrl, mood } = body

    if (!userId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert the entry
    const result = await db.prepare(`
      INSERT INTO journal_entries (user_id, entry_type, prompt_id, content, voice_url, mood)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING id, created_at
    `).get(userId, entryType || 'free', promptId || null, content, voiceUrl || null, mood || null) as { id: number; created_at: string }

    // Get updated streak
    const streakInfo = await calculateStreak(userId)

    // Get encouraging message
    const message = getEncouragingMessage(streakInfo.currentStreak)

    return NextResponse.json({
      success: true,
      entryId: result.id,
      streak: streakInfo,
      message,
    })
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
  }
}

async function calculateStreak(userId: string) {
  // Get dates of entries in last 30 days
  const entries = await db.prepare(`
    SELECT DISTINCT DATE(created_at) as entry_date
    FROM journal_entries
    WHERE user_id = ?
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY entry_date DESC
  `).all(userId) as { entry_date: string }[]

  if (entries.length === 0) {
    return { currentStreak: 0, totalEntries: 0 }
  }

  // Count total entries
  const totalResult = await db.prepare(`
    SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?
  `).get(userId) as { count: number }

  // Calculate streak
  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Check if journaled today or yesterday
  const dates = entries.map(e => e.entry_date.split('T')[0])

  if (dates.includes(today) || dates.includes(yesterday)) {
    streak = 1
    let checkDate = dates.includes(today) ? today : yesterday

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0]
      if (dates.includes(prevDate)) {
        streak++
        checkDate = prevDate
      } else {
        break
      }
    }
  }

  return {
    currentStreak: streak,
    totalEntries: totalResult.count,
    journaledToday: dates.includes(today),
  }
}

function getEncouragingMessage(streak: number): string {
  if (streak >= 30) return "30 day streak! You're a journaling legend! 📖✨"
  if (streak >= 14) return "Two weeks strong! Your future self thanks you 🙌"
  if (streak >= 7) return "One week streak! You're building a beautiful habit 🌟"
  if (streak >= 3) return `${streak} days in a row! Keep going! 🔥`
  if (streak >= 1) return "Great job journaling today! ✨"
  return "Welcome to your journal! 📓"
}
