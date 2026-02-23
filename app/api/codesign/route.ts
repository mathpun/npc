import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// POST - Save interview/feedback signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userId, signupType, name, age, interests } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if email already signed up
    const existing = await db.prepare(`
      SELECT id FROM codesign_signups WHERE email = ? AND signup_type = ?
    `).get(email, signupType || 'interview')

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'already_signed_up',
        alreadySignedUp: true 
      })
    }

    // Save signup
    await db.prepare(`
      INSERT INTO codesign_signups (email, user_id, signup_type, name, age, interests)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      email,
      userId || null,
      signupType || 'interview',
      name || null,
      age || null,
      interests || null
    )

    return NextResponse.json({ 
      success: true,
      message: 'signed_up'
    })
  } catch (error) {
    console.error('Error saving codesign signup:', error)
    return NextResponse.json({ error: 'Failed to save signup' }, { status: 500 })
  }
}

// GET - Check if user already signed up (optional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    const existing = await db.prepare(`
      SELECT id, signup_type, created_at FROM codesign_signups WHERE email = ?
    `).get(email)

    return NextResponse.json({
      signedUp: !!existing,
      signup: existing || null
    })
  } catch (error) {
    console.error('Error checking signup:', error)
    return NextResponse.json({ error: 'Failed to check signup' }, { status: 500 })
  }
}
