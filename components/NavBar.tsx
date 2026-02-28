'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
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
  const pathname = usePathname()
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

  const handleLogout = async () => {
    localStorage.removeItem('youthai_profile')
    localStorage.removeItem('npc_user_id')
    localStorage.removeItem('youthai_journal')
    localStorage.removeItem('youthai_shared')
    setIsLoggedIn(false)
    setUserName('')
    setMobileMenuOpen(false)
    await signOut({ redirect: false })
    router.push('/')
  }

  // Main nav tabs - 5 core items
  const navItems = [
    { href: '/', icon: '🏠', label: 'home', color: '#FF6B9D' },
    { href: '/chat', icon: '💬', label: 'chat', color: '#7BED9F' },
    { href: '/create', icon: '✨', label: 'create', color: '#DDA0DD' },
    { href: '/chat?tab=growth', icon: '🌀', label: 'wrapped', color: '#FDCB6E' },
    { href: '/profile', icon: '👤', label: 'me', color: '#87CEEB' },
  ]

  // Extra items for mobile menu
  const mobileExtraItems = [
    { href: '/parent', icon: '👨‍👩‍👧', label: 'parent', color: '#FD79A8' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.includes('?')) return pathname + window.location.search === href
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav
        className="relative z-20 safe-area-top"
        style={{
          background: 'linear-gradient(135deg, #fff9f0 0%, #fff 50%, #f0f9ff 100%)',
          borderBottom: '3px solid black',
        }}
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
          {/* Logo - always visible */}
          <Link href="/" className="flex items-center gap-1.5 hover:scale-105 transition-transform">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xl sm:text-2xl"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                border: '2px solid black',
                boxShadow: '2px 2px 0 black',
              }}
            >
              👻
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight">npc</span>
          </Link>

          {/* Desktop: Nav tabs */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 lg:px-4 py-2 font-bold text-sm hover:scale-105 transition-all"
                  style={{
                    backgroundColor: active ? item.color : 'white',
                    border: '2px solid black',
                    borderRadius: '12px',
                    boxShadow: active ? '3px 3px 0 black' : '2px 2px 0 black',
                    transform: active ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <Link
              href="/parent"
              className="flex items-center gap-1.5 px-3 lg:px-4 py-2 font-bold text-sm hover:scale-105 transition-all"
              style={{
                backgroundColor: pathname === '/parent' ? '#FD79A8' : 'white',
                border: '2px solid black',
                borderRadius: '12px',
                boxShadow: pathname === '/parent' ? '3px 3px 0 black' : '2px 2px 0 black',
              }}
            >
              <span className="text-lg">👨‍👩‍👧</span>
              <span>parent</span>
            </Link>

            <ThemePickerButton onClick={() => setShowThemePicker(true)} />
          </div>

          {/* Right side: Login/Logout + Mobile menu */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 font-bold hover:scale-105 transition-transform text-xs sm:text-sm"
                style={{
                  backgroundColor: '#FFB6C1',
                  border: '2px solid black',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                logout
              </button>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 sm:px-4 sm:py-2 font-bold hover:scale-105 transition-transform text-xs sm:text-sm"
                style={{
                  backgroundColor: '#90EE90',
                  border: '2px solid black',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                log in
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 font-bold"
              style={{
                backgroundColor: mobileMenuOpen ? theme.colors.accent1 : 'white',
                border: '2px solid black',
                borderRadius: '10px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-x-0 top-[58px] z-50 p-4 md:hidden mobile-nav-enter safe-area-left safe-area-right"
          style={{
            background: 'linear-gradient(180deg, #fff9f0 0%, #ffffff 100%)',
            borderBottom: '3px solid black',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {/* Main nav - 2x3 grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1 p-3 font-bold hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: item.color,
                    border: active ? '3px solid black' : '2px solid black',
                    borderRadius: '14px',
                    boxShadow: active ? '4px 4px 0 black' : '2px 2px 0 black',
                    opacity: active ? 1 : 0.9,
                  }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}

            {/* Parent in mobile menu */}
            <Link
              href="/parent"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center gap-1 p-3 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#FD79A8',
                border: pathname === '/parent' ? '3px solid black' : '2px solid black',
                borderRadius: '14px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              <span className="text-2xl">👨‍👩‍👧</span>
              <span className="text-xs">parent</span>
            </Link>
          </div>

          {/* Bottom row: theme + password */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setShowThemePicker(true)
              }}
              className="flex-1 flex items-center justify-center gap-2 p-2.5 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#E6E6FA',
                border: '2px solid black',
                borderRadius: '10px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              <span className="text-lg">🎨</span>
              <span className="text-sm">theme</span>
            </button>

            {isLoggedIn && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowChangePassword(true)
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: '#F0F0F0',
                  border: '2px solid black',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                <span className="text-lg">🔐</span>
                <span className="text-sm">password</span>
              </button>
            )}
          </div>

          {isLoggedIn && (
            <div className="mt-3 text-center">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-block px-4 py-2 font-bold text-sm hover:scale-105 transition-transform"
                style={{
                  backgroundColor: '#90EE90',
                  border: '2px solid black',
                  borderRadius: '9999px',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                hi {userName}! 👋
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
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
