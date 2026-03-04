'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTheme } from '@/lib/ThemeContext'
import ThemePicker, { ThemePickerButton } from './ThemePicker'
import ChangePassword from './ChangePassword'
import DeleteAccount from './DeleteAccount'

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
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
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

  // Main nav tabs - 6 core items
  const navItems = [
    { href: '/', icon: '🏠', label: 'home', color: '#FF6B9D' },
    { href: '/today', icon: '🔮', label: 'today', color: '#9B59B6' },
    { href: '/chat', icon: '💬', label: 'chat', color: '#7BED9F' },
    { href: '/create', icon: '✨', label: 'create', color: '#DDA0DD' },
    { href: '/chat?tab=growth', icon: '🌀', label: 'mind wrapped', color: '#FDCB6E' },
    { href: '/profile', icon: '👤', label: 'profile', color: '#87CEEB' },
  ]

  // Extra items for mobile menu
  const mobileExtraItems = [
    { href: '/parent', icon: '👨‍👩‍👧', label: 'parent dash', color: '#FD79A8' },
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
                    backgroundColor: item.color,
                    border: active ? '3px solid black' : '2px solid black',
                    borderRadius: '12px',
                    boxShadow: active ? '4px 4px 0 black' : '2px 2px 0 black',
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
                backgroundColor: '#FD79A8',
                border: pathname === '/parent' ? '3px solid black' : '2px solid black',
                borderRadius: '12px',
                boxShadow: pathname === '/parent' ? '4px 4px 0 black' : '2px 2px 0 black',
                transform: pathname === '/parent' ? 'translateY(-2px)' : 'none',
              }}
            >
              <span className="text-lg">👨‍👩‍👧</span>
              <span>parent dash</span>
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
          className="fixed inset-x-0 top-[58px] bottom-0 z-50 p-4 md:hidden mobile-nav-enter safe-area-left safe-area-right overflow-y-auto"
          style={{
            background: `linear-gradient(180deg,
              ${theme.colors.accent1} 0%,
              ${theme.colors.accent4} 30%,
              ${theme.colors.accent3} 60%,
              ${theme.colors.accent5} 100%)`,
          }}
        >
          {/* Fun header */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xl">✨</span>
            <span className="font-black text-base">where to?</span>
            <span className="text-xl">✨</span>
          </div>

          {/* Main nav - 3x3 grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[...navItems, { href: '/parent', icon: '👨‍👩‍👧', label: 'parent dash', color: '#FD79A8' }].map((item, index) => {
              const active = isActive(item.href)
              // Center the last item if it's alone in its row
              const isLastItem = index === navItems.length
              const itemsInLastRow = (navItems.length + 1) % 3
              const shouldCenter = isLastItem && itemsInLastRow === 1

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex flex-col items-center justify-center gap-1 p-3 font-bold hover:scale-105 transition-all active:scale-95 ${shouldCenter ? 'col-start-2' : ''}`}
                  style={{
                    backgroundColor: item.color,
                    border: '2px solid black',
                    borderRadius: '14px',
                    boxShadow: active ? '3px 3px 0 black' : '2px 2px 0 black',
                  }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-bold text-center leading-tight">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Settings row */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setShowThemePicker(true)
              }}
              className="flex-1 flex items-center justify-center gap-2 p-2.5 font-bold hover:scale-105 transition-all active:scale-95"
              style={{
                backgroundColor: '#E6E6FA',
                border: '2px solid black',
                borderRadius: '10px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              <span className="text-base">🎨</span>
              <span className="text-xs font-bold">skins</span>
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowChangePassword(true)
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 font-bold hover:scale-105 transition-all active:scale-95"
                style={{
                  backgroundColor: '#FFE4B5',
                  border: '2px solid black',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                <span className="text-base">🔐</span>
                <span className="text-xs font-bold">settings</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 font-bold hover:scale-105 transition-all active:scale-95"
                style={{
                  backgroundColor: '#90EE90',
                  border: '2px solid black',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                <span className="text-base">👋</span>
                <span className="text-xs font-bold">log in</span>
              </Link>
            )}
          </div>

          {isLoggedIn && (
            <div className="text-center">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 font-bold text-xs"
                style={{
                  backgroundColor: 'white',
                  border: '2px dashed black',
                  borderRadius: '9999px',
                }}
              >
                <span>👻</span>
                <span>hi {userName}!</span>
              </div>
            </div>
          )}

          {/* Footer links */}
          <div className="mt-3 pt-3 border-t-2 border-dashed border-black/40">
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: '#333' }}
              >
                <span>✨</span>
                <span>about</span>
              </Link>
              <a
                href="https://forms.gle/iWyp8pUumivZDMxr7"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: '#333' }}
              >
                <span>💬</span>
                <span>feedback</span>
              </a>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowDeleteAccount(true)
                  }}
                  className="px-3 py-1.5 text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.5)', color: '#e74c3c' }}
                >
                  <span>🗑️</span>
                  <span>delete</span>
                </button>
              )}
            </div>
          </div>
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

      {/* Delete Account Modal */}
      <DeleteAccount isOpen={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} />
    </>
  )
}
