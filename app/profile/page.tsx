'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import NavBar from '@/components/NavBar'
import { useTheme } from '@/lib/ThemeContext'

// DiceBear avatar options
const AVATAR_STYLES = [
  { id: 'adventurer', label: 'Adventurer', emoji: '🧙' },
  { id: 'avataaars', label: 'Cartoon', emoji: '😊' },
  { id: 'bottts', label: 'Robot', emoji: '🤖' },
  { id: 'fun-emoji', label: 'Emoji', emoji: '😎' },
  { id: 'lorelei', label: 'Artistic', emoji: '🎨' },
  { id: 'notionists', label: 'Minimal', emoji: '✨' },
  { id: 'personas', label: 'Persona', emoji: '👤' },
  { id: 'pixel-art', label: 'Pixel', emoji: '👾' },
]

const BACKGROUND_COLORS = [
  'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf',
  'a3e4d7', 'f9e79f', 'fadbd8', 'aed6f1', 'e8daef',
]

const SEED_OPTIONS = [
  'happy', 'cool', 'wild', 'chill', 'epic', 'magic',
  'star', 'moon', 'sun', 'cosmic', 'dream', 'spark',
]

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Avatar builder state
  const [avatarMode, setAvatarMode] = useState<'picker' | 'ai'>('picker')
  const [selectedStyle, setSelectedStyle] = useState('adventurer')
  const [selectedBg, setSelectedBg] = useState('b6e3f4')
  const [selectedSeed, setSelectedSeed] = useState('happy')
  const [customSeed, setCustomSeed] = useState('')

  // AI avatar state
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAiAvatar, setGeneratedAiAvatar] = useState<string | null>(null)

  // Saving state
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const savedUserId = localStorage.getItem('npc_user_id')
    const savedProfile = localStorage.getItem('youthai_profile')

    if (savedUserId && savedProfile) {
      setUserId(savedUserId)
      setProfile(JSON.parse(savedProfile))
      fetchCurrentAvatar(savedUserId)
    } else {
      router.push('/onboarding')
    }
  }, [router])

  const fetchCurrentAvatar = async (uid: string) => {
    try {
      const res = await fetch(`/api/user/avatar?userId=${uid}`)
      if (res.ok) {
        const data = await res.json()
        if (data.avatarUrl) {
          setCurrentAvatar(data.avatarUrl)
        }
      }
    } catch (err) {
      console.error('Failed to fetch avatar:', err)
    }
    setLoading(false)
  }

  const getDiceBearUrl = () => {
    const seed = customSeed || selectedSeed
    return `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${selectedBg}&size=200`
  }

  const handleGenerateAiAvatar = async () => {
    if (!userId || !aiPrompt.trim()) return

    setIsGenerating(true)
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          generateAI: true,
          prompt: aiPrompt,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.avatarUrl) {
          setGeneratedAiAvatar(data.avatarUrl)
        }
      } else {
        const error = await res.json()
        setSaveMessage(error.error || 'Failed to generate')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (err) {
      console.error('Failed to generate AI avatar:', err)
      setSaveMessage('Failed to generate')
      setTimeout(() => setSaveMessage(''), 3000)
    }
    setIsGenerating(false)
  }

  const handleSaveAvatar = async (avatarUrl: string) => {
    if (!userId) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          avatarUrl,
        }),
      })

      if (res.ok) {
        setCurrentAvatar(avatarUrl)
        setSaveMessage('Avatar saved!')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (err) {
      console.error('Failed to save avatar:', err)
      setSaveMessage('Failed to save')
      setTimeout(() => setSaveMessage(''), 3000)
    }
    setIsSaving(false)
  }

  if (!userId || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-6xl animate-bounce">👻</div>
      </div>
    )
  }

  const previewUrl = avatarMode === 'picker' ? getDiceBearUrl() : (generatedAiAvatar || currentAvatar)

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: theme.colors.text }}>
            Your Profile
          </h1>
          <p style={{ color: theme.colors.textMuted }}>
            Customize your avatar and view your info
          </p>
        </div>

        {/* Current Avatar Display */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="relative w-32 h-32 rounded-full overflow-hidden mb-4"
            style={{
              border: '4px solid black',
              boxShadow: '4px 4px 0 black',
              backgroundColor: theme.colors.backgroundAlt,
            }}
          >
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt="Your avatar"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                👻
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            {profile.name}
          </h2>
          <p style={{ color: theme.colors.textMuted }}>
            Age {profile.currentAge} • {profile.interests.slice(0, 3).join(', ')}
          </p>
        </div>

        {/* Avatar Builder */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '3px solid black',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.colors.text }}>
            Create Your Avatar
          </h3>

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAvatarMode('picker')}
              className="flex-1 py-3 font-bold rounded-xl transition-transform hover:scale-105"
              style={{
                backgroundColor: avatarMode === 'picker' ? theme.colors.accent1 : theme.colors.background,
                border: '2px solid black',
                boxShadow: avatarMode === 'picker' ? '3px 3px 0 black' : 'none',
              }}
            >
              🎨 Style Picker
            </button>
            <button
              onClick={() => setAvatarMode('ai')}
              className="flex-1 py-3 font-bold rounded-xl transition-transform hover:scale-105"
              style={{
                backgroundColor: avatarMode === 'ai' ? theme.colors.accent2 : theme.colors.background,
                border: '2px solid black',
                boxShadow: avatarMode === 'ai' ? '3px 3px 0 black' : 'none',
              }}
            >
              ✨ AI Generated
            </button>
          </div>

          {/* Preview */}
          <div className="flex justify-center mb-6">
            <div
              className="relative w-40 h-40 rounded-2xl overflow-hidden"
              style={{
                border: '3px solid black',
                boxShadow: '4px 4px 0 black',
                backgroundColor: `#${selectedBg}`,
              }}
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Avatar preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  {isGenerating ? '🎨' : '?'}
                </div>
              )}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-lg animate-pulse">Generating...</div>
                </div>
              )}
            </div>
          </div>

          {/* DiceBear Picker */}
          {avatarMode === 'picker' && (
            <>
              {/* Style Selection */}
              <div className="mb-4">
                <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                  Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className="p-2 rounded-xl text-center transition-transform hover:scale-105"
                      style={{
                        backgroundColor: selectedStyle === style.id ? theme.colors.accent1 : theme.colors.background,
                        border: selectedStyle === style.id ? '2px solid black' : '2px solid transparent',
                      }}
                    >
                      <div className="text-2xl">{style.emoji}</div>
                      <div className="text-xs">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div className="mb-4">
                <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                  Background
                </label>
                <div className="flex flex-wrap gap-2">
                  {BACKGROUND_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedBg(color)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: `#${color}`,
                        border: selectedBg === color ? '3px solid black' : '2px solid rgba(0,0,0,0.2)',
                        boxShadow: selectedBg === color ? '2px 2px 0 black' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Seed Selection */}
              <div className="mb-4">
                <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                  Vibe
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SEED_OPTIONS.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => {
                        setSelectedSeed(seed)
                        setCustomSeed('')
                      }}
                      className="px-3 py-1 rounded-full text-sm font-medium transition-transform hover:scale-105"
                      style={{
                        backgroundColor: selectedSeed === seed && !customSeed ? theme.colors.accent2 : theme.colors.background,
                        border: selectedSeed === seed && !customSeed ? '2px solid black' : '2px solid transparent',
                      }}
                    >
                      {seed}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customSeed}
                  onChange={(e) => setCustomSeed(e.target.value)}
                  placeholder="Or type your own..."
                  className="w-full p-2 rounded-xl text-sm"
                  style={{
                    backgroundColor: theme.colors.background,
                    border: '2px solid black',
                    color: theme.colors.text,
                  }}
                />
              </div>

              {/* Save DiceBear */}
              <button
                onClick={() => handleSaveAvatar(getDiceBearUrl())}
                disabled={isSaving}
                className="w-full py-3 font-bold rounded-xl transition-transform hover:scale-105 disabled:opacity-50"
                style={{
                  backgroundColor: theme.colors.buttonSuccess,
                  border: '3px solid black',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                {isSaving ? 'Saving...' : 'Save This Avatar'}
              </button>
            </>
          )}

          {/* AI Generator */}
          {avatarMode === 'ai' && (
            <>
              <div className="mb-4">
                <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                  Describe your avatar
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="A cool teenager with purple hair, wearing headphones, anime style..."
                  rows={3}
                  className="w-full p-3 rounded-xl resize-none"
                  style={{
                    backgroundColor: theme.colors.background,
                    border: '2px solid black',
                    color: theme.colors.text,
                  }}
                />
                <p className="text-xs mt-1" style={{ color: theme.colors.textMuted }}>
                  Tip: Be specific! Mention style, colors, accessories, mood.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateAiAvatar}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="flex-1 py-3 font-bold rounded-xl transition-transform hover:scale-105 disabled:opacity-50"
                  style={{
                    backgroundColor: theme.colors.accent2,
                    border: '3px solid black',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
                {generatedAiAvatar && (
                  <button
                    onClick={() => handleSaveAvatar(generatedAiAvatar)}
                    disabled={isSaving}
                    className="flex-1 py-3 font-bold rounded-xl transition-transform hover:scale-105 disabled:opacity-50"
                    style={{
                      backgroundColor: theme.colors.buttonSuccess,
                      border: '3px solid black',
                      boxShadow: '3px 3px 0 black',
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save This'}
                  </button>
                )}
              </div>

              <p className="text-xs text-center mt-3" style={{ color: theme.colors.textMuted }}>
                Uses 1 of your daily image generations
              </p>
            </>
          )}

          {/* Save Message */}
          {saveMessage && (
            <div
              className="mt-4 p-3 rounded-xl text-center font-bold"
              style={{
                backgroundColor: saveMessage.includes('Failed') ? '#ffcccc' : '#ccffcc',
                border: '2px solid black',
              }}
            >
              {saveMessage}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '3px solid black',
            boxShadow: '4px 4px 0 black',
          }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.colors.text }}>
            Your Info
          </h3>

          <div className="space-y-3">
            <div>
              <span className="font-bold" style={{ color: theme.colors.textMuted }}>Name:</span>
              <span className="ml-2" style={{ color: theme.colors.text }}>{profile.name}</span>
            </div>
            <div>
              <span className="font-bold" style={{ color: theme.colors.textMuted }}>Age:</span>
              <span className="ml-2" style={{ color: theme.colors.text }}>{profile.currentAge}</span>
            </div>
            <div>
              <span className="font-bold" style={{ color: theme.colors.textMuted }}>Interests:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.interests.map((interest, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: theme.colors.accent1,
                      border: '2px solid black',
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            {profile.currentGoals && (
              <div>
                <span className="font-bold" style={{ color: theme.colors.textMuted }}>Goals:</span>
                <p className="mt-1" style={{ color: theme.colors.text }}>{profile.currentGoals}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
