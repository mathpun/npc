'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavBarProps {
  showBack?: boolean
  backHref?: string
  backLabel?: string
}

export default function NavBar({ showBack = false, backHref = '/', backLabel = 'back' }: NavBarProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const profile = localStorage.getItem('youthai_profile')
    if (profile) {
      const parsed = JSON.parse(profile)
      setIsLoggedIn(true)
      setUserName(parsed.name || '')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('youthai_profile')
    localStorage.removeItem('npc_user_id')
    localStorage.removeItem('youthai_journal')
    localStorage.removeItem('youthai_shared')
    setIsLoggedIn(false)
    setUserName('')
    router.push('/')
  }

  return (
    <nav
      className="relative z-20 flex items-center justify-between px-4 py-3 border-b-4 border-black border-dashed"
      style={{ backgroundColor: 'white' }}
    >
      <div className="flex items-center gap-2">
        {/* Home button */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: '#FFB6C1',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          <span className="text-xl">🏠</span>
          <span className="hidden sm:inline">home</span>
        </Link>

        {/* Dashboard button */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: '#87CEEB',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          <span className="text-xl">🗺️</span>
          <span className="hidden sm:inline">journey</span>
        </Link>

        {/* Chat button */}
        <Link
          href="/chat"
          className="flex items-center gap-2 px-3 py-2 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: '#98FB98',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          <span className="text-xl">💬</span>
          <span className="hidden sm:inline">chat</span>
        </Link>

        {/* Museum button */}
        <Link
          href="/museum"
          className="flex items-center gap-2 px-3 py-2 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: '#DDA0DD',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          <span className="text-xl">🏛️</span>
          <span className="hidden sm:inline">museum</span>
        </Link>

        {/* Moltbook button */}
        <Link
          href="/moltbook"
          className="flex items-center gap-2 px-3 py-2 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: '#FFD700',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          <span className="text-xl">🌍</span>
          <span className="hidden sm:inline">world</span>
        </Link>

        {/* Optional back button */}
        {showBack && (
          <Link
            href={backHref}
            className="px-3 py-2 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            ← {backLabel}
          </Link>
        )}
      </div>

      {/* Logo in center */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-3xl">👻</span>
        <span className="text-xl font-bold hidden sm:inline">NPC</span>
      </Link>

      {/* Login/Logout */}
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <span
              className="hidden sm:inline px-3 py-1 text-sm"
              style={{
                backgroundColor: '#90EE90',
                border: '2px solid black',
                borderRadius: '9999px',
              }}
            >
              hi {userName}!
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#FF69B4',
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              <span className="sm:hidden">👋</span>
              <span className="hidden sm:inline">logout</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#90EE90',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            <span className="sm:hidden">✨</span>
            <span className="hidden sm:inline">sign in</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
