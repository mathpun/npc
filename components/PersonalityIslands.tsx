'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface Island {
  id: number
  theme_name: string
  theme_emoji: string
  theme_description: string | null
  image_url: string | null
  strength: number
}

interface PersonalityIslandsProps {
  userId: string
}

export default function PersonalityIslands({ userId }: PersonalityIslandsProps) {
  const { theme } = useTheme()
  const [islands, setIslands] = useState<Island[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null)
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null)

  const fetchIslands = async () => {
    try {
      const res = await fetch(`/api/personality-islands?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setIslands(data.islands || [])
      }
    } catch (err) {
      console.error('Failed to fetch islands:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeAndCreateIslands = async () => {
    setIsAnalyzing(true)
    try {
      // First, analyze the user's chat history
      const analyzeRes = await fetch('/api/personality-islands/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json()
        const themes = analyzeData.themes

        // Create islands from the themes
        const createRes = await fetch('/api/personality-islands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, themes }),
        })

        if (createRes.ok) {
          const createData = await createRes.json()
          setIslands(createData.islands || [])
        }
      }
    } catch (err) {
      console.error('Failed to analyze:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateImage = async (island: Island) => {
    setGeneratingId(island.id)
    try {
      const res = await fetch(`/api/personality-islands/${island.id}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        const data = await res.json()
        setIslands(prev =>
          prev.map(i =>
            i.id === island.id ? { ...i, image_url: data.imageUrl } : i
          )
        )
        setRemainingGenerations(data.remaining)
        if (selectedIsland?.id === island.id) {
          setSelectedIsland({ ...selectedIsland, image_url: data.imageUrl })
        }
      } else if (res.status === 429) {
        alert('You\'ve used all your image generations for today! Come back tomorrow.')
      }
    } catch (err) {
      console.error('Failed to generate image:', err)
    } finally {
      setGeneratingId(null)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchIslands()
    }
  }, [userId])

  // Island positions for pleasing arrangement
  const getIslandPosition = (index: number, total: number) => {
    const positions = [
      { top: '10%', left: '55%', delay: 0 },
      { top: '35%', left: '15%', delay: 0.5 },
      { top: '30%', left: '70%', delay: 0.3 },
      { top: '55%', left: '40%', delay: 0.7 },
      { top: '65%', left: '75%', delay: 0.2 },
    ]
    return positions[index % positions.length]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🏝️</div>
          <p className="font-bold">Discovering your islands...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-3 inline-block px-6 py-2 -rotate-1"
          style={{
            backgroundColor: theme.colors.accent4,
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 black',
          }}
        >
          🏝️ Islands of You 🏝️
        </h2>
        <p className="text-sm sm:text-base mt-3 max-w-md mx-auto">
          Like Inside Out, your personality has core islands that make you <em>you</em>
        </p>
      </div>

      {/* Islands View */}
      {islands.length === 0 ? (
        <div
          className="p-6 text-center rotate-1"
          style={{
            backgroundColor: theme.colors.accent5,
            border: '4px solid black',
            borderRadius: '16px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="text-5xl mb-4">🌅</div>
          <h3 className="text-xl font-bold mb-2">Your islands are waiting to be discovered!</h3>
          <p className="mb-4 text-sm">We'll analyze your chats and check-ins to find the themes that define you.</p>
          <button
            onClick={analyzeAndCreateIslands}
            disabled={isAnalyzing}
            className="px-6 py-3 font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.accent1,
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">🔍</span> Analyzing...
              </span>
            ) : (
              '✨ Discover My Islands'
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Sky with floating islands */}
          <div
            className="relative min-h-[400px] sm:min-h-[500px] overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${theme.colors.accent1}40 0%, ${theme.colors.accent4}40 50%, ${theme.colors.accent3}40 100%)`,
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '6px 6px 0 black',
            }}
          >
            {/* Clouds */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute text-4xl opacity-60 animate-float" style={{ top: '5%', left: '10%', animationDelay: '0s' }}>☁️</div>
              <div className="absolute text-3xl opacity-50 animate-float" style={{ top: '20%', right: '15%', animationDelay: '1s' }}>☁️</div>
              <div className="absolute text-5xl opacity-40 animate-float" style={{ top: '60%', left: '5%', animationDelay: '2s' }}>☁️</div>
              <div className="absolute text-3xl opacity-50 animate-float" style={{ bottom: '15%', right: '10%', animationDelay: '0.5s' }}>☁️</div>
            </div>

            {/* Islands */}
            {islands.map((island, index) => {
              const pos = getIslandPosition(index, islands.length)
              const isGenerating = generatingId === island.id
              return (
                <button
                  key={island.id}
                  onClick={() => setSelectedIsland(island)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 focus:outline-none"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    animation: `float 4s ease-in-out infinite`,
                    animationDelay: `${pos.delay}s`,
                  }}
                >
                  <div
                    className="relative p-3 sm:p-4"
                    style={{
                      backgroundColor: theme.colors.backgroundAlt,
                      border: '3px solid black',
                      borderRadius: '16px',
                      boxShadow: '4px 4px 0 black',
                      minWidth: '100px',
                    }}
                  >
                    {/* Island image or emoji */}
                    <div className="flex flex-col items-center gap-2">
                      {island.image_url ? (
                        <img
                          src={island.image_url}
                          alt={island.theme_name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover"
                          style={{ border: '2px solid black' }}
                        />
                      ) : (
                        <div
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-3xl sm:text-4xl"
                          style={{
                            backgroundColor: theme.colors.accent5,
                            border: '2px solid black',
                          }}
                        >
                          {island.theme_emoji}
                        </div>
                      )}
                      <div className="text-center">
                        <div className="font-bold text-xs sm:text-sm leading-tight">
                          {island.theme_name}
                        </div>
                        {/* Strength indicator */}
                        <div className="flex justify-center gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: i < Math.round(island.strength * 5)
                                  ? theme.colors.accent1
                                  : theme.colors.backgroundAlt,
                                border: '1px solid black',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Refresh button */}
          <div className="text-center">
            <button
              onClick={analyzeAndCreateIslands}
              disabled={isAnalyzing}
              className="px-4 py-2 font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px solid black',
                borderRadius: '9999px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              {isAnalyzing ? '🔍 Analyzing...' : '🔄 Re-analyze my islands'}
            </button>
          </div>
        </>
      )}

      {/* Selected Island Modal */}
      {selectedIsland && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedIsland(null)}
        >
          <div
            className="relative max-w-sm w-full p-6 rotate-1"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '8px 8px 0 black',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIsland(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center font-bold text-lg hover:scale-110 transition-transform"
              style={{
                backgroundColor: theme.colors.accent1,
                border: '2px solid black',
                borderRadius: '50%',
              }}
            >
              ×
            </button>

            <div className="text-center space-y-4">
              {/* Image or emoji */}
              {selectedIsland.image_url ? (
                <img
                  src={selectedIsland.image_url}
                  alt={selectedIsland.theme_name}
                  className="w-32 h-32 mx-auto rounded-2xl object-cover"
                  style={{ border: '3px solid black', boxShadow: '4px 4px 0 black' }}
                />
              ) : (
                <div
                  className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-6xl"
                  style={{
                    backgroundColor: theme.colors.accent5,
                    border: '3px solid black',
                    boxShadow: '4px 4px 0 black',
                  }}
                >
                  {selectedIsland.theme_emoji}
                </div>
              )}

              {/* Title */}
              <h3 className="text-2xl font-bold">
                {selectedIsland.theme_emoji} {selectedIsland.theme_name}
              </h3>

              {/* Description */}
              {selectedIsland.theme_description && (
                <p className="text-sm">{selectedIsland.theme_description}</p>
              )}

              {/* Strength */}
              <div
                className="inline-block px-4 py-2"
                style={{
                  backgroundColor: theme.colors.accent4,
                  border: '2px solid black',
                  borderRadius: '9999px',
                }}
              >
                <span className="font-bold text-sm">
                  Strength: {Math.round(selectedIsland.strength * 100)}%
                </span>
              </div>

              {/* Generate image button */}
              {!selectedIsland.image_url && (
                <button
                  onClick={() => generateImage(selectedIsland)}
                  disabled={generatingId !== null}
                  className="w-full py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                  style={{
                    backgroundColor: theme.colors.accent1,
                    border: '3px solid black',
                    borderRadius: '12px',
                    boxShadow: '4px 4px 0 black',
                  }}
                >
                  {generatingId === selectedIsland.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">🎨</span> Creating image...
                    </span>
                  ) : (
                    '🎨 Generate Island Image'
                  )}
                </button>
              )}

              {selectedIsland.image_url && (
                <button
                  onClick={() => generateImage(selectedIsland)}
                  disabled={generatingId !== null}
                  className="w-full py-2 font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50"
                  style={{
                    backgroundColor: theme.colors.backgroundAlt,
                    border: '2px solid black',
                    borderRadius: '9999px',
                  }}
                >
                  {generatingId === selectedIsland.id ? '🎨 Regenerating...' : '🔄 Generate new image'}
                </button>
              )}

              {remainingGenerations !== null && (
                <p className="text-xs opacity-70">
                  {remainingGenerations} image generations remaining today
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
