'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface TouchGrassProps {
  userId: string
  sessionMinutes: number
  onClose: () => void
  onComplete: () => void
}

export default function TouchGrass({ userId, sessionMinutes, onClose, onComplete }: TouchGrassProps) {
  const { theme } = useTheme()
  const [step, setStep] = useState<'prompt' | 'camera' | 'success'>('prompt')
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    pointsEarned: number
    totalPoints: number
    streakDays: number
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoData(reader.result as string)
        setStep('camera')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (withPhoto: boolean) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/touch-grass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          photoData: withPhoto ? photoData : null,
          sessionMinutes,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setStep('success')
      }
    } catch (err) {
      console.error('Failed to submit:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkipPhoto = () => {
    handleSubmit(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          border: '4px solid black',
          boxShadow: '8px 8px 0 black',
          background: `linear-gradient(180deg, #90EE90 0%, #7BED9F 50%, #4ECDC4 100%)`,
        }}
      >
        {step === 'prompt' && (
          <div className="p-5 text-center">
            {/* Header */}
            <div className="text-5xl mb-3 animate-bounce">🌿</div>
            <h2 className="text-2xl font-black mb-2">time to touch grass!</h2>
            <p className="text-sm mb-4 opacity-80">
              you've been chatting for {sessionMinutes}+ minutes.
              your brain deserves a nature break!
            </p>

            {/* Stats preview */}
            <div
              className="p-3 rounded-xl mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.5)', border: '2px solid black' }}
            >
              <div className="text-xs font-bold mb-1">earn grass points:</div>
              <div className="flex justify-center gap-4 text-sm">
                <span>🌱 +10 base</span>
                <span>📸 +10 photo</span>
                <span>⏱️ +5 long sesh</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 font-black text-base rounded-xl hover:scale-105 active:scale-95 transition-transform"
                style={{
                  backgroundColor: '#FFD93D',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                📸 take a grass pic (+20 pts)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              <button
                onClick={handleSkipPhoto}
                disabled={isSubmitting}
                className="w-full py-2.5 font-bold text-sm rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  border: '2px solid black',
                }}
              >
                {isSubmitting ? '...' : "i'll just go outside (+10 pts)"}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-bold opacity-60 hover:opacity-100"
              >
                maybe later
              </button>
            </div>
          </div>
        )}

        {step === 'camera' && photoData && (
          <div className="p-5 text-center">
            <h2 className="text-xl font-black mb-3">nice grass! 🌿</h2>

            {/* Photo preview */}
            <div
              className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden mb-4"
              style={{ border: '3px solid black', boxShadow: '4px 4px 0 black' }}
            >
              <img
                src={photoData}
                alt="Your grass"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="w-full py-3 font-black text-base rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                style={{
                  backgroundColor: '#FFD93D',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                {isSubmitting ? 'submitting...' : '✨ submit for +25 pts'}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 text-xs font-bold opacity-60 hover:opacity-100"
              >
                retake photo
              </button>
            </div>
          </div>
        )}

        {step === 'success' && result && (
          <div className="p-5 text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-2xl font-black mb-2">+{result.pointsEarned} grass pts!</h2>
            <p className="text-sm mb-4">{result.message}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.5)', border: '2px solid black' }}
              >
                <div className="text-2xl font-black">{result.totalPoints}</div>
                <div className="text-[10px] font-bold opacity-70">total pts</div>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.5)', border: '2px solid black' }}
              >
                <div className="text-2xl font-black">{result.streakDays}🔥</div>
                <div className="text-[10px] font-bold opacity-70">day streak</div>
              </div>
            </div>

            <button
              onClick={() => {
                onComplete()
                onClose()
              }}
              className="w-full py-3 font-black text-base rounded-xl hover:scale-105 active:scale-95 transition-transform"
              style={{
                backgroundColor: '#FFD93D',
                border: '3px solid black',
                boxShadow: '4px 4px 0 black',
              }}
            >
              back to chat 💬
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Small indicator component to show in chat
export function GrassPointsBadge({ userId }: { userId: string }) {
  const { theme } = useTheme()
  const [stats, setStats] = useState<{ totalPoints: number; streakDays: number } | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/touch-grass?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setStats({ totalPoints: data.totalPoints, streakDays: data.streakDays })
        }
      } catch (err) {
        console.error('Failed to fetch grass stats:', err)
      }
    }
    if (userId) fetchStats()
  }, [userId])

  if (!stats || stats.totalPoints === 0) return null

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full"
      style={{
        backgroundColor: '#90EE90',
        border: '2px solid black',
      }}
    >
      <span>🌿</span>
      <span>{stats.totalPoints}</span>
      {stats.streakDays > 1 && <span>🔥{stats.streakDays}</span>}
    </div>
  )
}
