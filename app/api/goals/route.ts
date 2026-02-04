import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET goals for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const goals = await db.prepare(`
      SELECT * FROM user_goals
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId)

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST create a new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title } = body

    if (!userId || !title) {
      return NextResponse.json({ error: 'User ID and title are required' }, { status: 400 })
    }

    // Insert the goal
    await db.prepare(`
      INSERT INTO user_goals (user_id, title, progress, status)
      VALUES (?, ?, 0, 'active')
    `).run(userId, title)

    // Log the activity
    await db.prepare(`
      INSERT INTO activity_log (user_id, activity_type, activity_data)
      VALUES (?, 'goal_created', ?)
    `).run(userId, JSON.stringify({ title }))

    // Check if this is their first goal - grant achievement
    const goalCount = await db.prepare(`
      SELECT COUNT(*) as count FROM user_goals WHERE user_id = ?
    `).get(userId) as { count: number } | undefined

    if (goalCount?.count === 1) {
      await db.prepare(`
        INSERT INTO achievements (user_id, achievement_key)
        VALUES (?, 'goal_setter')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
      `).run(userId)

      await db.prepare(`
        INSERT INTO milestones (user_id, milestone_type, title, description, color)
        VALUES (?, 'first_goal', 'Set First Goal', 'Started working towards something!', '#FF69B4')
      `).run(userId)
    }

    return NextResponse.json({
      title,
      progress: 0,
      status: 'active',
      isFirstGoal: goalCount?.count === 1
    })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}

// PUT update a goal (progress or status)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { goalId, progress, status, userId } = body

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    // Update the goal
    if (progress !== undefined) {
      await db.prepare(`
        UPDATE user_goals SET progress = ? WHERE id = ?
      `).run(progress, goalId)
    }

    if (status) {
      await db.prepare(`
        UPDATE user_goals SET status = ?, completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
        WHERE id = ?
      `).run(status, status, goalId)

      // If completing a goal, log it and check for achievement
      if (status === 'completed' && userId) {
        await db.prepare(`
          INSERT INTO activity_log (user_id, activity_type, activity_data)
          VALUES (?, 'goal_completed', ?)
        `).run(userId, JSON.stringify({ goalId }))

        // Grant goal_getter achievement
        await db.prepare(`
          INSERT INTO achievements (user_id, achievement_key)
          VALUES (?, 'goal_getter')
          ON CONFLICT (user_id, achievement_key) DO NOTHING
        `).run(userId)

        // Add milestone
        const goal = await db.prepare('SELECT title FROM user_goals WHERE id = ?').get(goalId) as { title: string } | undefined
        if (goal) {
          await db.prepare(`
            INSERT INTO milestones (user_id, milestone_type, title, description, color)
            VALUES (?, 'goal_complete', 'Goal Completed!', ?, '#FFA500')
          `).run(userId, `Finished: ${goal.title}`)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

// DELETE a goal
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const goalId = searchParams.get('goalId')

  if (!goalId) {
    return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
  }

  try {
    await db.prepare('DELETE FROM user_goals WHERE id = ?').run(goalId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
