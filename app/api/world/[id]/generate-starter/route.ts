import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import db from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RouteParams {
  params: Promise<{ id: string }>
}

interface GeneratedElement {
  element_type: string
  emoji: string
  name: string
  description: string
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { userId, worldName, vibes, secret, weirdThing } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check that world exists and user has access
    const world = await db.prepare('SELECT user_id FROM worlds WHERE id = ?').get(id) as { user_id: string } | undefined
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

    // Build the prompt for Claude
    const contextParts = []
    if (vibes) contextParts.push(`The world has ${vibes} vibes.`)
    if (secret) contextParts.push(`The world's secret: ${secret}`)
    if (weirdThing) contextParts.push(`The weirdest thing that exists here: ${weirdThing}`)

    const prompt = `Generate 3-5 starter elements for a world called "${worldName || 'My World'}"${contextParts.length > 0 ? '.\n' + contextParts.join('\n') : ''}.

Create a mix of elements to help kickstart creative worldbuilding:
- 1 character or creature
- 1 place or location
- 1 artifact, rule, or story hook
- 1-2 bonus elements inspired by the world's unique traits

Return ONLY a valid JSON array with objects containing: element_type, emoji, name, description

element_type must be one of: character, creature, place, artifact, story, rule, vibe

Keep names creative and evocative. Descriptions should be 1-2 sentences that spark imagination.

Example format:
[
  {"element_type": "creature", "emoji": "🐉", "name": "The Whisper Dragon", "description": "A tiny dragon made of smoke that collects secrets. It trades them for shiny things."},
  {"element_type": "place", "emoji": "🏔️", "name": "Echo Mountains", "description": "Mountains that remember every word spoken near them and whisper them back at night."}
]

Return ONLY the JSON array, no other text.`

    let elements: GeneratedElement[] = []

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      if (response.content[0].type === 'text') {
        const text = response.content[0].text.trim()
        // Extract JSON from the response (handle potential markdown code blocks)
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          elements = JSON.parse(jsonMatch[0])
        }
      }
    } catch (err) {
      console.error('Error generating elements with Claude:', err)
      // Fallback elements if Claude fails
      elements = [
        {
          element_type: 'creature',
          emoji: '🌟',
          name: 'Starter Spark',
          description: 'A friendly spirit that guides new worldbuilders. It glows brighter with each new idea.',
        },
        {
          element_type: 'place',
          emoji: '🏰',
          name: 'The Foundation Stone',
          description: 'An ancient landmark where all stories begin. Perfect for plotting adventures.',
        },
        {
          element_type: 'artifact',
          emoji: '📖',
          name: 'The Blank Chronicle',
          description: 'A magical book that writes itself as the world grows. Every element added appears on its pages.',
        },
      ]
    }

    // Insert elements into the database with random positions
    const createdElements = []
    const canvasSize = 2000 // Canvas is typically 2000x2000
    const center = canvasSize / 2
    const spreadRadius = 200

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]

      // Position elements in a rough circle around center
      const angle = (i / elements.length) * Math.PI * 2
      const distance = spreadRadius * (0.5 + Math.random() * 0.5)
      const x = center + Math.cos(angle) * distance
      const y = center + Math.sin(angle) * distance

      await db.prepare(`
        INSERT INTO world_elements (world_id, creator_id, element_type, emoji, name, description, canvas_x, canvas_y)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        userId,
        element.element_type,
        element.emoji,
        element.name,
        element.description,
        x,
        y
      )

      createdElements.push({
        ...element,
        canvas_x: x,
        canvas_y: y,
      })
    }

    // Update world's updated_at timestamp
    await db.prepare(`
      UPDATE worlds SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(id)

    return NextResponse.json({
      success: true,
      elements: createdElements,
    })
  } catch (error) {
    console.error('Error generating starter elements:', error)
    return NextResponse.json({ error: 'Failed to generate starter elements' }, { status: 500 })
  }
}
