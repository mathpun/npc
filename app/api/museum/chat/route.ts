import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildMuseumSystemPrompt, UserProfile, MuseumItem } from '@/lib/prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, profile, existingItems } = await request.json()

    if (!profile || !profile.name || !profile.currentAge) {
      return new Response(JSON.stringify({ error: 'Missing profile data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userProfile: UserProfile = {
      name: profile.name,
      currentAge: profile.currentAge,
      interests: profile.interests || [],
      currentGoals: profile.currentGoals || '',
    }

    const items: MuseumItem[] = (existingItems || []).map((item: { emoji: string; name: string; description: string }) => ({
      emoji: item.emoji,
      name: item.name,
      description: item.description,
    }))

    const systemPrompt = buildMuseumSystemPrompt(userProfile, items)

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
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
    console.error('Museum chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process museum chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
