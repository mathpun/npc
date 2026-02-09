import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// POST - Fix user data (remove trailing spaces, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newName } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    if (newName) {
      // Update username
      await db.prepare(`
        UPDATE users SET name = $1, nickname = $1 WHERE id = $2
      `).run(newName.trim(), userId)

      return NextResponse.json({ success: true, message: `Username updated to "${newName.trim()}"` })
    }

    return NextResponse.json({ error: 'Nothing to fix' }, { status: 400 })
  } catch (error) {
    console.error('Error fixing user:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
