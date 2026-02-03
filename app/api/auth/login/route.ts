import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - login by name
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  try {
    // Find user by name (case-insensitive)
    const user = db.prepare(`
      SELECT * FROM users
      WHERE LOWER(name) = LOWER(?)
      ORDER BY last_active DESC
      LIMIT 1
    `).get(name.trim())

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update last_active
    db.prepare(`
      UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?
    `).run((user as any).id)

    // Log the login activity
    db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'login', ?)
    `).run((user as any).id, JSON.stringify({ timestamp: new Date().toISOString() }))

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
