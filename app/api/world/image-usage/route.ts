import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

const DAILY_GENERATION_LIMIT = 10

// GET current usage stats for a user
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    // Get current usage for today
    const usage = await db.prepare(`
      SELECT generation_count FROM image_generation_usage
      WHERE user_id = ? AND generation_date = CURRENT_DATE
    `).get(userId) as { generation_count: number } | undefined

    const dailyUsed = usage?.generation_count || 0
    const remaining = Math.max(0, DAILY_GENERATION_LIMIT - dailyUsed)

    return NextResponse.json({
      dailyUsed,
      dailyLimit: DAILY_GENERATION_LIMIT,
      remaining,
    })
  } catch (error) {
    console.error('Error fetching usage:', error)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
}
