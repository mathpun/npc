import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import db from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, userId, itemName, itemDescription, emoji } = body

    if (!itemId || !userId) {
      return NextResponse.json({ error: 'Item ID and User ID are required' }, { status: 400 })
    }

    // Verify user owns this item
    const item = await db.prepare(`
      SELECT id, user_id FROM museum_items WHERE id = ?
    `).get(itemId) as { id: number; user_id: string } | undefined

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (item.user_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate image prompt using Claude
    let imagePrompt = ''
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Create a short image prompt for a whimsical museum gift shop item:

Item: ${emoji} ${itemName}
Description: ${itemDescription}

Generate a prompt for a cute, stylized illustration of this item. Style: whimsical digital art, soft colors, gift shop souvenir aesthetic. Keep it under 50 words. Output ONLY the prompt.`
        }]
      })

      if (response.content[0].type === 'text') {
        imagePrompt = response.content[0].text.trim()
      }
    } catch (err) {
      console.error('Error generating prompt:', err)
      imagePrompt = `Whimsical gift shop item illustration: ${itemName}, cute stylized digital art, soft pastel colors, museum souvenir aesthetic`
    }

    // Generate image
    const imageUrl = await generateWithFalAI(imagePrompt)

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    // Save to database
    await db.prepare(`
      UPDATE museum_items SET image_url = ? WHERE id = ?
    `).run(imageUrl, itemId)

    return NextResponse.json({
      success: true,
      imageUrl,
      imagePrompt,
    })
  } catch (error) {
    console.error('Error generating museum item image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
