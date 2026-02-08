'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/ThemeContext'
import ThemePicker, { ThemePickerButton } from './ThemePicker'
import ChangePassword from './ChangePassword'

interface NavBarProps {
  showBack?: boolean
  backHref?: string
  backLabel?: string
}

export default function NavBar({ showBack = false, backHref = '/', backLabel = 'back' }: NavBarProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme } = useTheme()

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
    setMobileMenuOpen(false)
    router.push('/')
  }

  const navItems = [
    { href: '/', icon: '🏠', label: 'home', color: theme.colors.navHome },
    { href: '/dashboard', icon: '🗺️', label: 'journey', color: theme.colors.navDashboard },
    { href: '/chat', icon: '💬', label: 'chat', color: theme.colors.navChat },
    { href: '/museum', icon: '🏛️', label: 'museum', color: theme.colors.navMuseum },
    { href: '/moltbook', icon: '🌍', label: 'world', color: theme.colors.navWorld },
  ]

  return (
    <>
      <nav
        className="relative z-20 flex items-center justify-between px-3 sm:px-4 py-3 border-b-4 border-black border-dashed safe-area-top"
        style={{ backgroundColor: 'white' }}
      >
        {/* Mobile: Hamburger + Logo */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 font-bold"
            style={{
              backgroundColor: mobileMenuOpen ? theme.colors.accent1 : 'white',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl">👻</span>
            <span className="text-lg font-bold">npc</span>
          </Link>
        </div>

        {/* Desktop: Full nav items */}
        <div className="hidden sm:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: item.color,
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}

          <ThemePickerButton onClick={() => setShowThemePicker(true)} />

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

        {/* Desktop: Center logo */}
        <Link href="/" className="hidden sm:flex items-center gap-2">
          <span className="text-3xl">👻</span>
          <span className="text-xl font-bold hidden md:inline">npc</span>
        </Link>

        {/* Login/Logout - shown on both mobile and desktop */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <span
                className="hidden md:inline px-3 py-1 text-sm"
                style={{
                  backgroundColor: theme.colors.buttonSuccess,
                  border: '2px solid black',
                  borderRadius: '9999px',
                }}
              >
                hi {userName}!
              </span>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 font-bold hover:scale-105 transition-transform text-sm sm:text-base"
                style={{
                  backgroundColor: theme.colors.buttonPrimary,
                  border: '3px solid black',
                  borderRadius: '9999px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 font-bold hover:scale-105 transition-transform text-sm sm:text-base"
              style={{
                backgroundColor: theme.colors.buttonSuccess,
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              log in
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-x-0 top-[60px] z-50 p-4 sm:hidden mobile-nav-enter safe-area-left safe-area-right"
          style={{ backgroundColor: 'white', borderBottom: '4px solid black' }}
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1 p-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: item.color,
                  border: '3px solid black',
                  borderRadius: '16px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setShowThemePicker(true)
              }}
              className="flex flex-col items-center gap-1 p-3 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: theme.colors.accent2,
                border: '3px solid black',
                borderRadius: '16px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              <span className="text-2xl">🎨</span>
              <span className="text-xs">theme</span>
            </button>

            {isLoggedIn && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowChangePassword(true)
                }}
                className="flex flex-col items-center gap-1 p-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: theme.colors.accent5,
                  border: '3px solid black',
                  borderRadius: '16px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                <span className="text-2xl">🔐</span>
                <span className="text-xs">password</span>
              </button>
            )}
          </div>

          {isLoggedIn && (
            <div
              className="text-center p-2 mb-2"
              style={{
                backgroundColor: theme.colors.buttonSuccess,
                border: '2px solid black',
                borderRadius: '9999px',
              }}
            >
              hi {userName}! 👋
            </div>
          )}
        </div>
      )}

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Theme Picker Modal */}
      <ThemePicker isOpen={showThemePicker} onClose={() => setShowThemePicker(false)} />

      {/* Change Password Modal */}
      <ChangePassword isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </>
  )
}
