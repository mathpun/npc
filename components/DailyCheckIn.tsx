'use client'

import { useState, useEffect, useCallback } from 'react'
import { MOOD_OPTIONS } from '@/lib/checkin-prompts'
import { useTheme } from '@/lib/ThemeContext'
import StreakDisplay, { getStreakMilestone } from './StreakDisplay'

interface StreakInfo {
  currentStreak: number
  longestStreak: number
  isNewRecord: boolean
}

interface DailyCheckInProps {
  userId: string
  userName: string
  onComplete: () => void
  onSkip: () => void
}

export default function DailyCheckIn({ userId, userName, onComplete, onSkip }: DailyCheckInProps) {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState<string[]>([])
  const [responses, setResponses] = useState<string[]>([])
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null)

  // Local fallback question in case API fails completely
  const localFallbackQuestions = [
    `Hey ${userName}! What's one thing on your mind right now?`,
  ]

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkin?userId=${userId}`)
      const data = await res.json()

      if (data.hasCheckedInToday) {
        onComplete()
        return
      }

      // Use API questions if available and valid, otherwise use local fallback
      const questionsToUse = (data.questions && Array.isArray(data.questions) && data.questions.length > 0)
        ? data.questions
        : localFallbackQuestions

      setQuestions(questionsToUse)
      setResponses(new Array(questionsToUse.length).fill(''))
    } catch (err) {
      console.error('Failed to fetch questions:', err)
      // Use local fallback on error
      setQuestions(localFallbackQuestions)
      setResponses(new Array(localFallbackQuestions.length).fill(''))
    }
    setLoading(false)
  }, [userId, onComplete])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleResponseChange = (index: number, value: string) => {
    const newResponses = [...responses]
    newResponses[index] = value
    setResponses(newResponses)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          questions,
          responses,
          mood: selectedMood,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to save check-in')
      }

      const data = await res.json()

      // Show success screen with streak info
      if (data.streak) {
        setStreakInfo(data.streak)
        setShowSuccess(true)
        // Auto-close after showing streak celebration
        setTimeout(() => {
          onComplete()
        }, 3000)
      } else {
        onComplete()
      }
    } catch (err) {
      setError('Failed to save your check-in. Please try again.')
      console.error('Failed to submit:', err)
    }
    setSubmitting(false)
  }

  const handleSkip = () => {
    setShowSkipConfirm(true)
  }

  const confirmSkip = () => {
    onSkip()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="relative p-8 text-center"
          style={{
            backgroundColor: theme.colors.backgroundAccent,
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '8px 8px 0 black',
          }}
        >
          <div className="text-5xl animate-bounce mb-4">📝</div>
          <p className="font-bold text-lg">preparing your check-in...</p>
        </div>
      </div>
    )
  }

  // This shouldn't happen now since we always have fallback questions,
  // but keep it as a safety net
  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onSkip} />
        <div
          className="relative w-full max-w-md p-6"
          style={{
            backgroundColor: theme.colors.buttonDanger,
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '8px 8px 0 black',
          }}
        >
          <p className="text-center font-bold mb-4">couldn&apos;t load check-in questions</p>
          <button
            onClick={onSkip}
            className="w-full py-3 font-bold"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            close
          </button>
        </div>
      </div>
    )
  }

  const isLastQuestion = currentQuestion === questions.length - 1
  const canSubmit = responses.some(r => r.trim().length > 0)
  const progress = ((currentQuestion + 1) / questions.length) * 100

  // Success screen with streak celebration
  if (showSuccess && streakInfo) {
    const milestone = getStreakMilestone(streakInfo.currentStreak)

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-black">
        <div className="absolute inset-0 bg-black/50" />
        <div
          className="relative w-full max-w-md p-8 text-center animate-bounce-in"
          style={{
            backgroundColor: theme.colors.backgroundAccent,
            border: '4px solid black',
            borderRadius: '24px',
            boxShadow: '8px 8px 0 black',
            animation: 'bounceIn 0.5s ease-out',
          }}
        >
          {/* Streak display */}
          <div className="mb-6">
            <StreakDisplay
              currentStreak={streakInfo.currentStreak}
              longestStreak={streakInfo.longestStreak}
              isNewRecord={streakInfo.isNewRecord}
              size="large"
            />
          </div>

          {/* Celebration message */}
          <h2 className="text-2xl font-black mb-2">
            {streakInfo.currentStreak === 1
              ? "Great start! 🌟"
              : milestone
                ? `${milestone.emoji} ${milestone.message}`
                : `${streakInfo.currentStreak} days strong! 💪`}
          </h2>

          <p
            className="text-base mb-6"
            style={{ color: theme.colors.textMuted }}
          >
            {streakInfo.currentStreak === 1
              ? "You've started your journey! Come back tomorrow to keep the streak going."
              : "Keep showing up every day - you've got this!"}
          </p>

          <button
            onClick={onComplete}
            className="px-8 py-3 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              border: '3px solid black',
              borderRadius: '16px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            awesome! ✨
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-black">
      <div className="absolute inset-0 bg-black/50" onClick={handleSkip} />

      {/* Skip confirmation modal */}
      {showSkipConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSkipConfirm(false)} />
          <div
            className="relative w-full max-w-sm p-6"
            style={{
              backgroundColor: theme.colors.accent2,
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '8px 8px 0 black',
            }}
          >
            <h3 className="text-lg font-bold mb-3 text-center">skip check-in?</h3>
            <p className="text-sm text-center mb-4">
              you can always come back later today!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="flex-1 py-2 font-bold"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                stay
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 py-2 font-bold"
                style={{
                  backgroundColor: theme.colors.buttonDanger,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main modal */}
      <div
        className="relative w-full max-w-lg p-6"
        style={{
          backgroundColor: theme.colors.backgroundAccent,
          border: '4px solid black',
          borderRadius: '20px',
          boxShadow: '8px 8px 0 black',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center font-bold hover:scale-110 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '50%',
          }}
        >
          X
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🔥</div>
          <h2 className="text-xl font-bold">Daily Check-In</h2>
          <p className="text-sm">hey {userName}! quick check-in time</p>
        </div>

        {/* Progress bar - only show if multiple questions */}
        {questions.length > 1 && (
          <div className="mb-6">
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: 'white', border: '2px solid black' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${theme.colors.accent1}, ${theme.colors.accent2}, ${theme.colors.accent4})`,
                }}
              />
            </div>
            <p className="text-xs text-center mt-1 font-bold">
              {currentQuestion + 1} of {questions.length}
            </p>
          </div>
        )}

        {/* Question card */}
        <div
          className="p-4 mb-4"
          style={{
            backgroundColor: 'white',
            border: '3px solid black',
            borderRadius: '16px',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <p className="font-bold mb-3 text-lg">
            {questions.length > 1 && `${currentQuestion + 1}. `}{questions[currentQuestion]}
          </p>
          <textarea
            value={responses[currentQuestion]}
            onChange={(e) => handleResponseChange(currentQuestion, e.target.value)}
            placeholder="what's on your mind..."
            rows={4}
            className="w-full px-3 py-2 text-base resize-none"
            style={{
              border: '2px solid black',
              borderRadius: '12px',
              backgroundColor: '#f9f9f9',
            }}
          />
        </div>

        {/* Mood picker (shown on last question) */}
        {isLastQuestion && (
          <div className="mb-4">
            <p className="font-bold mb-2 text-center">how are you feeling?</p>
            <div className="flex justify-center gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`w-12 h-12 text-2xl flex items-center justify-center transition-transform ${
                    selectedMood === mood.value ? 'scale-125' : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: selectedMood === mood.value ? theme.colors.accent2 : 'white',
                    border: '3px solid black',
                    borderRadius: '50%',
                    boxShadow: selectedMood === mood.value ? '3px 3px 0 black' : 'none',
                  }}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p
            className="text-center text-sm mb-4 p-2"
            style={{
              backgroundColor: theme.colors.buttonDanger,
              border: '2px solid black',
              borderRadius: '8px',
            }}
          >
            {error}
          </p>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {questions.length > 1 && currentQuestion > 0 ? (
            <button
              onClick={handleBack}
              className="px-4 py-3 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              back
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="px-4 py-3 font-bold hover:scale-105 transition-transform opacity-70"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              maybe later
            </button>
          )}

          <button
            onClick={isLastQuestion ? handleSubmit : handleNext}
            disabled={submitting}
            className="flex-1 py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            {submitting ? 'saving...' : isLastQuestion ? (canSubmit ? 'check in 🔥' : 'skip') : 'next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
