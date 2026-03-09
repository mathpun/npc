import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Generate image using Fal AI - Flux Pro for high quality
async function generateWithFalAI(prompt: string): Promise<string | null> {
  const falApiKey = process.env.FAL_API_KEY
  if (!falApiKey) {
    console.log('FAL_API_KEY not set, skipping AI generation')
    return null
  }

  try {
    const response = await fetch('https://queue.fal.run/fal-ai/flux-pro/v1.1', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: 'square_hd',
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

    // Poll for result (max 90 seconds)
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

// POST - Generate an image for a custom persona
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, emoji, description, vibe } = body

    if (!name || !vibe) {
      return NextResponse.json({ error: 'Name and vibe are required' }, { status: 400 })
    }

    // Generate a rich prompt using Claude
    let imagePrompt = ''
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Create an image generation prompt for a character avatar/portrait.

Character: "${name}"
Emoji: ${emoji}
Description: ${description || 'A unique character'}
Personality/Vibe: ${vibe}

Create a portrait/avatar image prompt that captures this character's essence. Requirements:
- Stylized character portrait, NOT realistic
- Pixar/Disney animation style - friendly and appealing
- Expressive face that matches the personality
- Vibrant colors matching the character's energy
- Circular avatar-friendly composition
- Whimsical, magical background elements
- Should feel approachable and fun for teens

Style: 3D animated character portrait, Pixar style, vibrant colors, magical lighting, circular composition, character avatar

Output ONLY the image prompt (100-150 words), no explanation.`
        }]
      })

      if (response.content[0].type === 'text') {
        imagePrompt = response.content[0].text.trim()
      }
    } catch (err) {
      console.error('Error generating prompt:', err)
      // Fallback prompt
      imagePrompt = `A stylized 3D animated character portrait of "${name}". ${description || 'A unique personality'}. Pixar/Disney animation style, vibrant colors, expressive friendly face, magical glowing background, circular avatar composition. The character embodies: ${vibe}. Style: 3D animation, character avatar, whimsical, appealing design.`
    }

    // Add style suffix
    const styledPrompt = `${imagePrompt} --style: Pixar 3D animation, character portrait, avatar, vibrant colors, magical lighting`

    // Generate the image
    let imageUrl: string | null = null
    if (process.env.FAL_API_KEY) {
      imageUrl = await generateWithFalAI(styledPrompt)
    }

    if (!imageUrl) {
      // Fallback to a placeholder based on emoji
      const seed = encodeURIComponent(name + emoji)
      imageUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=200`
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: styledPrompt,
    })
  } catch (error) {
    console.error('Error generating persona image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
