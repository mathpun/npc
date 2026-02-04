'use client'

import { useState, useEffect, useCallback } from 'react'
import { MOOD_OPTIONS } from '@/lib/checkin-prompts'
import { useTheme } from '@/lib/ThemeContext'

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

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkin?userId=${userId}`)
      const data = await res.json()

      if (data.hasCheckedInToday) {
        onComplete()
        return
      }

      if (data.questions) {
        setQuestions(data.questions)
        setResponses(new Array(data.questions.length).fill(''))
      }
    } catch (err) {
      setError('Failed to load questions')
      console.error('Failed to fetch questions:', err)
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

      onComplete()
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

  if (error && questions.length === 0) {
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
          <p className="text-center font-bold mb-4">{error}</p>
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
          <div className="text-4xl mb-2">✨</div>
          <h2 className="text-xl font-bold">Daily Check-In</h2>
          <p className="text-sm">hey {userName}! quick check-in time 📝</p>
        </div>

        {/* Progress bar */}
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
            {currentQuestion + 1} of {questions.length} questions
          </p>
        </div>

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
            {currentQuestion + 1}. {questions[currentQuestion]}
          </p>
          <textarea
            value={responses[currentQuestion]}
            onChange={(e) => handleResponseChange(currentQuestion, e.target.value)}
            placeholder="your answer..."
            rows={3}
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
          {currentQuestion > 0 ? (
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
              skip for now
            </button>
          )}

          <button
            onClick={isLastQuestion ? handleSubmit : handleNext}
            disabled={submitting}
            className="flex-1 py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
            style={{
              backgroundColor: isLastQuestion ? theme.colors.buttonPrimary : theme.colors.buttonSecondary,
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            {submitting ? 'saving...' : isLastQuestion ? (canSubmit ? 'done ✓' : 'skip all') : 'next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
