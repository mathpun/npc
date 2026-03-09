'use client'

import NavBar from '@/components/NavBar'
import GratitudeJournal from '@/components/GratitudeJournal'
import { useTheme } from '@/lib/ThemeContext'

export default function JournalPage() {
  const { theme } = useTheme()

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.colors.background }}
    >
      <NavBar />

      <div className="flex-1 flex flex-col items-center p-4 pb-24">
        <GratitudeJournal />
      </div>
    </main>
  )
}
