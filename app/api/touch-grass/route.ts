import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Fetch user's grass points and stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    // Get user's grass points
    const stats = await db.prepare(`
      SELECT total_points, total_touches, last_touch, streak_days
      FROM grass_points
      WHERE user_id = ?
    `).get(userId) as { total_points: number; total_touches: number; last_touch: string; streak_days: number } | undefined

    // Get recent touches
    const recentTouches = await db.prepare(`
      SELECT id, points_earned, session_minutes, created_at
      FROM grass_touches
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(userId)

    return NextResponse.json({
      totalPoints: stats?.total_points || 0,
      totalTouches: stats?.total_touches || 0,
      streakDays: stats?.streak_days || 0,
      lastTouch: stats?.last_touch || null,
      recentTouches,
    })
  } catch (error) {
    console.error('Error fetching grass stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

// POST - Submit a grass touch (with optional photo)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, photoData, sessionMinutes } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Calculate points based on session length and photo
    let pointsEarned = 10 // base points
    if (sessionMinutes && sessionMinutes >= 10) {
      pointsEarned += 5 // bonus for long session break
    }
    if (photoData) {
      pointsEarned += 10 // bonus for photo proof
    }

    // For now, we'll store photo as base64 or skip it
    // In production, you'd upload to a storage service
    const photoUrl = photoData ? 'photo_submitted' : null

    // Insert the grass touch
    await db.prepare(`
      INSERT INTO grass_touches (user_id, photo_url, points_earned, session_minutes)
      VALUES (?, ?, ?, ?)
    `).run(userId, photoUrl, pointsEarned, sessionMinutes || 0)

    // Update or insert grass points
    const existingStats = await db.prepare(`
      SELECT total_points, total_touches, last_touch, streak_days
      FROM grass_points
      WHERE user_id = ?
    `).get(userId) as { total_points: number; total_touches: number; last_touch: string; streak_days: number } | undefined

    const now = new Date()
    let streakDays = 1

    if (existingStats) {
      // Check if last touch was yesterday (continue streak) or today (same day)
      const lastTouch = new Date(existingStats.last_touch)
      const daysDiff = Math.floor((now.getTime() - lastTouch.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0) {
        // Same day, keep streak
        streakDays = existingStats.streak_days
      } else if (daysDiff === 1) {
        // Yesterday, increment streak
        streakDays = existingStats.streak_days + 1
      }
      // Otherwise, streak resets to 1

      await db.prepare(`
        UPDATE grass_points
        SET total_points = total_points + ?,
            total_touches = total_touches + 1,
            last_touch = CURRENT_TIMESTAMP,
            streak_days = ?
        WHERE user_id = ?
      `).run(pointsEarned, streakDays, userId)
    } else {
      await db.prepare(`
        INSERT INTO grass_points (user_id, total_points, total_touches, last_touch, streak_days)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP, 1)
      `).run(userId, pointsEarned)
    }

    // Get updated stats
    const updatedStats = await db.prepare(`
      SELECT total_points, total_touches, streak_days
      FROM grass_points
      WHERE user_id = ?
    `).get(userId) as { total_points: number; total_touches: number; streak_days: number }

    return NextResponse.json({
      success: true,
      pointsEarned,
      totalPoints: updatedStats.total_points,
      totalTouches: updatedStats.total_touches,
      streakDays: updatedStats.streak_days,
      message: getEncouragingMessage(pointsEarned, updatedStats.streak_days),
    })
  } catch (error) {
    console.error('Error submitting grass touch:', error)
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
  }
}

function getEncouragingMessage(points: number, streak: number): string {
  const messages = [
    "you touched grass! nature appreciates you 🌿",
    "grass: touched. brain: refreshed. 🧠✨",
    "the grass was happy to see you! 🌱",
    "vitamin D acquired! +respect 😎",
    "you're basically a plant parent now 🪴",
    "the outside world thanks you for visiting 🌍",
    "grass touched successfully. anxiety decreased. 📉",
  ]

  let message = messages[Math.floor(Math.random() * messages.length)]

  if (streak >= 7) {
    message += ` ${streak} day streak - you're a grass touching legend! 🏆`
  } else if (streak >= 3) {
    message += ` ${streak} days in a row! keep it up! 🔥`
  }

  return message
}
