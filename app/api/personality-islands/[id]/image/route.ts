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

// Generate image using Fal AI - Flux Pro for high quality
async function generateWithFalAI(prompt: string): Promise<string | null> {
  const falApiKey = process.env.FAL_API_KEY
  if (!falApiKey) {
    console.log('FAL_API_KEY not set, skipping AI generation')
    return null
  }

  try {
    // Use Flux Pro for higher quality images
    const response = await fetch('https://queue.fal.run/fal-ai/flux-pro/v1.1', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: 'square_hd', // Higher resolution
        num_images: 1,
        enable_safety_checker: true,
        safety_tolerance: '2',
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

    // Poll for result (max 90 seconds for Pro model)
    const maxAttempts = 45
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const statusResponse = await fetch(`https://queue.fal.run/fal-ai/flux-pro/v1.1/requests/${requestId}/status`, {
        headers: {
          'Authorization': `Key ${falApiKey}`,
        },
      })

      if (!statusResponse.ok) continue

      const statusData = await statusResponse.json()

      if (statusData.status === 'COMPLETED') {
        const resultResponse = await fetch(`https://queue.fal.run/fal-ai/flux-pro/v1.1/requests/${requestId}`, {
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

    // Generate a rich prompt using Claude - optimized for Pixar/Inside Out style
    let imagePrompt = ''
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Create a stunning image generation prompt for a floating personality island. Theme: "${island.theme_name}" ${island.theme_emoji}

${island.theme_description ? `Context: ${island.theme_description}` : ''}

CRITICAL STYLE REQUIREMENTS:
- Pixar "Inside Out" movie aesthetic - the floating islands of personality
- 3D rendered look with soft, volumetric lighting and subsurface scattering
- Dreamlike atmosphere with gradient sky (purple to pink to golden orange)
- The island floats in vast cloudy sky, connected by thin glowing threads below
- Lush, whimsical landscape ON TOP of a purple/lavender rocky floating base
- Include 2-3 symbolic objects/structures that represent "${island.theme_name}"
- Soft bokeh, depth of field, cinematic composition
- Color palette: pastel purples, pinks, teals, warm golds
- Magical glowing particles/orbs floating around
- Style keywords: Pixar, Disney, dreamworks, 3D animation, octane render, volumetric lighting

Create ONE detailed prompt (150-200 words) focusing on visual elements. Output ONLY the prompt.`
        }]
      })

      if (response.content[0].type === 'text') {
        imagePrompt = response.content[0].text.trim()
      }
    } catch (err) {
      console.error('Error generating prompt:', err)
      // Fallback prompt - still high quality
      imagePrompt = `A stunning floating island representing ${island.theme_name}, Pixar Inside Out movie style, 3D rendered animation aesthetic. The island has a purple-lavender rocky base floating in a dreamy gradient sky of purple, pink, and golden orange. On top sits a whimsical landscape with glowing structures and symbolic objects. Volumetric lighting, soft bokeh, magical glowing orbs floating around, cinematic composition. Style: Pixar, Disney, DreamWorks, octane render, subsurface scattering, depth of field.`
    }

    // Add consistent style suffix to ensure quality
    const styledPrompt = `${imagePrompt} --style: Pixar Inside Out, 3D animation, cinematic lighting, 8k quality, highly detailed`

    // Generate the image
    let imageUrl: string | null = null
    if (process.env.FAL_API_KEY) {
      imageUrl = await generateWithFalAI(styledPrompt)
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
      imagePrompt: styledPrompt,
      remaining: usageResult.remaining,
      dailyLimit: DAILY_GENERATION_LIMIT,
    })
  } catch (error) {
    console.error('Error generating island image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
