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
      const analyzeRes = await fetch('/api/personality-islands/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json()
        const themes = analyzeData.themes

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

  // Island colors based on index
  const getIslandColor = (index: number) => {
    const colors = [
      theme.colors.accent1,
      theme.colors.accent2,
      theme.colors.accent3,
      theme.colors.accent4,
      theme.colors.accent5,
    ]
    return colors[index % colors.length]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🏝️</div>
          <p className="font-bold text-lg">Discovering your islands...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold mb-3 inline-block px-6 py-3 -rotate-1"
          style={{
            backgroundColor: theme.colors.accent4,
            border: '4px solid black',
            borderRadius: '16px',
            boxShadow: '6px 6px 0 black',
          }}
        >
          🏝️ Islands of You 🏝️
        </h2>
        <p className="text-sm sm:text-base mt-4 max-w-md mx-auto opacity-80">
          Like Inside Out, your personality has core islands that make you <em>you</em>
        </p>
      </div>

      {/* Islands View */}
      {islands.length === 0 ? (
        <div
          className="p-8 text-center rotate-1"
          style={{
            backgroundColor: theme.colors.accent5,
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '8px 8px 0 black',
          }}
        >
          <div className="text-6xl mb-4 animate-bounce">🌅</div>
          <h3 className="text-2xl font-bold mb-3">Your islands are waiting!</h3>
          <p className="mb-6 text-base max-w-sm mx-auto">We'll analyze your chats and check-ins to discover the themes that make you unique.</p>
          <button
            onClick={analyzeAndCreateIslands}
            disabled={isAnalyzing}
            className="px-8 py-4 font-bold text-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.accent1,
              border: '4px solid black',
              borderRadius: '16px',
              boxShadow: '6px 6px 0 black',
            }}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin text-2xl">🔍</span> Analyzing...
              </span>
            ) : (
              '✨ Discover My Islands ✨'
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Instruction */}
          <p className="text-center text-sm font-bold opacity-70">
            👆 Tap an island to explore it!
          </p>

          {/* Beautiful sky with islands as cards */}
          <div
            className="relative min-h-[500px] sm:min-h-[550px] overflow-hidden p-4"
            style={{
              background: `linear-gradient(180deg,
                #87CEEB 0%,
                #B0E0E6 20%,
                #E6E6FA 50%,
                #FFB6C1 80%,
                #FFDAB9 100%)`,
              border: '4px solid black',
              borderRadius: '24px',
              boxShadow: '8px 8px 0 black',
            }}
          >
            {/* Animated clouds */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute text-5xl opacity-70" style={{ top: '5%', left: '5%', animation: 'cloudFloat 20s linear infinite' }}>☁️</div>
              <div className="absolute text-4xl opacity-60" style={{ top: '15%', right: '10%', animation: 'cloudFloat 25s linear infinite', animationDelay: '-5s' }}>☁️</div>
              <div className="absolute text-6xl opacity-50" style={{ top: '50%', left: '0%', animation: 'cloudFloat 30s linear infinite', animationDelay: '-10s' }}>☁️</div>
              <div className="absolute text-4xl opacity-60" style={{ bottom: '20%', right: '5%', animation: 'cloudFloat 22s linear infinite', animationDelay: '-8s' }}>☁️</div>
              {/* Sparkles */}
              <div className="absolute text-2xl" style={{ top: '10%', left: '30%', animation: 'sparkle 2s ease-in-out infinite' }}>✨</div>
              <div className="absolute text-xl" style={{ top: '30%', right: '25%', animation: 'sparkle 2s ease-in-out infinite', animationDelay: '0.5s' }}>✨</div>
              <div className="absolute text-2xl" style={{ bottom: '30%', left: '20%', animation: 'sparkle 2s ease-in-out infinite', animationDelay: '1s' }}>✨</div>
            </div>

            {/* Islands as beautiful cards in a grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-8">
              {islands.map((island, index) => (
                <button
                  key={island.id}
                  onClick={() => setSelectedIsland(island)}
                  className="group relative focus:outline-none"
                  style={{
                    animation: `islandFloat 4s ease-in-out infinite`,
                    animationDelay: `${index * 0.3}s`,
                  }}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${getIslandColor(index)}80 0%, transparent 70%)`,
                      filter: 'blur(15px)',
                      transform: 'scale(1.2)',
                    }}
                  />

                  {/* Island card */}
                  <div
                    className="relative p-4 sm:p-5 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 group-active:scale-95"
                    style={{
                      backgroundColor: theme.colors.backgroundAlt,
                      border: '4px solid black',
                      borderRadius: '20px',
                      boxShadow: '6px 6px 0 black',
                    }}
                  >
                    {/* Colored accent bar */}
                    <div
                      className="absolute top-0 left-4 right-4 h-2 -translate-y-1"
                      style={{
                        backgroundColor: getIslandColor(index),
                        borderRadius: '4px',
                        border: '2px solid black',
                      }}
                    />

                    {/* Island image or emoji */}
                    <div className="flex flex-col items-center gap-3">
                      {island.image_url ? (
                        <div className="relative">
                          <img
                            src={island.image_url}
                            alt={island.theme_name}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover"
                            style={{
                              border: '3px solid black',
                              boxShadow: '4px 4px 0 black',
                            }}
                          />
                          {/* Generated badge */}
                          <div
                            className="absolute -top-2 -right-2 text-lg"
                            style={{
                              filter: 'drop-shadow(1px 1px 0 black)',
                            }}
                          >
                            🎨
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl group-hover:animate-bounce"
                          style={{
                            backgroundColor: getIslandColor(index),
                            border: '3px solid black',
                            boxShadow: '4px 4px 0 black',
                          }}
                        >
                          {island.theme_emoji}
                        </div>
                      )}

                      {/* Name */}
                      <div className="text-center">
                        <div className="font-bold text-sm sm:text-base leading-tight">
                          {island.theme_name}
                        </div>

                        {/* Strength bar */}
                        <div className="mt-2 w-full">
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{
                              backgroundColor: theme.colors.backgroundAlt,
                              border: '2px solid black',
                            }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${island.strength * 100}%`,
                                backgroundColor: getIslandColor(index),
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tap hint */}
                      <div
                        className="text-xs font-bold px-3 py-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                        style={{
                          backgroundColor: getIslandColor(index),
                          border: '2px solid black',
                        }}
                      >
                        tap me!
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Refresh button */}
          <div className="text-center">
            <button
              onClick={analyzeAndCreateIslands}
              disabled={isAnalyzing}
              className="px-6 py-3 font-bold text-base hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.accent3,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '4px 4px 0 black',
              }}
            >
              {isAnalyzing ? '🔍 Analyzing...' : '🔄 Re-discover my islands'}
            </button>
          </div>
        </>
      )}

      {/* Selected Island Modal */}
      {selectedIsland && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSelectedIsland(null)}
        >
          <div
            className="relative max-w-sm w-full p-6 animate-fadeIn"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '4px solid black',
              borderRadius: '24px',
              boxShadow: '10px 10px 0 black',
              transform: 'rotate(1deg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Colored header bar */}
            <div
              className="absolute top-0 left-6 right-6 h-3 -translate-y-1.5"
              style={{
                backgroundColor: getIslandColor(islands.findIndex(i => i.id === selectedIsland.id)),
                borderRadius: '6px',
                border: '2px solid black',
              }}
            />

            {/* Close button */}
            <button
              onClick={() => setSelectedIsland(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center font-bold text-xl hover:scale-110 active:scale-95 transition-transform"
              style={{
                backgroundColor: theme.colors.accent1,
                border: '3px solid black',
                borderRadius: '50%',
                boxShadow: '3px 3px 0 black',
              }}
            >
              ×
            </button>

            <div className="text-center space-y-5 pt-2">
              {/* Image or emoji */}
              {selectedIsland.image_url ? (
                <img
                  src={selectedIsland.image_url}
                  alt={selectedIsland.theme_name}
                  className="w-36 h-36 mx-auto rounded-2xl object-cover"
                  style={{
                    border: '4px solid black',
                    boxShadow: '6px 6px 0 black',
                  }}
                />
              ) : (
                <div
                  className="w-36 h-36 mx-auto rounded-2xl flex items-center justify-center text-7xl"
                  style={{
                    backgroundColor: getIslandColor(islands.findIndex(i => i.id === selectedIsland.id)),
                    border: '4px solid black',
                    boxShadow: '6px 6px 0 black',
                  }}
                >
                  {selectedIsland.theme_emoji}
                </div>
              )}

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-bold">
                {selectedIsland.theme_emoji} {selectedIsland.theme_name}
              </h3>

              {/* Description */}
              {selectedIsland.theme_description && (
                <p
                  className="text-base px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: theme.colors.accent5 + '60',
                    border: '2px solid black',
                  }}
                >
                  {selectedIsland.theme_description}
                </p>
              )}

              {/* Strength meter */}
              <div
                className="px-5 py-3 rounded-xl"
                style={{
                  backgroundColor: theme.colors.accent4,
                  border: '3px solid black',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Strength</span>
                  <span className="font-bold">{Math.round(selectedIsland.strength * 100)}%</span>
                </div>
                <div
                  className="h-4 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: theme.colors.backgroundAlt,
                    border: '2px solid black',
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${selectedIsland.strength * 100}%`,
                      background: `linear-gradient(90deg, ${theme.colors.accent1}, ${theme.colors.accent2}, ${theme.colors.accent3})`,
                    }}
                  />
                </div>
              </div>

              {/* Generate image button */}
              <button
                onClick={() => generateImage(selectedIsland)}
                disabled={generatingId !== null}
                className="w-full py-4 font-bold text-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                style={{
                  backgroundColor: selectedIsland.image_url ? theme.colors.accent3 : theme.colors.accent1,
                  border: '4px solid black',
                  borderRadius: '16px',
                  boxShadow: '5px 5px 0 black',
                }}
              >
                {generatingId === selectedIsland.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin text-xl">🎨</span> Creating magic...
                  </span>
                ) : selectedIsland.image_url ? (
                  '🔄 Generate New Image'
                ) : (
                  '🎨 Create Island Art!'
                )}
              </button>

              {remainingGenerations !== null && (
                <p className="text-sm opacity-70 font-bold">
                  ✨ {remainingGenerations} image generations left today
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes islandFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes cloudFloat {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(calc(100vw + 100%)); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
