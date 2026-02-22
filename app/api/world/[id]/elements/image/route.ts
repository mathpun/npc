import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import db from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// Generate a placeholder image URL based on element properties
function generatePlaceholderImage(element: { name: string; element_type: string; emoji: string | null }): string {
  // Use DiceBear API for stylized avatars based on element type
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
    const world = await db.prepare('SELECT user_id FROM worlds WHERE id = ?').get(id) as { user_id: string } | undefined
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

    if (generateAI && process.env.OPENAI_API_KEY) {
      // If we have OpenAI key, we could use DALL-E here
      // For now, use placeholder
      imageUrl = generatePlaceholderImage(element)
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

    // Also generate an AI description/image prompt for future use
    let imagePrompt = ''
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `Generate a short, vivid image prompt (1-2 sentences) for this ${element.element_type}: "${element.name}". ${element.description ? `Description: ${element.description}` : ''} Make it visually descriptive and imaginative.`
        }]
      })

      if (response.content[0].type === 'text') {
        imagePrompt = response.content[0].text
      }
    } catch (err) {
      console.error('Error generating image prompt:', err)
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      imagePrompt,
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
