import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

function generateSlug(): string {
  const adjectives = ['curious', 'creative', 'dreamy', 'wild', 'gentle', 'cosmic', 'fuzzy', 'sparkly', 'wandering', 'midnight']
  const nouns = ['explorer', 'dreamer', 'collector', 'curator', 'wanderer', 'storyteller', 'adventurer', 'observer', 'thinker', 'maker']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 1000)
  return `${adj}-${noun}-${num}`
}

// GET museum share settings
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const museum = await db.prepare(`
      SELECT * FROM museums WHERE user_id = ?
    `).get(userId) as { id: number; user_id: string; share_slug: string | null; museum_name: string | null; tagline: string | null; is_public: number } | undefined

    if (!museum) {
      return NextResponse.json({
        isPublic: false,
        shareSlug: null,
        museumName: null,
        tagline: null,
      })
    }

    return NextResponse.json({
      isPublic: museum.is_public === 1,
      shareSlug: museum.share_slug,
      museumName: museum.museum_name,
      tagline: museum.tagline,
    })
  } catch (error) {
    console.error('Error fetching museum settings:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST create or update museum share settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, isPublic, museumName, tagline } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if museum record exists
    const existing = await db.prepare(`
      SELECT * FROM museums WHERE user_id = ?
    `).get(userId) as { id: number; share_slug: string | null } | undefined

    let shareSlug = existing?.share_slug

    // Generate slug if making public and no slug exists
    if (isPublic && !shareSlug) {
      shareSlug = generateSlug()

      // Make sure slug is unique
      let attempts = 0
      while (attempts < 10) {
        const existingSlug = await db.prepare('SELECT id FROM museums WHERE share_slug = ?').get(shareSlug)
        if (!existingSlug) break
        shareSlug = generateSlug()
        attempts++
      }
    }

    if (existing) {
      // Update existing record
      await db.prepare(`
        UPDATE museums
        SET is_public = ?,
            share_slug = COALESCE(?, share_slug),
            museum_name = COALESCE(?, museum_name),
            tagline = COALESCE(?, tagline)
        WHERE user_id = ?
      `).run(isPublic ? 1 : 0, shareSlug, museumName, tagline, userId)
    } else {
      // Create new record
      await db.prepare(`
        INSERT INTO museums (user_id, share_slug, museum_name, tagline, is_public)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, shareSlug, museumName, tagline, isPublic ? 1 : 0)
    }

    return NextResponse.json({
      success: true,
      isPublic,
      shareSlug,
      museumName,
      tagline,
    })
  } catch (error) {
    console.error('Error updating museum settings:', error)
    return NextResponse.json({ error: 'Failed to update museum settings' }, { status: 500 })
  }
}
