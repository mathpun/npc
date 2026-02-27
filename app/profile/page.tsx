'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import NavBar from '@/components/NavBar'
import { useTheme } from '@/lib/ThemeContext'

// Avatar style options
const AVATAR_STYLES = [
  { id: 'adventurer', label: 'Adventurer', emoji: '🧙' },
  { id: 'avataaars', label: 'Cartoon', emoji: '😊' },
  { id: 'lorelei', label: 'Artistic', emoji: '🎨' },
  { id: 'notionists', label: 'Minimal', emoji: '✨' },
  { id: 'big-ears', label: 'Big Ears', emoji: '👂' },
  { id: 'thumbs', label: 'Thumbs', emoji: '👍' },
  { id: 'bottts', label: 'Robot', emoji: '🤖' },
  { id: 'pixel-art', label: 'Pixel', emoji: '👾' },
]

// Skin tones
const SKIN_COLORS = [
  { id: 'f8d9c4', label: 'Light' },
  { id: 'eac4a8', label: 'Light-Med' },
  { id: 'd4a886', label: 'Medium' },
  { id: 'c68c53', label: 'Med-Tan' },
  { id: 'a56c43', label: 'Tan' },
  { id: '8d5524', label: 'Brown' },
  { id: '6b4423', label: 'Dark' },
  { id: '4a3120', label: 'Deep' },
]

// Hair colors
const HAIR_COLORS = [
  { id: '090806', label: 'Black', color: '#090806' },
  { id: '4a3728', label: 'Dark Brown', color: '#4a3728' },
  { id: '6a4e35', label: 'Brown', color: '#6a4e35' },
  { id: 'b58143', label: 'Light Brown', color: '#b58143' },
  { id: 'd6b370', label: 'Blonde', color: '#d6b370' },
  { id: 'f5e1b4', label: 'Platinum', color: '#f5e1b4' },
  { id: 'b83f3f', label: 'Red', color: '#b83f3f' },
  { id: 'e35b04', label: 'Ginger', color: '#e35b04' },
  { id: 'ff69b4', label: 'Pink', color: '#ff69b4' },
  { id: '9b59b6', label: 'Purple', color: '#9b59b6' },
  { id: '3498db', label: 'Blue', color: '#3498db' },
  { id: '2ecc71', label: 'Green', color: '#2ecc71' },
]

// Hair styles (for adventurer)
const HAIR_STYLES_ADVENTURER = [
  'short01', 'short02', 'short03', 'short04', 'short05',
  'long01', 'long02', 'long03', 'long04', 'long05',
  'long06', 'long07', 'long08', 'long09', 'long10',
  'long11', 'long12', 'long13', 'long14', 'long15',
  'long16', 'long17', 'long18', 'long19', 'long20',
]

// Hair styles (for avataaars)
const HAIR_STYLES_AVATAAARS = [
  'bigHair', 'bob', 'bun', 'curly', 'curvy', 'dreads',
  'frida', 'fro', 'froAndBand', 'longButNotTooLong', 'miaWallace',
  'shavedSides', 'straight01', 'straight02', 'straightAndStrand',
  'shortCurly', 'shortFlat', 'shortRound', 'shortWaved', 'sides',
  'theCaesar', 'theCaesarAndSidePart', 'dreads01', 'dreads02',
  'frizzle', 'shaggy', 'shaggyMullet', 'hat', 'winterHat01',
]

// Eyes options
const EYES_OPTIONS = [
  'default', 'close', 'cry', 'dizzy', 'eyeRoll', 'happy',
  'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky',
]

// Mouth options
const MOUTH_OPTIONS = [
  'default', 'concerned', 'disbelief', 'eating', 'grimace',
  'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit',
]

// Accessories
const ACCESSORIES_OPTIONS = [
  { id: '', label: 'None' },
  { id: 'kurt', label: 'Round Glasses' },
  { id: 'prescription01', label: 'Glasses' },
  { id: 'prescription02', label: 'Square Glasses' },
  { id: 'sunglasses', label: 'Sunglasses' },
  { id: 'wayfarers', label: 'Wayfarers' },
]

