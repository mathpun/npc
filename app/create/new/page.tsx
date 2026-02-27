'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/lib/ThemeContext'

// Vibe options with visual styling
const VIBE_OPTIONS = [
  {
    id: 'cozy-magical',
    label: 'Cozy & Magical',
    emoji: '✨',
    colors: ['#FFB6C1', '#FFD700', '#FFA07A'],
    description: 'Warm, sparkly, and comforting',
  },
  {
    id: 'dark-mysterious',
    label: 'Dark & Mysterious',
    emoji: '🌙',
    colors: ['#4B0082', '#2F0147', '#1a1a2e'],
    description: 'Shadowy secrets and intrigue',
  },
  {
    id: 'chaotic-wild',
    label: 'Chaotic & Wild',
    emoji: '🌪️',
    colors: ['#FF1493', '#00FF00', '#FF4500'],
    description: 'Unpredictable and energetic',
  },
  {
    id: 'epic-fantasy',
    label: 'Epic Fantasy',
    emoji: '🏰',
    colors: ['#FFD700', '#8B4513', '#4169E1'],
    description: 'Grand adventures and quests',
  },
  {
    id: 'scifi-future',
    label: 'Sci-Fi Future',
    emoji: '🚀',
    colors: ['#00CED1', '#7B68EE', '#00FF7F'],
    description: 'Neon tech and space vibes',
  },
  {
    id: 'whimsical-silly',
    label: 'Whimsical & Silly',
    emoji: '🎪',
    colors: ['#FF69B4', '#87CEEB', '#98FB98'],
    description: 'Playful and lighthearted',
  },
]

// Loading messages for generation step
const LOADING_MESSAGES = [
  'Imagining your world...',
  'Weaving magic into existence...',
  'Creating characters...',
  'Building landscapes...',
  'Adding mysterious secrets...',
  'Painting your world...',
  'Almost there...',
]

