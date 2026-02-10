import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET completed challenges for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  try {
    const challenges = await db.prepare(`
      SELECT challenge_id, completed_at, notes FROM user_challenges WHERE user_id = ?
    `).all(userId)

    return NextResponse.json({ challenges })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST mark a challenge as complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, challengeId, notes } = body

    if (!userId || !challengeId) {
      return NextResponse.json({ error: 'userId and challengeId required' }, { status: 400 })
    }

    await db.prepare(`
      INSERT INTO user_challenges (user_id, challenge_id, notes)
      VALUES (?, ?, ?)
      ON CONFLICT (user_id, challenge_id) DO NOTHING
    `).run(userId, challengeId, notes || null)

    // Log the activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'challenge_completed', ?)
    `).run(userId, JSON.stringify({ challengeId }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing challenge:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// DELETE uncomplete a challenge
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const challengeId = searchParams.get('challengeId')

  if (!userId || !challengeId) {
    return NextResponse.json({ error: 'userId and challengeId required' }, { status: 400 })
  }

  try {
    await db.prepare(`
      DELETE FROM user_challenges WHERE user_id = ? AND challenge_id = ?
    `).run(userId, challengeId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error uncompleting challenge:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
