import { NextResponse } from 'next/server'

export async function GET() {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY
  const apiKeyPrefix = process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'not-set'

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey,
    apiKeyPrefix: apiKeyPrefix + '...',
    nodeEnv: process.env.NODE_ENV,
  })
}
