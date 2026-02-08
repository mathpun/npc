import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, currentPassword, newPassword } = body

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    // Get user
    const user = await db.prepare(`
      SELECT id, password_hash FROM users WHERE id = ?
    `).get(userId) as { id: string; password_hash: string | null } | undefined

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    if (!user.password_hash) {
      return NextResponse.json({ error: 'No password set for this account' }, { status: 400 })
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash)
    if (!validPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // Hash new password and update
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    await db.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `).run(newPasswordHash, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
