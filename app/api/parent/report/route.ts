import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - List all parent reports for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    const reports = await db.prepare(`
      SELECT pr.*, pc.parent_email, pc.parent_name
      FROM parent_reports pr
      LEFT JOIN parent_connections pc ON pr.parent_connection_id = pc.id
      WHERE pr.user_id = ?
      ORDER BY pr.generated_at DESC
    `).all(userId)

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
