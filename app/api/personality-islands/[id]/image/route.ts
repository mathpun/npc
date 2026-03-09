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

    // Verify island belongs to user and get all details
    const island = await db.prepare(`
      SELECT id, theme_name, theme_emoji, theme_description, details_json
      FROM personality_islands
      WHERE id = ? AND user_id = ?
    `).get(islandId, userId) as {
      id: number
      theme_name: string
      theme_emoji: string
      theme_description: string | null
      details_json: string | null
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

    // Parse the detailed island data
    let details: { keyMemories?: string[]; symbols?: string[]; emotions?: string[]; people?: string[]; colors?: string[] } = {}
    if (island.details_json) {
      try {
        details = JSON.parse(island.details_json)
      } catch {
        // Ignore parse errors
      }
    }

    // Generate a rich prompt using Claude - optimized for Pixar/Inside Out style with DETAILED content
    let imagePrompt = ''
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Create a HIGHLY DETAILED image prompt for a floating personality island like Pixar's Inside Out.

=== ISLAND IDENTITY ===
Theme: "${island.theme_name}" ${island.theme_emoji}
Description: ${island.theme_description || 'A core part of who this person is'}

=== SPECIFIC DETAILS TO INCLUDE ===
Symbolic Objects: ${details.symbols?.join(', ') || 'various thematic objects'}
Key Memories: ${details.keyMemories?.join(', ') || 'meaningful moments'}
Emotions: ${details.emotions?.join(', ') || 'mixed feelings'}
Color Palette: ${details.colors?.join(', ') || 'vibrant and warm'}

=== CRITICAL REQUIREMENTS ===
Create an EXTREMELY DETAILED floating island like in Inside Out:
1. PURPLE/LAVENDER ROCKY BASE - the classic Inside Out island foundation with vertical cliff textures
2. DENSE LANDSCAPE on top - packed with structures, machines, decorations (like the "Goofball Island" with its funny props)
3. SPECIFIC OBJECTS - Include ALL the symbolic objects listed above as actual detailed structures/items on the island
4. CENTRAL FOCAL POINT - One main impressive structure that represents the core of this theme
5. INTRICATE DETAILS - Gears, pipes, lights, moving parts, small decorative elements everywhere
6. GLOWING ELEMENTS - Memory orbs, light threads, magical particles
7. DREAMY SKY - Purple to pink to gold gradient, soft clouds

The island should be DENSELY PACKED with whimsical, detailed structures - not sparse or simple!
Think of how detailed and busy the real Inside Out islands are.

Style: Pixar 3D animation, octane render, volumetric lighting, 8K detail, cinematic

Output ONLY the image prompt (200-250 words), no explanation.`
        }]
      })

      if (response.content[0].type === 'text') {
        imagePrompt = response.content[0].text.trim()
      }
    } catch (err) {
      console.error('Error generating prompt:', err)
      // Fallback prompt - still high quality and detailed
      const symbolsList = details.symbols?.slice(0, 4).join(', ') || 'glowing structures, decorative elements'
      const colorsList = details.colors?.join(' and ') || 'purple, pink, and gold'
      imagePrompt = `A highly detailed floating personality island representing "${island.theme_name}", Pixar Inside Out movie style. The island has a purple-lavender rocky cliff base with vertical texture lines. On top is a DENSELY PACKED whimsical landscape featuring: ${symbolsList}. The central structure is an impressive ${island.theme_name}-themed building with intricate details, gears, pipes, and glowing elements. Small decorative objects, memory orbs, and magical particles fill every corner. Colors: ${colorsList}. Dreamy gradient sky from deep purple to pink to golden orange. Volumetric lighting, soft bokeh, 8K detail, cinematic composition. Style: Pixar, Disney, DreamWorks, octane render, extremely detailed.`
    }

    // Add consistent style suffix to ensure quality and detail
    const styledPrompt = `${imagePrompt} --style: Pixar Inside Out personality island, 3D animation, extremely detailed and intricate, dense with objects and structures, volumetric cinematic lighting, 8K quality, octane render`

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
