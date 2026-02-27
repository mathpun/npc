import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import db from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const DAILY_GENERATION_LIMIT = 10

// Check and increment usage, returns { allowed: boolean, remaining: number }
async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; remaining: number; used: number }> {
  // Get current usage for today
  const usage = await db.prepare(`
    SELECT generation_count FROM image_generation_usage
    WHERE user_id = ? AND generation_date = CURRENT_DATE
  `).get(userId) as { generation_count: number } | undefined

  const currentCount = usage?.generation_count || 0

  if (currentCount >= DAILY_GENERATION_LIMIT) {
    return { allowed: false, remaining: 0, used: currentCount }
  }

  // Increment or insert usage record
  await db.prepare(`
    INSERT INTO image_generation_usage (user_id, generation_date, generation_count)
    VALUES (?, CURRENT_DATE, 1)
    ON CONFLICT (user_id, generation_date)
    DO UPDATE SET generation_count = image_generation_usage.generation_count + 1
  `).run(userId)

  return {
    allowed: true,
    remaining: DAILY_GENERATION_LIMIT - currentCount - 1,
    used: currentCount + 1
  }
}

// Generate image using Fal AI
async function generateWithFalAI(prompt: string): Promise<string | null> {
  const falApiKey = process.env.FAL_API_KEY
  if (!falApiKey) {
    console.log('FAL_API_KEY not set, skipping AI generation')
    return null
  }

  try {
    // Use Fal AI's Flux Schnell model (fast)
    const response = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: 'square',
        num_images: 1,
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Fal AI queue error:', errorText)
      return null
    }

    const queueData = await response.json()
    const requestId = queueData.request_id

    if (!requestId) {
      console.error('No request_id in Fal response')
      return null
    }

    // Poll for result (max 60 seconds)
    const maxAttempts = 30
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const statusResponse = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}/status`, {
        headers: {
          'Authorization': `Key ${falApiKey}`,
        },
      })

      if (!statusResponse.ok) continue

      const statusData = await statusResponse.json()

      if (statusData.status === 'COMPLETED') {
        // Get the result
        const resultResponse = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${requestId}`, {
          headers: {
            'Authorization': `Key ${falApiKey}`,
          },
        })

        if (resultResponse.ok) {
          const resultData = await resultResponse.json()
          if (resultData.images && resultData.images.length > 0) {
            return resultData.images[0].url
          }
        }
        break
      } else if (statusData.status === 'FAILED') {
        console.error('Fal AI generation failed:', statusData)
        break
      }
    }

    return null
  } catch (err) {
    console.error('Error calling Fal AI:', err)
    return null
  }
}

// GET - Fetch current avatar
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const user = await db.prepare(`
      SELECT avatar_url FROM users WHERE id = ?
    `).get(userId) as { avatar_url: string | null } | undefined

    return NextResponse.json({
      avatarUrl: user?.avatar_url || null,
    })
  } catch (error) {
    console.error('Error fetching avatar:', error)
    return NextResponse.json({ error: 'Failed to fetch avatar' }, { status: 500 })
  }
}

// POST - Save avatar or generate AI avatar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, avatarUrl, generateAI, prompt } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // If just saving a URL (DiceBear or previously generated)
    if (avatarUrl && !generateAI) {
      await db.prepare(`
        UPDATE users SET avatar_url = ? WHERE id = ?
      `).run(avatarUrl, userId)

      return NextResponse.json({
        success: true,
        avatarUrl,
      })
    }

    // If generating AI avatar
    if (generateAI && prompt) {
      // Check rate limit
      const usageResult = await checkAndIncrementUsage(userId)
      if (!usageResult.allowed) {
        return NextResponse.json({
          error: 'Daily generation limit reached',
          remaining: 0,
          dailyLimit: DAILY_GENERATION_LIMIT,
        }, { status: 429 })
      }

      // Generate enhanced prompt using Claude
      let imagePrompt = prompt
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: `Create a vivid image generation prompt for a personal avatar based on: "${prompt}"

Requirements:
- Style: digital art portrait, stylized, vibrant colors
- Should be appropriate for a teen's profile picture
- Focus on visual details, expression, and style
- Keep it under 80 words

Output ONLY the image prompt, nothing else.`
          }]
        })

        if (response.content[0].type === 'text') {
          imagePrompt = response.content[0].text.trim()
        }
      } catch (err) {
        console.error('Error enhancing prompt:', err)
        // Use original prompt as fallback
        imagePrompt = `Digital art portrait, stylized avatar, ${prompt}, vibrant colors, clean background`
      }

      // Generate with Fal AI
      const generatedUrl = await generateWithFalAI(imagePrompt)

      if (!generatedUrl) {
        return NextResponse.json({
          error: 'Failed to generate avatar',
          remaining: usageResult.remaining,
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        avatarUrl: generatedUrl,
        remaining: usageResult.remaining,
        dailyLimit: DAILY_GENERATION_LIMIT,
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error processing avatar request:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
