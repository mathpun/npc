import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{ role: 'user', content: message || 'Say hello in 5 words' }],
    })

    return Response.json({
      success: true,
      response: response.content[0].type === 'text' ? response.content[0].text : 'No text response'
    })
  } catch (error) {
    console.error('Test chat error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
