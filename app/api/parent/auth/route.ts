import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import crypto from 'crypto'
import { sendParentLoginEmail } from '@/lib/email'

// POST - Request magic link (generates token, stores in DB)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

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
      SELECT pc.id, pc.user_id, u.name, u.nickname
      FROM parent_connections pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.parent_email = ? AND pc.connection_status = 'active'
    `).all(normalizedEmail)

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        error: 'No connected teens found for this email. Ask your teen to add you first!'
      }, { status: 404 })
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex')

    // Set expiry to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Store the token
    await db.prepare(`
      INSERT INTO parent_auth_tokens (parent_email, token, expires_at)
      VALUES (?, ?, ?)
    `).run(normalizedEmail, token, expiresAt.toISOString())

    const loginUrl = `/parent?token=${token}`

    // Get teen names for the email
    const teenNames = (connections as { name: string; nickname?: string }[]).map(
      (c) => c.nickname || c.name
    )

    // Send the login email
    const emailResult = await sendParentLoginEmail({
      parentEmail: normalizedEmail,
      loginUrl,
      teenNames,
    })

    if (!emailResult.success) {
      console.error('Failed to send parent login email:', emailResult.error)
      // Still return success since token was created - they can request again
    }

    return NextResponse.json({
      success: true,
      message: 'Login link sent! Check your email.',
      // Include token in dev mode for testing
      ...(process.env.NODE_ENV === 'development' && { token, loginUrl })
    })
  } catch (error) {
    console.error('Error generating auth token:', error)
    return NextResponse.json({ error: 'Failed to send login link' }, { status: 500 })
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
