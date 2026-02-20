'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import GoogleSignInButton from './GoogleSignInButton'

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

const STEP_COLORS = ['#87CEEB', '#FF69B4', '#FFD700', '#90EE90']

const PRONOUNS = [
  { value: 'she/her', label: 'she/her' },
  { value: 'he/him', label: 'he/him' },
  { value: 'they/them', label: 'they/them' },
  { value: 'other', label: 'other' },
  { value: 'prefer not to say', label: 'prefer not to say' },
]

interface FormData {
  name: string
  nickname: string
  currentAge: string
  password: string
  pronouns: string
  interests: string[]
  currentGoals: string
  email: string
  googleId: string
  dataConsent: boolean
}

export default function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    nickname: '',
    currentAge: '',
    password: '',
    pronouns: '',
    interests: [],
    currentGoals: '',
    email: '',
    googleId: '',
    dataConsent: false,
  })
  const [signupError, setSignupError] = useState('')
  const [isGoogleSignup, setIsGoogleSignup] = useState(false)

  const totalSteps = 4

  // Check if coming from Google OAuth
  useEffect(() => {
    const googleParam = searchParams.get('google')
    const emailParam = searchParams.get('email')
    const nameParam = searchParams.get('name')

    if (googleParam === 'true' || session?.user?.googleId) {
      setIsGoogleSignup(true)

      // Pre-fill from URL params or session
      const email = emailParam || session?.user?.email || ''
      const name = nameParam || session?.user?.name || ''
      const googleId = session?.user?.googleId || ''

      setFormData(prev => ({
        ...prev,
        email,
        nickname: name, // Use Google name as nickname by default
        googleId,
      }))
    }
  }, [searchParams, session])

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
            pronouns: formData.pronouns,
            interests: formData.interests,
            goals: formData.currentGoals,
            password: isGoogleSignup ? null : formData.password,
            // Google-specific fields
            email: formData.email || null,
            googleId: formData.googleId || null,
            authProvider: isGoogleSignup ? 'google' : 'password',
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

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.dataConsent === true
      case 2:
        const baseRequirements = formData.name.trim().length > 0 &&
               formData.currentAge.trim().length > 0 &&
               parseInt(formData.currentAge) >= 13 &&
               formData.email.trim().length > 0 &&
               isValidEmail(formData.email)
        // Password not required for Google signup
        if (isGoogleSignup) {
          return baseRequirements
        }
        return baseRequirements && formData.password.length >= 4
      case 3:
        return formData.interests.length >= 1
      case 4:
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
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300`}
              style={{
                backgroundColor: s <= step ? STEP_COLORS[s - 1] : 'white',
                border: '3px solid black',
                boxShadow: s <= step ? '4px 4px 0 black' : 'none',
                transform: s === step ? 'rotate(-3deg) scale(1.1)' : 'rotate(0deg)',
              }}
            >
              {s <= step ? ['🔒', '👋', '❤️', '🚀'][s - 1] : s}
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
        {/* Step 1: Data Consent */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <h2
                className="text-2xl font-bold mb-2 inline-block px-4 py-2 -rotate-1"
                style={{
                  backgroundColor: '#87CEEB',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                your privacy matters
              </h2>
              <p className="text-lg mt-4">before we start, here&apos;s how npc works</p>
            </div>

            <div
              className="p-4 space-y-4"
              style={{
                backgroundColor: '#FFFACD',
                border: '3px solid black',
                borderRadius: '12px',
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-bold">AI-Powered Conversations</h3>
                  <p className="text-sm text-gray-700">
                    npc uses Claude, an AI made by Anthropic, to chat with you and help you reflect on life.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="font-bold">What We Send</h3>
                  <p className="text-sm text-gray-700">
                    Your messages, profile info (name, age, interests), and conversation history are sent to Anthropic to generate responses.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h3 className="font-bold">How It&apos;s Protected</h3>
                  <p className="text-sm text-gray-700">
                    Anthropic doesn&apos;t use your conversations to train their AI. Your data is transmitted securely and handled according to their privacy policy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🗑️</span>
                <div>
                  <h3 className="font-bold">Your Control</h3>
                  <p className="text-sm text-gray-700">
                    You can delete your account and all associated data at any time from your settings.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setFormData({ ...formData, dataConsent: !formData.dataConsent })}
              className="w-full flex items-center gap-3 p-4 text-left font-bold transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: formData.dataConsent ? '#90EE90' : 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: formData.dataConsent ? '4px 4px 0 black' : 'none',
              }}
            >
              <div
                className="w-8 h-8 flex items-center justify-center text-lg"
                style={{
                  backgroundColor: formData.dataConsent ? '#FFD700' : 'white',
                  border: '3px solid black',
                  borderRadius: '8px',
                }}
              >
                {formData.dataConsent ? '✓' : ''}
              </div>
              <span>I understand and agree to send my data to Anthropic for AI conversations</span>
            </button>

            <p className="text-xs text-center text-gray-500">
              By continuing, you also agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        )}

        {/* Step 2: Name & Age */}
        {step === 2 && (
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

            {/* Google Sign Up Option - only show if not already using Google */}
            {!isGoogleSignup && (
              <>
                <div className="mb-2">
                  <GoogleSignInButton callbackUrl="/api/auth/google-callback" />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 h-1 bg-black rounded" style={{ opacity: 0.2 }} />
                  <span className="text-sm font-bold text-gray-500">or sign up with</span>
                  <div className="flex-1 h-1 bg-black rounded" style={{ opacity: 0.2 }} />
                </div>
              </>
            )}

            {/* Show Google connected badge if using Google */}
            {isGoogleSignup && formData.email && (
              <div
                className="flex items-center gap-3 p-3 mb-2"
                style={{
                  backgroundColor: '#E8F5E9',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <div>
                  <span className="font-bold">Connected with Google</span>
                  <p className="text-sm text-gray-600">{formData.email}</p>
                </div>
              </div>
            )}

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

            {/* Email field - show for all users (Google users have it pre-filled) */}
            <div>
              <label className="block text-lg font-bold mb-2">your email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="we'll send you a welcome message!"
                className="w-full px-4 py-3 text-lg"
                style={{
                  backgroundColor: isGoogleSignup ? '#E8F5E9' : '#FFFACD',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
                disabled={isGoogleSignup}
              />
              {formData.email && !isValidEmail(formData.email) && (
                <p
                  className="text-sm mt-2 px-3 py-2 inline-block"
                  style={{
                    backgroundColor: '#FFA500',
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  please enter a valid email
                </p>
              )}
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
                placeholder="13+"
                min={13}
                className="w-full px-4 py-3 text-lg"
                style={{
                  backgroundColor: '#FFFACD',
                  border: '3px solid black',
                  borderRadius: '12px',
                }}
              />
              {formData.currentAge && parseInt(formData.currentAge) < 13 && (
                <p
                  className="text-sm mt-2 px-3 py-2 inline-block"
                  style={{
                    backgroundColor: '#FFA500',
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  you must be at least 13 to use this app
                </p>
              )}
            </div>

            <div>
              <label className="block text-lg font-bold mb-2">your pronouns</label>
              <div className="flex flex-wrap gap-2">
                {PRONOUNS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, pronouns: p.value })}
                    className="px-4 py-2 font-bold transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: formData.pronouns === p.value ? '#DDA0DD' : 'white',
                      border: '3px solid black',
                      borderRadius: '9999px',
                      boxShadow: formData.pronouns === p.value ? '3px 3px 0 black' : 'none',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2 text-gray-600">
                helps npc use the right language when talking about you
              </p>
            </div>

            {/* Password field - only show if not using Google */}
            {!isGoogleSignup && (
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
            )}
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
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

        {/* Step 4: Current goals/thoughts */}
        {step === 4 && (
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
