import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// GET all users or single user by id
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('id')

  try {
    if (userId) {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json(user)
    }

    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, age, interests, goals } = body

    if (!name || !age || !interests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = uuidv4()
    const interestsStr = Array.isArray(interests) ? interests.join(', ') : interests

    db.prepare(`
      INSERT INTO users (id, name, age, interests, goals)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, age, interestsStr, goals || null)

    // Log the activity
    db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'signup', ?)
    `).run(id, JSON.stringify({ name, age }))

    // Create first milestone
    db.prepare(`
      INSERT INTO milestones (user_id, milestone_type, title, description, color)
      VALUES (?, 'journey_start', 'Started Journey', 'Welcome to your growth journey!', '#90EE90')
    `).run(id)

    // Grant first achievement
    db.prepare(`
      INSERT OR IGNORE INTO achievements (user_id, achievement_key)
      VALUES (?, 'first_steps')
    `).run(id)

    return NextResponse.json({ id, name, age, interests: interestsStr, goals })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, age, interests, goals } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const interestsStr = Array.isArray(interests) ? interests.join(', ') : interests

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          age = COALESCE(?, age),
          interests = COALESCE(?, interests),
          goals = COALESCE(?, goals),
          last_active = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, age, interestsStr, goals, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
