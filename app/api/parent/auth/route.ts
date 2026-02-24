import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { sendParentLoginEmail } from '@/lib/email'

// POST - Login with password or request magic link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, setPassword } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if this email has any connected teens
    const connections = await db.prepare(`
      SELECT pc.id, pc.user_id, pc.password_hash, u.name, u.nickname
      FROM parent_connections pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.parent_email = ? AND pc.connection_status = 'active'
    `).all(normalizedEmail) as { id: number; user_id: string; password_hash: string | null; name: string; nickname?: string }[]

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        error: 'No connected teens found for this email. Ask your teen to add you first!'
      }, { status: 404 })
    }

    const firstConnection = connections[0]

    // If setting a new password
    if (setPassword && password) {
      if (password.length < 4) {
        return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      // Update all connections for this parent email with the password
      await db.prepare(`
        UPDATE parent_connections
        SET password_hash = ?
        WHERE parent_email = ? AND connection_status = 'active'
      `).run(hashedPassword, normalizedEmail)

      return NextResponse.json({
        success: true,
        parentEmail: normalizedEmail,
        connectedTeens: connections.map(c => ({ id: c.id, user_id: c.user_id, name: c.name, nickname: c.nickname }))
      })
    }

    // If password provided, try to log in with it
    if (password) {
      if (!firstConnection.password_hash) {
        // No password set yet - prompt to create one
        return NextResponse.json({ needsPassword: true })
      }

      const isValid = await bcrypt.compare(password, firstConnection.password_hash)
      if (!isValid) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
      }

      // Password correct - return success
      return NextResponse.json({
        success: true,
        parentEmail: normalizedEmail,
        connectedTeens: connections.map(c => ({ id: c.id, user_id: c.user_id, name: c.name, nickname: c.nickname }))
      })
    }

    // No password provided - check if they have one set
    if (firstConnection.password_hash) {
      // They have a password, prompt for it
      return NextResponse.json({ hasPassword: true })
    }

    // No password set - prompt to create one
    return NextResponse.json({ needsPassword: true })
  } catch (error) {
    console.error('Error in parent auth:', error)
    return NextResponse.json({ error: 'Failed to process login' }, { status: 500 })
  }
}

// GET - Verify token and return parent session
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  try {
    // Look up the token
    const tokenRecord = await db.prepare(`
      SELECT id, parent_email, expires_at, used_at
      FROM parent_auth_tokens
      WHERE token = ?
    `).get(token)

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token has expired. Please request a new login link.' }, { status: 401 })
    }

    // Mark token as used (but allow re-use within the expiry window for better UX)
    if (!tokenRecord.used_at) {
      await db.prepare(`
        UPDATE parent_auth_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(tokenRecord.id)
    }

    // Get connected teens for this parent
    const connections = await db.prepare(`
      SELECT pc.id, pc.user_id, u.name, u.nickname, pc.created_at
      FROM parent_connections pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.parent_email = ? AND pc.connection_status = 'active'
      ORDER BY pc.created_at DESC
    `).all(tokenRecord.parent_email)

    return NextResponse.json({
      success: true,
      parentEmail: tokenRecord.parent_email,
      connectedTeens: connections
    })
  } catch (error) {
    console.error('Error verifying token:', error)
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 })
  }
}