export default function NewWorldWizard() {
  const router = useRouter()
  const { theme } = useTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Form data
  const [worldName, setWorldName] = useState('')
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [worldSecret, setWorldSecret] = useState('')
  const [weirdThing, setWeirdThing] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [generatedWorld, setGeneratedWorld] = useState<{
    id: number
    coverImageUrl?: string
  } | null>(null)
  const [generationComplete, setGenerationComplete] = useState(false)

  useEffect(() => {
    const savedUserId = localStorage.getItem('npc_user_id')
    if (savedUserId) {
      setUserId(savedUserId)
    } else {
      router.push('/onboarding')
    }
  }, [router])

  // Cycle through loading messages
  useEffect(() => {
    if (isGenerating && !generationComplete) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isGenerating, generationComplete])

  const goToStep = (newStep: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setStep(newStep)
      setIsTransitioning(false)
    }, 300)
  }

  const handleVibeToggle = (vibeId: string) => {
    setSelectedVibes((prev) => {
      if (prev.includes(vibeId)) {
        return prev.filter((v) => v !== vibeId)
      } else if (prev.length < 2) {
        return [...prev, vibeId]
      }
      return prev
    })
  }

  const handleNextQuestion = () => {
    if (questionIndex === 0) {
      setQuestionIndex(1)
    } else {
      goToStep(4)
      startGeneration()
    }
  }

  const startGeneration = async () => {
    if (!userId) return

    setIsGenerating(true)
    setLoadingMessageIndex(0)

    try {
      // Step 1: Create the world
      const vibeLabels = selectedVibes
        .map((id) => VIBE_OPTIONS.find((v) => v.id === id)?.label)
        .filter(Boolean)
        .join(', ')

      const createRes = await fetch('/api/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          worldName: worldName.trim() || 'My World',
          worldEmoji: VIBE_OPTIONS.find((v) => v.id === selectedVibes[0])?.emoji || '🌍',
          worldVibe: vibeLabels || null,
          worldDescription: [
            worldSecret ? `Secret: ${worldSecret}` : '',
            weirdThing ? `Weirdest thing: ${weirdThing}` : '',
          ]
            .filter(Boolean)
            .join('\n') || null,
          colorTheme: VIBE_OPTIONS.find((v) => v.id === selectedVibes[0])?.colors[0] || '#FF69B4',
        }),
      })

      if (!createRes.ok) {
        throw new Error('Failed to create world')
      }

      const { world } = await createRes.json()
      setGeneratedWorld({ id: world.id })

      // Step 2: Generate starter elements
      await fetch(`/api/world/${world.id}/generate-starter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          worldName: worldName.trim() || 'My World',
          vibes: vibeLabels,
          secret: worldSecret,
          weirdThing: weirdThing,
        }),
      })

      // Step 3: Generate cover image
      const coverRes = await fetch(`/api/world/${world.id}/cover-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          worldName: worldName.trim() || 'My World',
          vibes: vibeLabels,
        }),
      })

      if (coverRes.ok) {
        const coverData = await coverRes.json()
        setGeneratedWorld((prev) => prev ? { ...prev, coverImageUrl: coverData.imageUrl } : null)
      }

      setGenerationComplete(true)
    } catch (err) {
      console.error('Error generating world:', err)
      // Still mark as complete to show any partial results
      setGenerationComplete(true)
    }
  }

  const handleEnterWorld = () => {
    if (generatedWorld?.id) {
      router.push(`/create/${generatedWorld.id}`)
    }
  }

  if (!userId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="text-6xl animate-bounce">✨</div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              fontSize: `${20 + Math.random() * 30}px`,
              opacity: 0.1,
            }}
          >
            {['✨', '🌟', '💫', '⭐', '🌙', '☁️'][Math.floor(Math.random() * 6)]}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {step < 4 && (
        <div className="relative z-10 pt-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: theme.colors.textMuted }}>
                Step {step} of 4
              </span>
              <button
                onClick={() => router.push('/create')}
                className="text-sm hover:underline"
                style={{ color: theme.colors.textMuted }}
              >
                Cancel
              </button>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: theme.colors.backgroundAlt, border: '2px solid black' }}
            >
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${(step / 4) * 100}%`,
                  backgroundColor: theme.colors.accent1,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div
        className={`flex-1 flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Step 1: Name Your World */}
        {step === 1 && (
          <div className="w-full max-w-md text-center">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: theme.colors.text }}
            >
              Name Your World
            </h1>
            <p className="mb-8" style={{ color: theme.colors.textMuted }}>
              What will you call this universe?
            </p>

            <input
              type="text"
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              placeholder="The Realm of..."
              autoFocus
              className="w-full p-4 text-xl text-center rounded-2xl mb-8 font-medium"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '3px solid black',
                boxShadow: '4px 4px 0 black',
                color: theme.colors.text,
              }}
            />

            <button
              onClick={() => goToStep(2)}
              disabled={!worldName.trim()}
              className="w-full py-4 text-xl font-bold rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              style={{
                backgroundColor: theme.colors.buttonPrimary,
                border: '3px solid black',
                boxShadow: '4px 4px 0 black',
                color: theme.colors.text,
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Pick Your Vibe */}
        {step === 2 && (
          <div className="w-full max-w-2xl text-center">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: theme.colors.text }}
            >
              Pick Your Vibe
            </h1>
            <p className="mb-8" style={{ color: theme.colors.textMuted }}>
              Choose 1-2 vibes for your world
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {VIBE_OPTIONS.map((vibe) => {
                const isSelected = selectedVibes.includes(vibe.id)
                return (
                  <button
                    key={vibe.id}
                    onClick={() => handleVibeToggle(vibe.id)}
                    className="relative p-4 rounded-2xl text-center transition-all duration-200 hover:scale-105"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${vibe.colors[0]}, ${vibe.colors[1]})`
                        : theme.colors.backgroundAlt,
                      border: isSelected ? '3px solid black' : '3px solid transparent',
                      boxShadow: isSelected ? '4px 4px 0 black' : 'none',
                    }}
                  >
                    <div className="text-4xl mb-2">{vibe.emoji}</div>
                    <div className="font-bold text-sm" style={{ color: theme.colors.text }}>
                      {vibe.label}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {vibe.description}
                    </div>
                    {isSelected && (
                      <div
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: '#22c55e', border: '2px solid black' }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => goToStep(1)}
                className="flex-1 py-4 text-lg font-bold rounded-2xl hover:scale-105 transition-transform"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '3px solid black',
                  color: theme.colors.text,
                }}
              >
                Back
              </button>
              <button
                onClick={() => goToStep(3)}
                disabled={selectedVibes.length === 0}
                className="flex-1 py-4 text-lg font-bold rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: theme.colors.buttonPrimary,
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                  color: theme.colors.text,
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Quick Questions */}
        {step === 3 && (
          <div className="w-full max-w-md text-center">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: theme.colors.text }}
            >
              Quick Questions
            </h1>
            <p className="mb-8" style={{ color: theme.colors.textMuted }}>
              Help us make your world unique!
            </p>

            {questionIndex === 0 ? (
              <div className="mb-8">
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ color: theme.colors.text }}
                >
                  If your world had a secret, what would it be?
                </h2>
                <textarea
                  value={worldSecret}
                  onChange={(e) => setWorldSecret(e.target.value)}
                  placeholder="Hidden beneath the crystal caves lies..."
                  rows={3}
                  autoFocus
                  className="w-full p-4 text-lg rounded-2xl resize-none"
                  style={{
                    backgroundColor: theme.colors.backgroundAlt,
                    border: '3px solid black',
                    boxShadow: '4px 4px 0 black',
                    color: theme.colors.text,
                  }}
                />
              </div>
            ) : (
              <div className="mb-8">
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ color: theme.colors.text }}
                >
                  What&apos;s the weirdest thing that could exist here?
                </h2>
                <textarea
                  value={weirdThing}
                  onChange={(e) => setWeirdThing(e.target.value)}
                  placeholder="A sentient cloud that tells bad jokes..."
                  rows={3}
                  autoFocus
                  className="w-full p-4 text-lg rounded-2xl resize-none"
                  style={{
                    backgroundColor: theme.colors.backgroundAlt,
                    border: '3px solid black',
                    boxShadow: '4px 4px 0 black',
                    color: theme.colors.text,
                  }}
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => (questionIndex === 0 ? goToStep(2) : setQuestionIndex(0))}
                className="flex-1 py-4 text-lg font-bold rounded-2xl hover:scale-105 transition-transform"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '3px solid black',
                  color: theme.colors.text,
                }}
              >
                Back
              </button>
              <button
                onClick={handleNextQuestion}
                className="flex-1 py-4 text-lg font-bold rounded-2xl hover:scale-105 transition-transform"
                style={{
                  backgroundColor: theme.colors.buttonPrimary,
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                  color: theme.colors.text,
                }}
              >
                {questionIndex === 0 ? 'Next' : 'Create World!'}
              </button>
            </div>

            <button
              onClick={() => {
                if (questionIndex === 0) {
                  setQuestionIndex(1)
                } else {
                  goToStep(4)
                  startGeneration()
                }
              }}
              className="mt-4 text-sm hover:underline"
              style={{ color: theme.colors.textMuted }}
            >
              Skip this question
            </button>
          </div>
        )}

        {/* Step 4: Generating */}
        {step === 4 && (
          <div className="w-full max-w-md text-center">
            {!generationComplete ? (
              <>
                <div className="text-6xl mb-6 animate-bounce">
                  {['✨', '🌟', '💫', '🎨', '🌍'][loadingMessageIndex % 5]}
                </div>
                <h1
                  className="text-2xl sm:text-3xl font-bold mb-4"
                  style={{ color: theme.colors.text }}
                >
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </h1>
                <div className="flex justify-center gap-2 mb-8">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{
                        backgroundColor: theme.colors.accent1,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6 animate-bounce">🎉</div>
                <h1
                  className="text-3xl sm:text-4xl font-bold mb-4"
                  style={{ color: theme.colors.text }}
                >
                  {worldName || 'Your World'} is Ready!
                </h1>

                {generatedWorld?.coverImageUrl && (
                  <div
                    className="relative w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden"
                    style={{
                      border: '4px solid black',
                      boxShadow: '6px 6px 0 black',
                    }}
                  >
                    <Image
                      src={generatedWorld.coverImageUrl}
                      alt="World cover"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <p className="mb-8" style={{ color: theme.colors.textMuted }}>
                  We&apos;ve added some starter elements to get you going!
                </p>

                <button
                  onClick={handleEnterWorld}
                  className="w-full py-4 text-xl font-bold rounded-2xl hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: theme.colors.buttonSuccess,
                    border: '3px solid black',
                    boxShadow: '4px 4px 0 black',
                    color: theme.colors.text,
                  }}
                >
                  Enter Your World
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Custom animation styles */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
