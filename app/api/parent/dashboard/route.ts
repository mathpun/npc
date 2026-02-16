import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch all sent reports for a parent email
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parentEmail = searchParams.get('email')

  if (!parentEmail) {
    return NextResponse.json({ error: 'Parent email is required' }, { status: 400 })
  }

  const normalizedEmail = parentEmail.toLowerCase().trim()

  try {
    // Get connected teens
    const connections = await db.prepare(`
      SELECT pc.id, pc.user_id, u.name, u.nickname, pc.parent_name, pc.created_at
      FROM parent_connections pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.parent_email = ? AND pc.connection_status = 'active'
      ORDER BY pc.created_at DESC
    `).all(normalizedEmail)

    if (!connections || connections.length === 0) {
      return NextResponse.json({
        connectedTeens: [],
        reports: []
      })
    }

    // Get all user IDs for this parent's connected teens
    const userIds = connections.map((c: { user_id: string }) => c.user_id)

    // Fetch all sent reports for these teens
    // Using a query with IN clause via string building (safe because userIds are from our DB)
    const placeholders = userIds.map((_: string, i: number) => `$${i + 1}`).join(', ')
    const reports = await db.prepare(`
      SELECT
        pr.id,
        pr.user_id,
        pr.report_type,
        pr.week_start,
        pr.week_end,
        pr.themes_discussed,
        pr.mood_summary,
        pr.growth_highlights,
        pr.engagement_stats,
        pr.teen_note,
        pr.status,
        pr.generated_at,
        pr.approved_at,
        pr.sent_at,
        u.name as teen_name,
        u.nickname as teen_nickname
      FROM parent_reports pr
      JOIN users u ON pr.user_id = u.id
      JOIN parent_connections pc ON pr.user_id = pc.user_id AND pc.parent_email = $${userIds.length + 1}
      WHERE pr.user_id IN (${placeholders})
        AND pr.status = 'sent'
      ORDER BY pr.sent_at DESC
    `).all(...userIds, normalizedEmail)

    return NextResponse.json({
      connectedTeens: connections.map((c: { id: number; user_id: string; name: string; nickname: string | null; parent_name: string | null; created_at: string }) => ({
        id: c.id,
        userId: c.user_id,
        name: c.nickname || c.name,
        connectedAt: c.created_at
      })),
      reports: reports || []
    })
  } catch (error) {
    console.error('Error fetching parent dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
