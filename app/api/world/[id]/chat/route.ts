import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildWorldBuildingPrompt, UserProfile, WorldContext, WorldElement } from '@/lib/prompts'
import db from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const { messages, profile, userId } = await request.json()

    if (!profile || !profile.name || !profile.currentAge) {
      return new Response(JSON.stringify({ error: 'Missing profile data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check access
    const world = await db.prepare(`
      SELECT * FROM worlds WHERE id = ?
    `).get(id) as {
      id: number
      user_id: string
      world_name: string
      world_emoji: string
      world_vibe: string | null
      world_description: string | null
    } | undefined

    if (!world) {
      return new Response(JSON.stringify({ error: 'World not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify user has access
    const isOwner = world.user_id === userId
    const isCollaborator = userId ? await db.prepare(`
      SELECT id FROM world_collaborators WHERE world_id = ? AND user_id = ?
    `).get(id, userId) : null

    if (!isOwner && !isCollaborator) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get existing elements
    const elements = await db.prepare(`
      SELECT emoji, name, element_type as type, description
      FROM world_elements
      WHERE world_id = ?
      ORDER BY created_at DESC
    `).all(id) as WorldElement[]

    const userProfile: UserProfile = {
      name: profile.name,
      currentAge: profile.currentAge,
      interests: profile.interests || [],
      currentGoals: profile.currentGoals || '',
    }

    const worldContext: WorldContext = {
      worldName: world.world_name,
      worldEmoji: world.world_emoji,
      worldVibe: world.world_vibe,
      worldDescription: world.world_description,
      elements,
    }

    const systemPrompt = buildWorldBuildingPrompt(userProfile, worldContext)

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: systemPrompt,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('World chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process world chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
