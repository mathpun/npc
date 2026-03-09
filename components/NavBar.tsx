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

  // Main nav tabs - 7 core items
  const navItems = [
    { href: '/', icon: '🏠', label: 'home', color: '#FF6B9D' },
    { href: '/today', icon: '🔮', label: 'today', color: '#9B59B6' },
    { href: '/chat', icon: '💬', label: 'chat', color: '#7BED9F' },
    { href: '/create', icon: '✨', label: 'create', color: '#DDA0DD' },
    { href: '/chat?tab=growth', icon: '🌀', label: 'mind wrapped', color: '#FDCB6E' },
    { href: '/journal', icon: '📓', label: 'journal', color: '#FFE4EC' },
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
            background: `linear-gradient(165deg,
              #FF6B9D 0%,
              #C44DFF 25%,
              #7B68EE 50%,
              #4ECDC4 75%,
              #95E1D3 100%)`,
          }}
        >
          {/* Fun header */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl animate-pulse">⚡</span>
            <span className="font-black text-lg tracking-tight">where to?</span>
            <span className="text-2xl animate-pulse">⚡</span>
          </div>

          {/* Main nav - 3x3 grid for first 6, then centered row for last 2 */}
          <div className="grid grid-cols-3 gap-2.5 mb-2.5">
            {navItems.slice(0, 6).map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3.5 font-bold hover:scale-105 transition-all active:scale-95"
                  style={{
                    backgroundColor: item.color,
                    border: '3px solid black',
                    borderRadius: '16px',
                    boxShadow: active ? '4px 4px 0 black' : '3px 3px 0 black',
                  }}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-[11px] font-black text-center leading-tight">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Last row - centered */}
          <div className="flex justify-center gap-2.5 mb-3">
            {[...navItems.slice(6), { href: '/parent', icon: '👨‍👩‍👧', label: 'parent dash', color: '#FD79A8' }].map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3.5 font-bold hover:scale-105 transition-all active:scale-95"
                  style={{
                    backgroundColor: item.color,
                    border: '3px solid black',
                    borderRadius: '16px',
                    boxShadow: active ? '4px 4px 0 black' : '3px 3px 0 black',
                    minWidth: '100px',
                  }}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-[11px] font-black text-center leading-tight">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Settings row */}
          <div className="flex gap-2.5 mb-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setShowThemePicker(true)
              }}
              className="flex-1 flex items-center justify-center gap-2 p-3 font-bold hover:scale-105 transition-all active:scale-95"
              style={{
                backgroundColor: '#DDA0DD',
                border: '3px solid black',
                borderRadius: '14px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              <span className="text-xl">🎨</span>
              <span className="text-sm font-black">skins</span>
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowChangePassword(true)
                }}
                className="flex-1 flex items-center justify-center gap-2 p-3 font-bold hover:scale-105 transition-all active:scale-95"
                style={{
                  backgroundColor: '#FFD93D',
                  border: '3px solid black',
                  borderRadius: '14px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                <span className="text-xl">⚙️</span>
                <span className="text-sm font-black">settings</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 p-3 font-bold hover:scale-105 transition-all active:scale-95"
                style={{
                  backgroundColor: '#7BED9F',
                  border: '3px solid black',
                  borderRadius: '14px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                <span className="text-xl">👋</span>
                <span className="text-sm font-black">log in</span>
              </Link>
            )}
          </div>

          {isLoggedIn && (
            <div className="text-center mb-3">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 font-black text-sm"
                style={{
                  backgroundColor: '#FFE66D',
                  border: '3px solid black',
                  borderRadius: '9999px',
                  boxShadow: '2px 2px 0 black',
                }}
              >
                <span className="text-lg">👻</span>
                <span>hi {userName}!</span>
              </div>
            </div>
          )}

          {/* Social links */}
          <div className="pt-3 border-t-2 border-black/20">
            <p className="text-center text-xs font-black mb-3 opacity-70">follow the vibes</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <a
                href="https://www.tiktok.com/@npc_theai"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-5 py-2.5 font-black hover:scale-105 transition-transform flex items-center gap-2 rounded-xl"
                style={{
                  backgroundColor: '#69C9D0',
                  color: 'black',
                  border: '3px solid black',
                  boxShadow: '3px 3px 0 #EE1D52',
                }}
              >
                <span className="text-lg">🎵</span>
                <span>TikTok</span>
              </a>
              <a
                href="https://www.instagram.com/npc_theai/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-5 py-2.5 font-black hover:scale-105 transition-transform flex items-center gap-2 rounded-xl"
                style={{
                  backgroundColor: '#E1306C',
                  color: 'white',
                  border: '3px solid black',
                  boxShadow: '3px 3px 0 #833AB4',
                }}
              >
                <span className="text-lg">📸</span>
                <span>Insta</span>
              </a>
            </div>

            {/* Other links */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { href: '/about', icon: '✨', label: 'about', isLink: true, color: '#98D8C8' },
                { href: '/privacy', icon: '🔒', label: 'privacy', isLink: true, color: '#F7DC6F' },
                { href: '/chat?tab=growth&subtab=co-design', icon: '🛠️', label: 'co-design', isLink: true, color: '#BB8FCE' },
                { href: 'https://forms.gle/iWyp8pUumivZDMxr7', icon: '💬', label: 'feedback', isExternal: true, color: '#85C1E9' },
              ].map((item) => (
                item.isExternal ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1 rounded-full"
                    style={{ backgroundColor: item.color, border: '2px solid black' }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1 rounded-full"
                    style={{ backgroundColor: item.color, border: '2px solid black' }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              ))}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowDeleteAccount(true)
                  }}
                  className="px-3 py-1.5 text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1 rounded-full"
                  style={{ backgroundColor: '#F1948A', border: '2px solid black' }}
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
