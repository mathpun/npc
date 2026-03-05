'use client'

import NavBar from '@/components/NavBar'
import Moltbook from '@/components/Moltbook'
import { useTheme } from '@/lib/ThemeContext'

export default function WorldPage() {
  const { theme } = useTheme()

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.colors.background }}
    >
      <NavBar />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Moltbook />
      </div>
    </main>
  )
}
