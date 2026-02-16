import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login?error=NoSession', process.env.NEXTAUTH_URL || 'http://localhost:3001'))
  }

  const { email, googleId, userType, isNewUser } = session.user

  // If this is a new user, redirect to onboarding
  if (isNewUser) {
    const params = new URLSearchParams({
      google: 'true',
      email: email || '',
      name: session.user.name || '',
    })
    return NextResponse.redirect(new URL(`/onboarding?${params}`, process.env.NEXTAUTH_URL || 'http://localhost:3001'))
  }

  // If this is a parent, redirect to parent dashboard
  if (userType === 'parent') {
    return NextResponse.redirect(new URL('/parent?google=true', process.env.NEXTAUTH_URL || 'http://localhost:3001'))
  }

  // If this is an existing teen user, redirect to dashboard
  // The client-side will need to handle setting up localStorage from the session
  if (userType === 'teen') {
    return NextResponse.redirect(new URL('/dashboard?google=true', process.env.NEXTAUTH_URL || 'http://localhost:3001'))
  }

  // Fallback - check database again
  try {
    const user = await db.prepare(
      'SELECT * FROM users WHERE google_id = ? OR email = ?'
    ).get(googleId, email)

    if (user) {
      return NextResponse.redirect(new URL('/dashboard?google=true', process.env.NEXTAUTH_URL || 'http://localhost:3001'))
    }

    // Check parent connections
    const parentConnection = await db.prepare(
      'SELECT * FROM parent_connections WHERE parent_email = ? AND connection_status = ?'
    ).get(email, 'verified')

    if (parentConnection) {
      return NextResponse.redirect(new URL('/parent?google=true', process.env.NEXTAUTH_URL || 'http://localhost:3001'))
    }

    // New user, redirect to onboarding
    const params = new URLSearchParams({
      google: 'true',
      email: email || '',
      name: session.user.name || '',
    })
    return NextResponse.redirect(new URL(`/onboarding?${params}`, process.env.NEXTAUTH_URL || 'http://localhost:3001'))
  } catch (error) {
    console.error('Error in google-callback:', error)
    return NextResponse.redirect(new URL('/login?error=DatabaseError', process.env.NEXTAUTH_URL || 'http://localhost:3001'))
  }
}
