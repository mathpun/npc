import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
    hasPgHost: !!process.env.PGHOST,
    pgHost: process.env.PGHOST,
    hasPgDatabase: !!process.env.PGDATABASE,
    nodeEnv: process.env.NODE_ENV,
  })
}
