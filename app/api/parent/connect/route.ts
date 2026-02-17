import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Get parent connections for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const connections = await db.prepare(`
      SELECT id, parent_email, parent_name, connection_status, verified_at, created_at
      FROM parent_connections
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId)

    return NextResponse.json({ connections })
  } catch (error) {
    console.error('Error fetching parent connections:', error)
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 })
  }
}

// POST - Add a new parent connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, parentEmail, parentName } = body

    if (!userId || !parentEmail) {
      return NextResponse.json({ error: 'Missing userId or parentEmail' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(parentEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Generate a verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Insert the connection
    await db.prepare(`
      INSERT INTO parent_connections (user_id, parent_email, parent_name, verification_code)
      VALUES (?, ?, ?, ?)
      ON CONFLICT (user_id, parent_email) DO UPDATE SET
        parent_name = EXCLUDED.parent_name,
        verification_code = EXCLUDED.verification_code,
        connection_status = 'pending'
    `).run(userId, parentEmail.toLowerCase(), parentName || null, verificationCode)

    // Get the created/updated connection
    const connection = await db.prepare(`
      SELECT id, parent_email, parent_name, connection_status, created_at
      FROM parent_connections
      WHERE user_id = ? AND parent_email = ?
    `).get(userId, parentEmail.toLowerCase())

    // TODO: Send verification email to parent
    // For now, we'll auto-verify for testing
    await db.prepare(`
      UPDATE parent_connections
      SET connection_status = 'active', verified_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND parent_email = ?
    `).run(userId, parentEmail.toLowerCase())

    return NextResponse.json({
      success: true,
      connection,
      message: 'Parent connection added successfully'
    })
  } catch (error) {
    console.error('Error adding parent connection:', error)
    return NextResponse.json({ error: 'Failed to add connection' }, { status: 500 })
  }
}

// DELETE - Remove a parent connection
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const connectionIdStr = searchParams.get('connectionId')
  const userId = searchParams.get('userId')

  console.log('[PARENT CONNECT] DELETE request:', { connectionIdStr, userId })

  if (!connectionIdStr || !userId) {
    return NextResponse.json({ error: 'Missing connectionId or userId' }, { status: 400 })
  }

  const connectionId = parseInt(connectionIdStr, 10)
  if (isNaN(connectionId)) {
    return NextResponse.json({ error: 'Invalid connectionId' }, { status: 400 })
  }

  try {
    // Verify ownership before deleting
    const connection = await db.prepare(`
      SELECT id FROM parent_connections WHERE id = ? AND user_id = ?
    `).get(connectionId, userId)

    console.log('[PARENT CONNECT] Found connection:', connection)

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    // First, unlink any reports that reference this connection
    await db.prepare(`
      UPDATE parent_reports SET parent_connection_id = NULL WHERE parent_connection_id = ?
    `).run(connectionId)

    // Now delete the connection
    const result = await db.prepare(`
      DELETE FROM parent_connections WHERE id = ? AND user_id = ?
    `).run(connectionId, userId)

    console.log('[PARENT CONNECT] Delete result:', result)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting parent connection:', error)
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 })
  }
}
