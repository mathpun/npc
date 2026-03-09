'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import GratitudeJournal from '@/components/GratitudeJournal'
import { useTheme } from '@/lib/ThemeContext'

export default function JournalPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem('npc_user_id')
    if (!storedUserId) {
      router.push('/dashboard')
      return
    }
    setUserId(storedUserId)
  }, [router])

  if (!userId) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="text-2xl">Loading...</div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.colors.background }}
    >
      <NavBar />

      <div className="flex-1 flex flex-col items-center p-4 pb-24">
        <GratitudeJournal userId={userId} />
      </div>
    </main>
  )
}
