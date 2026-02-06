import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST - login with name and password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, password } = body

    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password are required' }, { status: 400 })
    }

    // Find user by name (case-insensitive)
    const user = await db.prepare(`
      SELECT * FROM users
      WHERE LOWER(name) = LOWER(?)
      ORDER BY last_active DESC
      LIMIT 1
    `).get(name.trim()) as any

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user has a password, verify it
    if (user.password_hash) {
      const isValid = await bcrypt.compare(password, user.password_hash)
      if (!isValid) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
      }
    }

    // Update last_active
    await db.prepare(`
      UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?
    `).run(user.id)

    // Log the login activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'login', ?)
    `).run(user.id, JSON.stringify({ timestamp: new Date().toISOString() }))

    // Don't return password_hash to client
    const { password_hash, ...safeUser } = user

    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// GET - legacy login by name only (for backwards compatibility, will be removed)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  try {
    // Find user by name (case-insensitive)
    const user = await db.prepare(`
      SELECT * FROM users
      WHERE LOWER(name) = LOWER(?)
      ORDER BY last_active DESC
      LIMIT 1
    `).get(name.trim()) as any

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If user has a password, require POST method
    if (user.password_hash) {
      return NextResponse.json({ error: 'Password required - please use the login form' }, { status: 401 })
    }

    // Update last_active
    await db.prepare(`
      UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?
    `).run(user.id)

    // Log the login activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'login', ?)
    `).run(user.id, JSON.stringify({ timestamp: new Date().toISOString() }))

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
