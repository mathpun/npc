import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, UserProfile, SessionContext } from '@/lib/prompts'
import db from '@/lib/db'
import { scanAndFlagMessage } from '@/lib/content-safety'

// Lazy-load the Anthropic client to avoid initialization errors
let anthropic: Anthropic | null = null
function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set')
    }
    anthropic = new Anthropic({ apiKey })
  }
  return anthropic
}

// Save a chat message to the database
async function saveMessage(userId: string, role: string, content: string, sessionId?: number) {
  try {
    if (sessionId) {
      await db.prepare(`
        INSERT INTO chat_messages (user_id, session_id, role, content)
        VALUES (?, ?, ?, ?)
      `).run(userId, sessionId, role, content)

      // Update message count on session
      await db.prepare(`
        UPDATE chat_sessions SET message_count = message_count + 1 WHERE id = ?
      `).run(sessionId)
    } else {
      await db.prepare(`
        INSERT INTO chat_messages (user_id, role, content)
        VALUES (?, ?, ?)
      `).run(userId, role, content)
    }
  } catch (error) {
    console.error('Failed to save message:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, profile, session, userId, sessionId } = await request.json()

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

    const sessionContext: SessionContext | undefined = session ? {
      goal: session.goal,
      topic: session.topic,
      persona: session.persona,
    } : undefined

    const systemPrompt = buildSystemPrompt(userProfile, sessionContext)

    // Save the latest user message to the database and scan for safety
    if (userId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'user') {
        saveMessage(userId, 'user', lastMessage.content, sessionId)
        // Scan message for concerning content (async, don't block response)
        scanAndFlagMessage(null, userId, lastMessage.content).catch(err => {
          console.error('Content safety scan error:', err)
        })
      }
    }

    // Create a streaming response
    const stream = await getAnthropicClient().messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 250,
      system: systemPrompt,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    })

    // Create a ReadableStream for the response
    const encoder = new TextEncoder()
    let fullResponse = '' // Accumulate the full response to save later

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text
              fullResponse += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }

          // Save assistant response to database
          if (userId && fullResponse) {
            saveMessage(userId, 'assistant', fullResponse, sessionId)
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
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