// Background colors
const BACKGROUND_COLORS = [
  { id: 'b6e3f4', label: 'Sky' },
  { id: 'c0aede', label: 'Lavender' },
  { id: 'd1d4f9', label: 'Periwinkle' },
  { id: 'ffd5dc', label: 'Pink' },
  { id: 'ffdfbf', label: 'Peach' },
  { id: 'a3e4d7', label: 'Mint' },
  { id: 'f9e79f', label: 'Yellow' },
  { id: 'fadbd8', label: 'Rose' },
  { id: 'aed6f1', label: 'Blue' },
  { id: 'e8daef', label: 'Purple' },
  { id: 'ffffff', label: 'White' },
  { id: 'transparent', label: 'None' },
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
  const [selectedSkin, setSelectedSkin] = useState('eac4a8')
  const [selectedHairColor, setSelectedHairColor] = useState('4a3728')
  const [selectedHairStyle, setSelectedHairStyle] = useState('short01')
  const [selectedEyes, setSelectedEyes] = useState('default')
  const [selectedMouth, setSelectedMouth] = useState('smile')
  const [selectedAccessories, setSelectedAccessories] = useState('')
  const [randomSeed, setRandomSeed] = useState('avatar1')

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
    const baseUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg`
    const params = new URLSearchParams()

    params.set('size', '200')

    if (selectedBg !== 'transparent') {
      params.set('backgroundColor', selectedBg)
    }

    // Style-specific options
    if (selectedStyle === 'adventurer') {
      params.set('skinColor', selectedSkin)
      params.set('hairColor', selectedHairColor)
      params.set('hair', selectedHairStyle)
      params.set('seed', randomSeed)
    } else if (selectedStyle === 'avataaars') {
      params.set('skinColor', selectedSkin)
      params.set('hairColor', selectedHairColor)
      params.set('top', selectedHairStyle)
      params.set('eyes', selectedEyes)
      params.set('mouth', selectedMouth)
      if (selectedAccessories) {
        params.set('accessories', selectedAccessories)
        params.set('accessoriesProbability', '100')
      }
    } else if (selectedStyle === 'lorelei' || selectedStyle === 'notionists') {
      params.set('skinColor', selectedSkin)
      params.set('hairColor', selectedHairColor)
      params.set('seed', randomSeed)
    } else if (selectedStyle === 'big-ears') {
      params.set('skinColor', selectedSkin)
      params.set('hairColor', selectedHairColor)
      params.set('hair', selectedHairStyle)
      params.set('seed', randomSeed)
    } else {
      // For styles without detailed customization, use seed
      params.set('seed', randomSeed)
    }

    return `${baseUrl}?${params.toString()}`
  }

  const handleRandomize = () => {
    setRandomSeed(`random_${Date.now()}`)
    // Randomize other options
    setSelectedHairStyle(
      selectedStyle === 'avataaars'
        ? HAIR_STYLES_AVATAAARS[Math.floor(Math.random() * HAIR_STYLES_AVATAAARS.length)]
        : HAIR_STYLES_ADVENTURER[Math.floor(Math.random() * HAIR_STYLES_ADVENTURER.length)]
    )
    setSelectedEyes(EYES_OPTIONS[Math.floor(Math.random() * EYES_OPTIONS.length)])
    setSelectedMouth(MOUTH_OPTIONS[Math.floor(Math.random() * MOUTH_OPTIONS.length)])
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

  // Check if current style supports detailed customization
  const supportsDetailedCustomization = ['adventurer', 'avataaars', 'lorelei', 'notionists', 'big-ears'].includes(selectedStyle)
  const supportsAccessories = selectedStyle === 'avataaars'
  const supportsExpressions = selectedStyle === 'avataaars'

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
              🎨 Style Builder
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
                backgroundColor: selectedBg === 'transparent' ? theme.colors.background : `#${selectedBg}`,
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

          {/* DiceBear Builder */}
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
                      onClick={() => {
                        setSelectedStyle(style.id)
                        // Reset hair style when changing avatar style
                        if (style.id === 'avataaars') {
                          setSelectedHairStyle('shortFlat')
                        } else {
                          setSelectedHairStyle('short01')
                        }
                      }}
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

              {/* Skin Tone - only for styles that support it */}
              {supportsDetailedCustomization && (
                <div className="mb-4">
                  <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                    Skin Tone
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_COLORS.map((skin) => (
                      <button
                        key={skin.id}
                        onClick={() => setSelectedSkin(skin.id)}
                        className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                        title={skin.label}
                        style={{
                          backgroundColor: `#${skin.id}`,
                          border: selectedSkin === skin.id ? '3px solid black' : '2px solid rgba(0,0,0,0.3)',
                          boxShadow: selectedSkin === skin.id ? '2px 2px 0 black' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Hair Color */}
              {supportsDetailedCustomization && (
                <div className="mb-4">
                  <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                    Hair Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((hair) => (
                      <button
                        key={hair.id}
                        onClick={() => setSelectedHairColor(hair.id)}
                        className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                        title={hair.label}
                        style={{
                          backgroundColor: hair.color,
                          border: selectedHairColor === hair.id ? '3px solid black' : '2px solid rgba(0,0,0,0.3)',
                          boxShadow: selectedHairColor === hair.id ? '2px 2px 0 black' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Hair Style */}
              {supportsDetailedCustomization && (
                <div className="mb-4">
                  <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                    Hair Style
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {(selectedStyle === 'avataaars' ? HAIR_STYLES_AVATAAARS : HAIR_STYLES_ADVENTURER).map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedHairStyle(style)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-transform hover:scale-105"
                        style={{
                          backgroundColor: selectedHairStyle === style ? theme.colors.accent2 : theme.colors.background,
                          border: selectedHairStyle === style ? '2px solid black' : '2px solid transparent',
                        }}
                      >
                        {style.replace(/([A-Z])/g, ' $1').replace(/(\d+)/, ' $1').trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Eyes & Mouth (avataaars only) */}
              {supportsExpressions && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                      Eyes
                    </label>
                    <select
                      value={selectedEyes}
                      onChange={(e) => setSelectedEyes(e.target.value)}
                      className="w-full p-2 rounded-xl"
                      style={{
                        backgroundColor: theme.colors.background,
                        border: '2px solid black',
                        color: theme.colors.text,
                      }}
                    >
                      {EYES_OPTIONS.map((eye) => (
                        <option key={eye} value={eye}>{eye}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                      Mouth
                    </label>
                    <select
                      value={selectedMouth}
                      onChange={(e) => setSelectedMouth(e.target.value)}
                      className="w-full p-2 rounded-xl"
                      style={{
                        backgroundColor: theme.colors.background,
                        border: '2px solid black',
                        color: theme.colors.text,
                      }}
                    >
                      {MOUTH_OPTIONS.map((mouth) => (
                        <option key={mouth} value={mouth}>{mouth}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Accessories (avataaars only) */}
              {supportsAccessories && (
                <div className="mb-4">
                  <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                    Accessories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ACCESSORIES_OPTIONS.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setSelectedAccessories(acc.id)}
                        className="px-3 py-1 rounded-full text-sm font-medium transition-transform hover:scale-105"
                        style={{
                          backgroundColor: selectedAccessories === acc.id ? theme.colors.accent2 : theme.colors.background,
                          border: selectedAccessories === acc.id ? '2px solid black' : '2px solid transparent',
                        }}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Background Color */}
              <div className="mb-4">
                <label className="block font-bold mb-2" style={{ color: theme.colors.text }}>
                  Background
                </label>
                <div className="flex flex-wrap gap-2">
                  {BACKGROUND_COLORS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBg(bg.id)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      title={bg.label}
                      style={{
                        backgroundColor: bg.id === 'transparent' ? theme.colors.background : `#${bg.id}`,
                        border: selectedBg === bg.id ? '3px solid black' : '2px solid rgba(0,0,0,0.2)',
                        boxShadow: selectedBg === bg.id ? '2px 2px 0 black' : 'none',
                        backgroundImage: bg.id === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 4px 4px',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Randomize & Save buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRandomize}
                  className="flex-1 py-3 font-bold rounded-xl transition-transform hover:scale-105"
                  style={{
                    backgroundColor: theme.colors.accent3,
                    border: '3px solid black',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  🎲 Randomize
                </button>
                <button
                  onClick={() => handleSaveAvatar(getDiceBearUrl())}
                  disabled={isSaving}
                  className="flex-1 py-3 font-bold rounded-xl transition-transform hover:scale-105 disabled:opacity-50"
                  style={{
                    backgroundColor: theme.colors.buttonSuccess,
                    border: '3px solid black',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Avatar'}
                </button>
              </div>
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
