import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { sendParentReportEmail, ParentReportEmailData } from '@/lib/email'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get a specific report
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const report = await db.prepare(`
      SELECT pr.*, pc.parent_email, pc.parent_name
      FROM parent_reports pr
      LEFT JOIN parent_connections pc ON pr.parent_connection_id = pc.id
      WHERE pr.id = ? AND pr.user_id = ?
    `).get(id, userId)

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}

// PATCH - Update report (teen edits) or change status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId, action, updates } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Verify ownership
    const report = await db.prepare(`
      SELECT * FROM parent_reports WHERE id = ? AND user_id = ?
    `).get(id, userId) as { status: string } | undefined

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Handle different actions
    if (action === 'approve') {
      if (report.status !== 'draft') {
        return NextResponse.json({ error: 'Report already processed' }, { status: 400 })
      }

      // Fetch full report with parent info to send email immediately
      const fullReport = await db.prepare(`
        SELECT pr.*, pc.parent_email, pc.parent_name, u.name as teen_name
        FROM parent_reports pr
        LEFT JOIN parent_connections pc ON pr.parent_connection_id = pc.id
        JOIN users u ON pr.user_id = u.id
        WHERE pr.id = ?
      `).get(id) as {
        week_start: string
        week_end: string
        themes_discussed: string
        mood_summary: string
        growth_highlights: string
        teen_note: string
        engagement_stats: string
        parent_email: string
        parent_name: string
        teen_name: string
      } | undefined

      if (!fullReport?.parent_email) {
        // No parent email - just approve without sending
        await db.prepare(`
          UPDATE parent_reports
          SET status = 'approved', approved_at = CURRENT_TIMESTAMP, teen_reviewed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(id)
        return NextResponse.json({ success: true, message: 'Report approved! (No parent email to send to)' })
      }

      // Parse engagement stats
      let engagementStats = undefined
      if (fullReport.engagement_stats) {
        try {
          engagementStats = typeof fullReport.engagement_stats === 'string'
            ? JSON.parse(fullReport.engagement_stats)
            : fullReport.engagement_stats
        } catch (e) {
          console.error('[PARENT REPORT] Failed to parse engagement stats:', e)
        }
      }

      // Send email immediately on approve
      try {
        const emailData: ParentReportEmailData = {
          parentName: fullReport.parent_name || 'Parent',
          parentEmail: fullReport.parent_email,
          teenName: fullReport.teen_name || 'Your teen',
          weekStart: fullReport.week_start,
          weekEnd: fullReport.week_end,
          themesDiscussed: fullReport.themes_discussed || '',
          moodSummary: fullReport.mood_summary || '',
          growthHighlights: fullReport.growth_highlights || '',
          teenNote: fullReport.teen_note,
          engagementStats,
        }

        console.log('[PARENT REPORT] Sending email to:', fullReport.parent_email)
        const emailResult = await sendParentReportEmail(emailData)

        if (emailResult.success) {
          // Mark as sent
          await db.prepare(`
            UPDATE parent_reports
            SET status = 'sent', approved_at = CURRENT_TIMESTAMP, teen_reviewed_at = CURRENT_TIMESTAMP, sent_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(id)
          return NextResponse.json({ success: true, message: 'Report approved and sent to parent!' })
        } else {
          console.error('[PARENT REPORT] Email failed:', emailResult.error)
          // Still approve even if email fails
          await db.prepare(`
            UPDATE parent_reports
            SET status = 'approved', approved_at = CURRENT_TIMESTAMP, teen_reviewed_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(id)
          return NextResponse.json({ success: true, message: 'Report approved but email failed: ' + emailResult.error })
        }
      } catch (emailError) {
        console.error('[PARENT REPORT] Email error:', emailError)
        // Still approve even if email fails
        await db.prepare(`
          UPDATE parent_reports
          SET status = 'approved', approved_at = CURRENT_TIMESTAMP, teen_reviewed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(id)
        return NextResponse.json({ success: true, message: 'Report approved but email failed to send' })
      }
    }

    if (action === 'reject') {
      await db.prepare(`
        UPDATE parent_reports
        SET status = 'rejected', teen_reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id)

      return NextResponse.json({ success: true, message: 'Report rejected' })
    }

    if (action === 'send') {
      if (report.status !== 'approved') {
        return NextResponse.json({ error: 'Report must be approved before sending' }, { status: 400 })
      }

      console.log('[PARENT REPORT] Send action for report:', id)

      // Fetch full report with parent info
      const fullReport = await db.prepare(`
        SELECT pr.*, pc.parent_email, pc.parent_name, u.name as teen_name
        FROM parent_reports pr
        LEFT JOIN parent_connections pc ON pr.parent_connection_id = pc.id
        JOIN users u ON pr.user_id = u.id
        WHERE pr.id = ?
      `).get(id) as {
        week_start: string
        week_end: string
        themes_discussed: string
        mood_summary: string
        growth_highlights: string
        teen_note: string
        engagement_stats: string
        parent_email: string
        parent_name: string
        teen_name: string
      } | undefined

      console.log('[PARENT REPORT] Full report data:', JSON.stringify(fullReport, null, 2))

      if (!fullReport?.parent_email) {
        console.error('[PARENT REPORT] No parent email found for report:', id)
        return NextResponse.json({ error: 'No parent email found. Make sure you have a parent connected.' }, { status: 400 })
      }

      // Parse engagement stats if they exist
      let engagementStats = undefined
      if (fullReport.engagement_stats) {
        try {
          engagementStats = typeof fullReport.engagement_stats === 'string'
            ? JSON.parse(fullReport.engagement_stats)
            : fullReport.engagement_stats
        } catch (e) {
          console.error('[PARENT REPORT] Failed to parse engagement stats:', e)
        }
      }

      // Send the email
      const emailData: ParentReportEmailData = {
        parentName: fullReport.parent_name || 'Parent',
        parentEmail: fullReport.parent_email,
        teenName: fullReport.teen_name || 'Your teen',
        weekStart: fullReport.week_start,
        weekEnd: fullReport.week_end,
        themesDiscussed: fullReport.themes_discussed || '',
        moodSummary: fullReport.mood_summary || '',
        growthHighlights: fullReport.growth_highlights || '',
        teenNote: fullReport.teen_note,
        engagementStats,
      }

      console.log('[PARENT REPORT] Sending email to:', fullReport.parent_email)
      const emailResult = await sendParentReportEmail(emailData)

      if (!emailResult.success) {
        console.error('[PARENT REPORT] Failed to send email:', emailResult.error)
        return NextResponse.json({ error: 'Failed to send email: ' + (emailResult.error || 'Unknown error') }, { status: 500 })
      }

      // Mark as sent
      await db.prepare(`
        UPDATE parent_reports
        SET status = 'sent', sent_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id)

      console.log('[PARENT REPORT] Successfully sent report:', id)
      return NextResponse.json({ success: true, message: 'Report sent to parent!' })
    }

    // Handle content updates (teen editing before approval)
    if (updates && report.status === 'draft') {
      const allowedFields = ['themes_discussed', 'mood_summary', 'growth_highlights', 'teen_note']
      const updateParts: string[] = []
      const updateValues: unknown[] = []

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          updateParts.push(`${field} = ?`)
          updateValues.push(updates[field])
        }
      }

      if (updates) {
        updateParts.push('teen_edits = ?')
        updateValues.push(JSON.stringify(updates))
      }

      if (updateParts.length > 0) {
        updateValues.push(id)
        await db.prepare(`
          UPDATE parent_reports
          SET ${updateParts.join(', ')}, teen_reviewed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(...updateValues)
      }

      return NextResponse.json({ success: true, message: 'Report updated' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
}

// DELETE - Delete a draft report
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    // Only allow deleting draft reports
    const result = await db.prepare(`
      DELETE FROM parent_reports
      WHERE id = ? AND user_id = ? AND status = 'draft'
    `).run(id, userId)

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Report not found or cannot be deleted' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}
