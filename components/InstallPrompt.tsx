'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa_install_dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // For iOS, show manual instructions if not in standalone
    if (ios && !standalone) {
      // Delay showing to not be annoying on first visit
      const timer = setTimeout(() => {
        const visited = localStorage.getItem('pwa_visited')
        if (visited) {
          setShowPrompt(true)
        } else {
          localStorage.setItem('pwa_visited', 'true')
        }
      }, 3000)
      return () => clearTimeout(timer)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
  }

  if (!showPrompt || isStandalone) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 p-4 safe-area-bottom sm:left-auto sm:right-4 sm:max-w-sm"
      style={{
        backgroundColor: 'white',
        border: '3px solid black',
        borderRadius: '16px',
        boxShadow: '6px 6px 0 black',
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-sm font-bold"
        style={{
          backgroundColor: theme.colors.accent1,
          border: '2px solid black',
          borderRadius: '50%',
        }}
      >
        ✕
      </button>

      <div className="flex items-start gap-3">
        <div className="text-3xl">📱</div>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">Add npc to your phone!</h3>
          {isIOS ? (
            <p className="text-xs opacity-80">
              Tap <span className="inline-block px-1 bg-gray-200 rounded">⎙</span> then "Add to Home Screen" for the best experience
            </p>
          ) : (
            <p className="text-xs opacity-80">
              Install the app for quick access - no app store needed!
            </p>
          )}
        </div>
      </div>

      {!isIOS && deferredPrompt && (
        <button
          onClick={handleInstall}
          className="w-full mt-3 py-2 font-bold text-sm hover:scale-105 transition-transform"
          style={{
            backgroundColor: theme.colors.buttonSuccess,
            border: '2px solid black',
            borderRadius: '9999px',
            boxShadow: '2px 2px 0 black',
          }}
        >
          Install App ✨
        </button>
      )}
    </div>
  )
}
