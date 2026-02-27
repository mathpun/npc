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

// Style presets for different element types
const STYLE_PRESETS: Record<string, string> = {
  character: 'digital art portrait, stylized, vibrant colors, fantasy character design',
  creature: 'creature concept art, imaginative, detailed, fantasy illustration',
  place: 'environment concept art, scenic, atmospheric, detailed landscape',
  artifact: 'item design, magical object, detailed prop art, glowing effects',
  story: 'storybook illustration, narrative scene, dreamy atmosphere',
  rule: 'abstract symbolic art, conceptual, minimalist with meaning',
  vibe: 'mood board aesthetic, dreamy, ethereal, abstract emotional art',
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

// Generate a placeholder image URL based on element properties
function generatePlaceholderImage(element: { name: string; element_type: string; emoji: string | null }): string {
  const styles: Record<string, string> = {
    character: 'adventurer',
    creature: 'bottts',
    place: 'shapes',
    artifact: 'icons',
    story: 'thumbs',
    rule: 'identicon',
    vibe: 'fun-emoji',
  }

  const style = styles[element.element_type] || 'shapes'
  const seed = encodeURIComponent(element.name)
  const backgroundColor = 'transparent'

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${backgroundColor}&size=200`
}

// POST generate image for an element
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId, elementId, generateAI } = body

    if (!userId || !elementId) {
      return NextResponse.json({ error: 'User ID and element ID are required' }, { status: 400 })
    }

    // Check access
    const world = await db.prepare('SELECT user_id, world_name, world_vibe FROM worlds WHERE id = ?').get(id) as { user_id: string; world_name: string; world_vibe: string | null } | undefined
    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 })
    }

    const isOwner = world.user_id === userId
    const isCollaborator = await db.prepare(`
      SELECT id FROM world_collaborators WHERE world_id = ? AND user_id = ?
    `).get(id, userId)

    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check rate limit for AI generation
    let usageResult: { allowed: boolean; remaining: number; used: number } | null = null
    if (generateAI) {
      usageResult = await checkAndIncrementUsage(userId)
      if (!usageResult.allowed) {
        return NextResponse.json({
          error: 'Daily generation limit reached',
          remaining: 0,
          dailyLimit: DAILY_GENERATION_LIMIT,
        }, { status: 429 })
      }
    }

    // Get element
    const element = await db.prepare(`
      SELECT * FROM world_elements WHERE id = ? AND world_id = ?
    `).get(elementId, id) as {
      id: number
      name: string
      element_type: string
      description: string | null
      emoji: string | null
    } | undefined

    if (!element) {
      return NextResponse.json({ error: 'Element not found' }, { status: 404 })
    }

    let imageUrl: string
    let imagePrompt = ''

    // Generate a rich prompt using Claude
    try {
      const styleHint = STYLE_PRESETS[element.element_type] || 'creative digital art'
      const worldContext = world.world_vibe ? `in a ${world.world_vibe} world` : ''

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Create a vivid image generation prompt for: "${element.name}" (${element.element_type}) ${worldContext}.
${element.description ? `Description: ${element.description}` : ''}

Requirements:
- Style: ${styleHint}
- Make it visually striking and imaginative
- Keep it under 100 words
- Focus on visual details, colors, lighting, mood
- Make it suitable for a teen's creative vision board

Output ONLY the image prompt, nothing else.`
        }]
      })

      if (response.content[0].type === 'text') {
        imagePrompt = response.content[0].text.trim()
      }
    } catch (err) {
      console.error('Error generating prompt:', err)
      // Fallback prompt
      imagePrompt = `${STYLE_PRESETS[element.element_type] || 'creative digital art'}, ${element.name}, ${element.description || 'imaginative and vibrant'}`
    }

    // Try to generate AI image if requested and API key is available
    if (generateAI && process.env.FAL_API_KEY) {
      const aiImageUrl = await generateWithFalAI(imagePrompt)
      if (aiImageUrl) {
        imageUrl = aiImageUrl
      } else {
        // Fallback to placeholder
        imageUrl = generatePlaceholderImage(element)
      }
    } else {
      // Use placeholder image
      imageUrl = generatePlaceholderImage(element)
    }

    // Save image URL to element
    await db.prepare(`
      UPDATE world_elements
      SET image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(imageUrl, elementId)

    return NextResponse.json({
      success: true,
      imageUrl,
      imagePrompt,
      isAIGenerated: imageUrl !== generatePlaceholderImage(element),
      remaining: usageResult?.remaining ?? DAILY_GENERATION_LIMIT,
      dailyLimit: DAILY_GENERATION_LIMIT,
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
