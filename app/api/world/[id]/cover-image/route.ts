import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import db from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RouteParams {
  params: Promise<{ id: string }>
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
        image_size: 'landscape_16_9',
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

// Generate a placeholder cover image
function generatePlaceholderCover(worldName: string, vibes: string): string {
  const seed = encodeURIComponent(worldName)
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&size=800&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId, worldName, vibes } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check that world exists and user has access
    const world = await db.prepare('SELECT user_id, world_name, world_vibe FROM worlds WHERE id = ?').get(id) as { user_id: string; world_name: string; world_vibe: string | null } | undefined
    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 })
    }

    if (world.user_id !== userId) {
      const isCollaborator = await db.prepare(`
        SELECT id FROM world_collaborators WHERE world_id = ? AND user_id = ?
      `).get(id, userId)
      if (!isCollaborator) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    let imageUrl: string
    let imagePrompt = ''

    // Generate a rich prompt using Claude
    try {
      const vibeContext = vibes || world.world_vibe || 'fantastical'
      const name = worldName || world.world_name || 'Mysterious World'

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Create a vivid image generation prompt for a world cover image.

World name: "${name}"
World vibe: ${vibeContext}

Requirements:
- Create a sweeping landscape or environment that captures the essence of this world
- Style: digital art, fantasy illustration, cinematic, vibrant colors
- Include atmospheric elements (lighting, weather, time of day)
- Make it feel like the opening shot of an epic story
- Keep it under 100 words
- Focus on the environment and atmosphere, not characters

Output ONLY the image prompt, nothing else.`
        }]
      })

      if (response.content[0].type === 'text') {
        imagePrompt = response.content[0].text.trim()
      }
    } catch (err) {
      console.error('Error generating prompt:', err)
      // Fallback prompt
      imagePrompt = `Fantasy world landscape, ${vibes || 'magical'}, digital art, cinematic lighting, sweeping vista, vibrant colors, atmospheric, epic scale`
    }

    // Try to generate AI image
    if (process.env.FAL_API_KEY) {
      const aiImageUrl = await generateWithFalAI(imagePrompt)
      if (aiImageUrl) {
        imageUrl = aiImageUrl
      } else {
        // Fallback to placeholder
        imageUrl = generatePlaceholderCover(worldName || 'world', vibes || '')
      }
    } else {
      // Use placeholder image
      imageUrl = generatePlaceholderCover(worldName || 'world', vibes || '')
    }

    // Save cover image URL to world
    await db.prepare(`
      UPDATE worlds
      SET cover_image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(imageUrl, id)

    return NextResponse.json({
      success: true,
      imageUrl,
      imagePrompt,
    })
  } catch (error) {
    console.error('Error generating cover image:', error)
    return NextResponse.json({ error: 'Failed to generate cover image' }, { status: 500 })
  }
}
