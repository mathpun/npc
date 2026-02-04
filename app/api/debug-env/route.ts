import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''
  return NextResponse.json({
    hasDbUrl: !!dbUrl,
    dbUrlLength: dbUrl.length,
    hasLineBreak: dbUrl.includes('\n'),
    hasCarriageReturn: dbUrl.includes('\r'),
    hostPart: dbUrl.match(/@([^:\/]+)/)?.[1] || 'not found',
    nodeEnv: process.env.NODE_ENV,
  })
}
// Trigger redeploy Tue Feb  3 18:26:54 PST 2026
// redeploy 1770172319
