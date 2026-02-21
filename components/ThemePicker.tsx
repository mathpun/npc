'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import { themeList } from '@/lib/themes'

// Helper to determine if text should be white or black based on background
function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

interface ThemePickerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ThemePicker({ isOpen, onClose }: ThemePickerProps) {
  const { theme, setTheme, themeId } = useTheme()

  if (!isOpen) return null

  const handleThemeSelect = (newThemeId: string) => {
    setTheme(newThemeId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-black"
        style={{
          backgroundColor: 'white',
          border: '4px solid black',
          borderRadius: '20px',
          boxShadow: '8px 8px 0 black',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center font-bold text-xl hover:scale-110 transition-transform"
          style={{
            backgroundColor: theme.colors.accent1,
            border: '3px solid black',
            borderRadius: '50%',
          }}
        >
          X
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎨</div>
          <h2 className="text-2xl font-bold">pick ur vibe!</h2>
          <p className="text-sm text-gray-600">choose a color skin for the whole app</p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themeList.map((t) => {
            const isActive = themeId === t.id

            return (
              <button
                key={t.id}
                onClick={() => handleThemeSelect(t.id)}
                className={`relative p-4 text-left transition-all duration-200 hover:scale-105 ${
                  isActive ? 'ring-4 ring-black' : ''
                }`}
                style={{
                  backgroundColor: t.colors.background,
                  border: '3px solid black',
                  borderRadius: '16px',
                  boxShadow: isActive ? '6px 6px 0 black' : '4px 4px 0 black',
                }}
              >
                {/* Active checkmark */}
                {isActive && (
                  <div
                    className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center text-lg font-bold"
                    style={{
                      backgroundColor: '#90EE90',
                      border: '3px solid black',
                      borderRadius: '50%',
                    }}
                  >
                    ✓
                  </div>
                )}

                {/* Theme header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{t.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: getContrastTextColor(t.colors.background) }}>{t.name}</h3>
                    <p className="text-xs" style={{ color: getContrastTextColor(t.colors.background), opacity: 0.7 }}>{t.description}</p>
                  </div>
                </div>

                {/* Color swatches */}
                <div className="flex gap-2">
                  {t.colors.primary.slice(0, 6).map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: color,
                        border: '2px solid black',
                      }}
                    />
                  ))}
                </div>

                {/* Preview elements */}
                <div className="mt-3 flex gap-2 items-center">
                  <div
                    className="px-3 py-1 text-xs font-bold rounded-full"
                    style={{
                      backgroundColor: t.colors.buttonPrimary,
                      color: getContrastTextColor(t.colors.buttonPrimary),
                      border: '2px solid black',
                    }}
                  >
                    button
                  </div>
                  <div
                    className="px-3 py-1 text-xs font-bold rounded-full"
                    style={{
                      backgroundColor: t.colors.accent2,
                      color: getContrastTextColor(t.colors.accent2),
                      border: '2px solid black',
                    }}
                  >
                    accent
                  </div>
                  <div
                    className="px-3 py-1 text-xs font-bold rounded-full"
                    style={{
                      backgroundColor: t.colors.userMessage,
                      color: getContrastTextColor(t.colors.userMessage),
                      border: '2px solid black',
                    }}
                  >
                    chat
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            looks good!
          </button>
        </div>
      </div>
    </div>
  )
}

// Theme picker button for navbar
export function ThemePickerButton({ onClick }: { onClick: () => void }) {
  const { theme } = useTheme()

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 font-bold hover:scale-105 transition-transform"
      style={{
        backgroundColor: '#FF69B4', // hot pink - distinct from other nav colors
        border: '3px solid black',
        borderRadius: '9999px',
        boxShadow: '3px 3px 0 black',
      }}
      title="Change color skin"
    >
      <span className="text-xl">🎨</span>
      <span className="hidden sm:inline">skin</span>
    </button>
  )
}
