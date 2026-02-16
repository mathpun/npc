import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

// GET all users or single user by id
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('id')

  try {
    if (userId) {
      const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json(user)
    }

    const users = await db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nickname, age, pronouns, interests, goals, password, email, googleId, authProvider } = body

    if (!name || !age || !interests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Password required unless using Google auth
    const isGoogleAuth = authProvider === 'google' || googleId
    if (!isGoogleAuth && (!password || password.length < 4)) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await db.prepare(`
      SELECT id FROM users WHERE LOWER(name) = LOWER(?)
    `).get(name.trim())

    if (existingUser) {
      return NextResponse.json({ error: 'This name is already taken' }, { status: 400 })
    }

    // Check if Google ID already exists (if provided)
    if (googleId) {
      const existingGoogleUser = await db.prepare(`
        SELECT id FROM users WHERE google_id = ?
      `).get(googleId)

      if (existingGoogleUser) {
        return NextResponse.json({ error: 'This Google account is already registered' }, { status: 400 })
      }
    }

    const id = uuidv4()
    const interestsStr = Array.isArray(interests) ? interests.join(', ') : interests
    const displayName = nickname || name // default to username if no nickname

    // Hash the password (only if provided)
    const passwordHash = password ? await bcrypt.hash(password, 10) : null

    await db.prepare(`
      INSERT INTO users (id, name, nickname, age, pronouns, interests, goals, password_hash, email, google_id, auth_provider)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      displayName,
      age,
      pronouns || null,
      interestsStr,
      goals || null,
      passwordHash,
      email || null,
      googleId || null,
      authProvider || 'password'
    )

    // Log the activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'signup', ?)
    `).run(id, JSON.stringify({ name, nickname: displayName, age, authProvider: authProvider || 'password' }))

    // Create first milestone
    await db.prepare(`
      INSERT INTO milestones (user_id, milestone_type, title, description, color)
      VALUES (?, 'journey_start', 'Started Journey', 'Welcome to your growth journey!', '#90EE90')
    `).run(id)

    // Grant first achievement
    await db.prepare(`
      INSERT INTO achievements (user_id, achievement_key)
      VALUES (?, 'first_steps')
      ON CONFLICT (user_id, achievement_key) DO NOTHING
    `).run(id)

    return NextResponse.json({ id, name, nickname: displayName, age, interests: interestsStr, goals })
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

    await db.prepare(`
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
