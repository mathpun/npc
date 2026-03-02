'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface DailyInsightProps {
  userId: string
}

export default function DailyInsight({ userId }: DailyInsightProps) {
  const { theme } = useTheme()
  const [insight, setInsight] = useState<string | null>(null)
  const [emoji, setEmoji] = useState<string>('✨')
  const [isLoading, setIsLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchInsight = async () => {
      // Check if dismissed today
      const today = new Date().toISOString().split('T')[0]
      const dismissKey = `insight_dismissed_${today}`
      if (localStorage.getItem(dismissKey)) {
        setDismissed(true)
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/daily-insight?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setInsight(data.insight)
          setEmoji(data.emoji || '✨')
        }
      } catch (err) {
        console.error('Failed to fetch daily insight:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchInsight()
    }
  }, [userId])

  const handleDismiss = () => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`insight_dismissed_${today}`, 'true')
    setDismissed(true)
  }

  if (dismissed || (!isLoading && !insight)) {
    return null
  }

  return (
    <div
      className="p-4 rotate-1 relative"
      style={{
        backgroundColor: theme.colors.accent5,
        border: '3px solid black',
        borderRadius: '16px',
        boxShadow: '5px 5px 0 black',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center font-bold text-sm hover:scale-110 transition-transform"
        style={{
          backgroundColor: theme.colors.backgroundAlt,
          border: '2px solid black',
          borderRadius: '50%',
        }}
        title="Dismiss for today"
      >
        ×
      </button>

      {isLoading ? (
        <div className="flex items-center gap-3">
          <div className="text-3xl animate-bounce">✨</div>
          <div className="flex-1">
            <div
              className="h-4 rounded animate-pulse mb-2"
              style={{ backgroundColor: theme.colors.backgroundAlt, width: '80%' }}
            />
            <div
              className="h-4 rounded animate-pulse"
              style={{ backgroundColor: theme.colors.backgroundAlt, width: '60%' }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">{emoji}</div>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wide mb-1 opacity-70">
              Today's Insight
            </div>
            <p className="font-medium leading-relaxed">{insight}</p>
          </div>
        </div>
      )}
    </div>
  )
}
