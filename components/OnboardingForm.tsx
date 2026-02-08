'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const INTERESTS = [
  { name: 'Music', emoji: '🎵' },
  { name: 'Art', emoji: '🎨' },
  { name: 'Gaming', emoji: '🎮' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Reading', emoji: '📚' },
  { name: 'Writing', emoji: '✍️' },
  { name: 'Science', emoji: '🔬' },
  { name: 'Technology', emoji: '💻' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Cooking', emoji: '🍳' },
  { name: 'Photography', emoji: '📸' },
  { name: 'Dance', emoji: '💃' },
  { name: 'Theater', emoji: '🎭' },
  { name: 'Animals', emoji: '🐕' },
  { name: 'Nature', emoji: '🌿' },
  { name: 'Travel', emoji: '✈️' },
  { name: 'Social Media', emoji: '📱' },
  { name: 'Fitness', emoji: '💪' },
  { name: 'Movies', emoji: '🎬' },
  { name: 'Anime', emoji: '⚔️' },
]

const STEP_COLORS = ['#FF69B4', '#FFD700', '#90EE90']

interface FormData {
  name: string
  nickname: string
  currentAge: string
  password: string
  interests: string[]
  currentGoals: string
}

export default function OnboardingForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    nickname: '',
    currentAge: '',
    password: '',
    interests: [],
    currentGoals: '',
  })
  const [signupError, setSignupError] = useState('')

  const totalSteps = 3

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      setSignupError('')

      // Create user in database first
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            nickname: formData.nickname || formData.name, // default to username if no nickname
            age: parseInt(formData.currentAge),
            interests: formData.interests,
            goals: formData.currentGoals,
            password: formData.password,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setSignupError(data.error || 'Failed to create account')
          return
        }

        // Success - save profile locally
        const profile = {
          name: formData.nickname || formData.name, // use nickname for AI interactions
          currentAge: parseInt(formData.currentAge),
          interests: formData.interests,
          currentGoals: formData.currentGoals,
        }
        localStorage.setItem('youthai_profile', JSON.stringify(profile))
        localStorage.setItem('npc_user_id', data.id)

        router.push('/chat')
      } catch (err) {
        console.error('Failed to create user:', err)
        setSignupError('Something went wrong, please try again')
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0 &&
               formData.currentAge.trim().length > 0 &&
               parseInt(formData.currentAge) >= 13 &&
               parseInt(formData.currentAge) <= 24 &&
               formData.password.length >= 4
      case 2:
        return formData.interests.length >= 1
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto" style={{  }}>
      {/* Progress bar - hand drawn style */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300`}
              style={{
                backgroundColor: s <= step ? STEP_COLORS[s - 1] : 'white',
                border: '3px solid black',
                boxShadow: s <= step ? '4px 4px 0 black' : 'none',
                transform: s === step ? 'rotate(-3deg) scale(1.1)' : 'rotate(0deg)',
              }}
            >
              {s <= step ? ['👋', '❤️', '🚀'][s - 1] : s}
            </div>
          ))}
        </div>
        <div
          className="h-4 rounded-full overflow-hidden"
          style={{ backgroundColor: 'white', border: '3px solid black' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${(step / totalSteps) * 100}%`,
              background: 'linear-gradient(90deg, #FF69B4, #FFD700, #90EE90)',
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div
        className="p-8"
        style={{
          backgroundColor: 'white',
          border: '4px solid black',
          borderRadius: '20px',
          boxShadow: '8px 8px 0 black',
        }}
      >
        {/* Step 1: Name & Age */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <svg width="80" height="90" viewBox="0 0 60 70">
                  <ellipse cx="30" cy="45" rx="20" ry="25" fill="#FF69B4" stroke="black" strokeWidth="3"/>
                  <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
                  <circle cx="24" cy="18" r="4" fill="black"/>
                  <circle cx="36" cy="18" r="4" fill="black"/>
                  <circle cx="25" cy="17" r="1.5" fill="white"/>
                  <circle cx="37" cy="17" r="1.5" fill="white"/>
                  <path d="M24 28 Q30 32 36 28" stroke="black" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h2
                className="text-2xl font-bold mb-2 inline-block px-4 py-2 -rotate-1"
                style={{
                  backgroundColor: '#FFD700',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                let&apos;s get started!
              </h2>
              <p className="text-lg mt-4">first, a bit about you</p>
            </div>

            <div>
              <label className="block text-lg font-bold mb-2">pick a username</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="for logging in"
                className="w-full px-4 py-3 text-lg"
                style={{
                  backgroundColor: '#FFFACD',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-lg font-bold mb-2">what should the AI call you?</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="a nickname, your name, whatever feels right"
                className="w-full px-4 py-3 text-lg"
                style={{
                  backgroundColor: '#FFFACD',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              />
              <p
                className="text-xs mt-2 text-gray-600"
              >
                this is how npc will address you in chats
              </p>
            </div>

            <div>
              <label className="block text-lg font-bold mb-2">how old are you?</label>
              <input
                type="number"
                value={formData.currentAge}
                onChange={(e) => setFormData({ ...formData, currentAge: e.target.value })}
                placeholder="13-24"
                min={13}
                max={24}
                className="w-full px-4 py-3 text-lg"
                style={{
                  backgroundColor: '#FFFACD',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              />
              {formData.currentAge && (parseInt(formData.currentAge) < 13 || parseInt(formData.currentAge) > 24) && (
                <p
                  className="text-sm mt-2 px-3 py-2 inline-block"
                  style={{
                    backgroundColor: '#FFA500',
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  this app is for ages 13-24
                </p>
              )}
            </div>

            <div>
              <label className="block text-lg font-bold mb-2">create a password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="at least 4 characters"
                className="w-full px-4 py-3 text-lg"
                style={{
                  backgroundColor: '#FFFACD',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              />
              {formData.password && formData.password.length < 4 && (
                <p
                  className="text-sm mt-2 px-3 py-2 inline-block"
                  style={{
                    backgroundColor: '#FFA500',
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  password needs to be at least 4 characters
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">❤️</div>
              <h2
                className="text-2xl font-bold mb-2 inline-block px-4 py-2 rotate-1"
                style={{
                  backgroundColor: '#FF69B4',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                what are you into?
              </h2>
              <p className="text-lg mt-4">pick the things you care about!</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {INTERESTS.map((interest, i) => (
                <button
                  key={interest.name}
                  onClick={() => toggleInterest(interest.name)}
                  className="px-4 py-2 text-sm font-bold transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: formData.interests.includes(interest.name)
                      ? ['#FF69B4', '#FFD700', '#90EE90', '#87CEEB', '#DDA0DD'][i % 5]
                      : 'white',
                    border: '3px solid black',
                    borderRadius: '9999px',
                    boxShadow: formData.interests.includes(interest.name) ? '3px 3px 0 black' : 'none',
                    transform: formData.interests.includes(interest.name) ? `rotate(${(i % 2 === 0 ? -2 : 2)}deg)` : 'none',
                  }}
                >
                  {interest.emoji} {interest.name}
                </button>
              ))}
            </div>

            {formData.interests.length > 0 && (
              <p
                className="text-center font-bold px-4 py-2 inline-block mx-auto"
                style={{
                  backgroundColor: '#90EE90',
                  border: '2px solid black',
                  borderRadius: '9999px',
                  display: 'block',
                  width: 'fit-content',
                  margin: '0 auto',
                }}
              >
                {formData.interests.length} selected!
              </p>
            )}
          </div>
        )}

        {/* Step 3: Current goals/thoughts */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🚀</div>
              <h2
                className="text-2xl font-bold mb-2 inline-block px-4 py-2 -rotate-2"
                style={{
                  backgroundColor: '#87CEEB',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                what&apos;s on your mind?
              </h2>
              <p className="text-lg mt-4">anything you&apos;re thinking about? (optional)</p>
            </div>

            <textarea
              value={formData.currentGoals}
              onChange={(e) => setFormData({ ...formData, currentGoals: e.target.value })}
              placeholder="examples: figuring out what i want to do after high school, dealing with friend drama, trying to get better at something..."
              rows={4}
              className="w-full px-4 py-3 text-lg resize-none"
              style={{
                backgroundColor: '#FFFACD',
                border: '3px solid black',
                borderRadius: '12px',
              }}
              autoFocus
            />

            <p
              className="text-sm text-center px-4 py-2"
              style={{
                backgroundColor: 'white',
                border: '2px dashed black',
                borderRadius: '8px',
              }}
            >
              this helps personalize conversations, but you can skip it!
            </p>

            {signupError && (
              <div
                className="mt-4 p-3 text-center font-bold"
                style={{
                  backgroundColor: '#FFA500',
                  border: '2px solid black',
                  borderRadius: '8px',
                }}
              >
                {signupError}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t-4 border-dashed border-black">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              ← back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-8 py-3 font-bold transition-all duration-300"
            style={{
              backgroundColor: canProceed() ? '#90EE90' : '#ccc',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: canProceed() ? '4px 4px 0 black' : 'none',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              transform: canProceed() ? 'rotate(2deg)' : 'none',
            }}
            onMouseOver={(e) => canProceed() && (e.currentTarget.style.transform = 'rotate(2deg) scale(1.05)')}
            onMouseOut={(e) => canProceed() && (e.currentTarget.style.transform = 'rotate(2deg)')}
          >
            {step === totalSteps ? (
              <>start exploring! 🚀</>
            ) : (
              <>continue →</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
