import { NextRequest, NextResponse } from 'next/server'
import { sendParentReportEmail } from '@/lib/email'

// Simple test endpoint - remove after testing!
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const result = await sendParentReportEmail({
      parentName: 'Test Parent',
      parentEmail: email,
      teenName: 'Test Teen',
      weekStart: '2026-02-10',
      weekEnd: '2026-02-16',
      themesDiscussed: 'This is a test email to verify the email system is working correctly.',
      moodSummary: 'Everything is looking good! The email system appears to be functioning.',
      growthHighlights: 'Successfully configured Resend for parent report emails.',
      teenNote: 'Hi! This is just a test message.',
      engagementStats: {
        chatCount: 12,
        journalCount: 5,
        checkinCount: 7,
      },
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: `Test email sent to ${email}` })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}
