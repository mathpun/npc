'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  isNewRecord?: boolean
  size?: 'small' | 'medium' | 'large'
  showLongest?: boolean
}

export default function StreakDisplay({
  currentStreak,
  longestStreak,
  isNewRecord = false,
  size = 'medium',
  showLongest = true,
}: StreakDisplayProps) {
  const { theme } = useTheme()
  const [showCelebration, setShowCelebration] = useState(false)
  const [animateFlame, setAnimateFlame] = useState(false)

  useEffect(() => {
    if (isNewRecord) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isNewRecord])

  useEffect(() => {
    // Continuous flame animation
    const interval = setInterval(() => {
      setAnimateFlame(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const sizeConfig = {
    small: { flame: 'text-2xl', number: 'text-lg', container: 'p-2 gap-1' },
    medium: { flame: 'text-4xl', number: 'text-2xl', container: 'p-3 gap-2' },
    large: { flame: 'text-6xl', number: 'text-4xl', container: 'p-4 gap-3' },
  }

  const config = sizeConfig[size]

  // Get streak tier for visual styling
  const getStreakTier = (streak: number) => {
    if (streak >= 30) return { color: '#FF1493', glow: '#FF69B4', label: 'LEGENDARY' }
    if (streak >= 14) return { color: '#FFD700', glow: '#FFA500', label: 'ON FIRE' }
    if (streak >= 7) return { color: '#FF6B6B', glow: '#FF4444', label: 'HOT' }
    if (streak >= 3) return { color: '#FFA07A', glow: '#FF7F50', label: 'WARMING UP' }
    return { color: '#87CEEB', glow: '#4169E1', label: '' }
  }

  const tier = getStreakTier(currentStreak)

  // Get flame emoji based on streak
  const getFlameEmoji = (streak: number) => {
    if (streak >= 30) return '🔥💫'
    if (streak >= 14) return '🔥✨'
    if (streak >= 7) return '🔥'
    if (streak >= 3) return '🔥'
    if (streak >= 1) return '🕯️'
    return '💤'
  }

  return (
    <div className="relative">
      {/* Celebration overlay for new records */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl animate-bounce">🎉</div>
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Main streak display */}
      <div
        className={`relative inline-flex items-center ${config.container} rounded-2xl transition-all duration-300`}
        style={{
          backgroundColor: theme.colors.backgroundAlt,
          border: `3px solid ${tier.color}`,
          boxShadow: currentStreak > 0
            ? `0 0 ${currentStreak > 7 ? '20px' : '10px'} ${tier.glow}40, 4px 4px 0 black`
            : '4px 4px 0 black',
        }}
      >
        {/* Flame */}
        <div
          className={`${config.flame} transition-transform duration-300`}
          style={{
            transform: animateFlame && currentStreak > 0 ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
            filter: currentStreak >= 7 ? 'drop-shadow(0 0 8px orange)' : 'none',
          }}
        >
          {getFlameEmoji(currentStreak)}
        </div>

        {/* Streak number */}
        <div className="flex flex-col items-start">
          <div
            className={`${config.number} font-black leading-none`}
            style={{ color: tier.color }}
          >
            {currentStreak}
          </div>
          <div
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: theme.colors.textMuted }}
          >
            {currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Tier label for big streaks */}
        {tier.label && (
          <div
            className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-black rounded-full animate-pulse"
            style={{
              backgroundColor: tier.color,
              color: 'white',
              boxShadow: `0 0 10px ${tier.glow}`,
            }}
          >
            {tier.label}
          </div>
        )}
      </div>

      {/* Longest streak */}
      {showLongest && longestStreak > 0 && (
        <div
          className="mt-2 text-center text-sm font-medium"
          style={{ color: theme.colors.textMuted }}
        >
          best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'} 👑
        </div>
      )}

      {/* New record banner */}
      {isNewRecord && (
        <div
          className="mt-2 text-center text-sm font-black animate-bounce"
          style={{ color: '#FFD700' }}
        >
          🏆 NEW PERSONAL BEST! 🏆
        </div>
      )}
    </div>
  )
}

// Milestone messages for different streak levels
export const STREAK_MILESTONES = {
  3: { emoji: '🔥', message: "You're warming up! 3 days straight!" },
  7: { emoji: '🔥', message: "A whole week! You're on fire!" },
  14: { emoji: '⭐', message: "Two weeks strong! Unstoppable!" },
  21: { emoji: '🌟', message: "21 days! This is becoming a habit!" },
  30: { emoji: '💫', message: "30 DAYS! You're absolutely legendary!" },
  50: { emoji: '🏆', message: "50 days! Hall of fame material!" },
  100: { emoji: '👑', message: "100 DAYS! You've achieved greatness!" },
}

export function getStreakMilestone(streak: number): { emoji: string; message: string } | null {
  const milestones = Object.keys(STREAK_MILESTONES)
    .map(Number)
    .sort((a, b) => b - a)

  for (const milestone of milestones) {
    if (streak === milestone) {
      return STREAK_MILESTONES[milestone as keyof typeof STREAK_MILESTONES]
    }
  }
  return null
}
