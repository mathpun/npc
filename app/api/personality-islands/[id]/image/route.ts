import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import db from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RouteParams {
  params: Promise<{ id: string }>
}

const DAILY_GENERATION_LIMIT = 10

// Check and increment usage, returns { allowed: boolean, remaining: number }
async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; remaining: number; used: number }> {
  const usage = await db.prepare(`
    SELECT generation_count FROM image_generation_usage
    WHERE user_id = ? AND generation_date = CURRENT_DATE
  `).get(userId) as { generation_count: number } | undefined

  const currentCount = usage?.generation_count || 0

  if (currentCount >= DAILY_GENERATION_LIMIT) {
    return { allowed: false, remaining: 0, used: currentCount }
  }

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

// POST - Generate image for an island
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: islandId } = await params

  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify island belongs to user
    const island = await db.prepare(`
      SELECT id, theme_name, theme_emoji, theme_description
      FROM personality_islands
      WHERE id = ? AND user_id = ?
    `).get(islandId, userId) as {
      id: number
      theme_name: string
      theme_emoji: string
      theme_description: string | null
    } | undefined

    if (!island) {
      return NextResponse.json({ error: 'Island not found' }, { status: 404 })
    }

    // Check rate limit
    const usageResult = await checkAndIncrementUsage(userId)
    if (!usageResult.allowed) {
      return NextResponse.json({
        error: 'Daily generation limit reached',
        remaining: 0,
        dailyLimit: DAILY_GENERATION_LIMIT,
      }, { status: 429 })
    }

    // Generate a rich prompt using Claude
    let imagePrompt = ''
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Create a vivid image generation prompt for a floating island representing the personality theme: "${island.theme_name}" ${island.theme_emoji}

${island.theme_description ? `Theme description: ${island.theme_description}` : ''}

Requirements:
- Style: Pixar's Inside Out inspired, dreamy floating island in the sky
- The island should visually represent "${island.theme_name}" through its landscape, objects, and atmosphere
- Vibrant colors, soft lighting, magical and whimsical feel
- Island floating in a beautiful sky with clouds
- Make it suitable for a teen's vision of their personality
- Keep under 100 words, focus on visual details

Output ONLY the image prompt, nothing else.`
        }]
      })

      if (response.content[0].type === 'text') {
        imagePrompt = response.content[0].text.trim()
      }
    } catch (err) {
      console.error('Error generating prompt:', err)
      // Fallback prompt
      imagePrompt = `Floating island in dreamy sky, Pixar Inside Out style, representing ${island.theme_name}, vibrant colors, magical whimsical atmosphere, soft clouds, beautiful lighting`
    }

    // Generate the image
    let imageUrl: string | null = null
    if (process.env.FAL_API_KEY) {
      imageUrl = await generateWithFalAI(imagePrompt)
    }

    if (!imageUrl) {
      // Fallback to a placeholder
      const seed = encodeURIComponent(island.theme_name)
      imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=200`
    }

    // Save the image URL
    await db.prepare(`
      UPDATE personality_islands
      SET image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(imageUrl, islandId)

    return NextResponse.json({
      success: true,
      imageUrl,
      imagePrompt,
      remaining: usageResult.remaining,
      dailyLimit: DAILY_GENERATION_LIMIT,
    })
  } catch (error) {
    console.error('Error generating island image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
