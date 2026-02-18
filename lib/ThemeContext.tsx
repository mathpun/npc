'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Theme, themes, defaultTheme } from './themes'

interface ThemeContextType {
  theme: Theme
  setTheme: (themeId: string) => void
  themeId: string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'npc_color_skin'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(defaultTheme.id)
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && themes[saved]) {
      setThemeId(saved)
    }
    setMounted(true)
  }, [])

  // Apply CSS variables when theme changes
  useEffect(() => {
    if (!mounted) return

    const theme = themes[themeId] || defaultTheme
    const root = document.documentElement

    // Set CSS variables
    root.style.setProperty('--theme-background', theme.colors.background)
    root.style.setProperty('--theme-background-alt', theme.colors.backgroundAlt)
    root.style.setProperty('--theme-background-accent', theme.colors.backgroundAccent)
    root.style.setProperty('--theme-text', theme.colors.text)
    root.style.setProperty('--theme-text-muted', theme.colors.textMuted)
    root.style.setProperty('--theme-glow', theme.colors.glow)
    root.style.setProperty('--theme-accent1', theme.colors.accent1)
    root.style.setProperty('--theme-accent2', theme.colors.accent2)
    root.style.setProperty('--theme-accent3', theme.colors.accent3)
    root.style.setProperty('--theme-accent4', theme.colors.accent4)
    root.style.setProperty('--theme-accent5', theme.colors.accent5)
    root.style.setProperty('--theme-button-primary', theme.colors.buttonPrimary)
    root.style.setProperty('--theme-button-secondary', theme.colors.buttonSecondary)
    root.style.setProperty('--theme-button-success', theme.colors.buttonSuccess)

    // Update body background and text color
    document.body.style.backgroundColor = theme.colors.background
    document.body.style.color = theme.colors.text

    // Handle dark theme class for text colors
    if (themeId === 'dark') {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
  }, [themeId, mounted])

  const setTheme = (newThemeId: string) => {
    if (themes[newThemeId]) {
      setThemeId(newThemeId)
      localStorage.setItem(STORAGE_KEY, newThemeId)
    }
  }

  const theme = themes[themeId] || defaultTheme

  // Prevent flash of wrong theme
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
