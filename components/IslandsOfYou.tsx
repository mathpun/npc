'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface Island {
  id: number
  theme_name: string
  theme_emoji: string
  theme_description: string | null
  image_url: string | null
  strength: number
}

interface IslandsOfYouProps {
  userId: string
  onClose?: () => void
}

// Island positions for the mindscape layout
const ISLAND_POSITIONS = [
  { x: 50, y: 35, scale: 1.2, delay: 0 },      // Center front
  { x: 20, y: 25, scale: 0.9, delay: 0.5 },    // Left back
  { x: 80, y: 28, scale: 0.95, delay: 0.3 },   // Right back
  { x: 35, y: 55, scale: 0.85, delay: 0.7 },   // Left front
  { x: 70, y: 50, scale: 0.8, delay: 0.4 },    // Right front
]

export default function IslandsOfYou({ userId, onClose }: IslandsOfYouProps) {
  const { theme } = useTheme()
  const [islands, setIslands] = useState<Island[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null)
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [tourMode, setTourMode] = useState(false)
  const [tourIndex, setTourIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

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
        if (selectedIsland?.id === island.id) {
          setSelectedIsland({ ...island, image_url: data.imageUrl })
        }
      }
    } catch (err) {
      console.error('Failed to generate image:', err)
    } finally {
      setGeneratingId(null)
    }
  }

  useEffect(() => {
    if (userId) fetchIslands()
  }, [userId])

  // Tour mode auto-advance
  useEffect(() => {
    if (tourMode && islands.length > 0) {
      const timer = setTimeout(() => {
        setTourIndex((prev) => (prev + 1) % islands.length)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [tourMode, tourIndex, islands.length])

  const getIslandColor = (index: number) => {
    const colors = ['#FFB5E8', '#B5DEFF', '#BFFCC6', '#FFC9DE', '#C4FAF8']
    return colors[index % colors.length]
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #4a2c7a 30%, #c77dba 60%, #ffd1a4 100%)',
        }}
      >
        <div className="text-center text-white">
          <div className="text-6xl animate-bounce mb-4">🏝️</div>
          <p className="text-xl font-bold">Entering your mind...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #4a2c7a 25%, #7b4397 40%, #c77dba 55%, #e8a4c9 70%, #ffd1a4 85%, #ffb347 100%)',
      }}
    >
      {/* Stars in the sky */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 40 + '%',
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's',
            }}
          />
        ))}
      </div>

      {/* Distant clouds - back layer */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={`cloud-back-${i}`}
            className="absolute opacity-30"
            style={{
              left: `${i * 25 - 10}%`,
              top: `${15 + i * 5}%`,
              animation: `floatCloud ${40 + i * 10}s linear infinite`,
              animationDelay: `${i * -8}s`,
            }}
          >
            <svg width="200" height="80" viewBox="0 0 200 80">
              <ellipse cx="100" cy="50" rx="80" ry="25" fill="rgba(255,255,255,0.3)" />
              <ellipse cx="60" cy="45" rx="40" ry="20" fill="rgba(255,255,255,0.3)" />
              <ellipse cx="140" cy="45" rx="45" ry="22" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
        ))}
      </div>

      {/* Mid clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={`cloud-mid-${i}`}
            className="absolute opacity-40"
            style={{
              left: `${i * 30}%`,
              top: `${35 + (i % 2) * 10}%`,
              animation: `floatCloud ${30 + i * 8}s linear infinite`,
              animationDelay: `${i * -6}s`,
            }}
          >
            <svg width="150" height="60" viewBox="0 0 150 60">
              <ellipse cx="75" cy="35" rx="60" ry="20" fill="rgba(255,255,255,0.4)" />
              <ellipse cx="45" cy="30" rx="30" ry="15" fill="rgba(255,255,255,0.4)" />
              <ellipse cx="105" cy="32" rx="35" ry="18" fill="rgba(255,255,255,0.4)" />
            </svg>
          </div>
        ))}
      </div>

      {/* Memory orbs floating */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 15 + 8 + 'px',
              height: Math.random() * 15 + 8 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 60 + 30 + '%',
              background: `radial-gradient(circle at 30% 30%, ${['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'][i % 5]}, transparent)`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px ${['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'][i % 5]}`,
              animation: `floatOrb ${Math.random() * 8 + 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* The Abyss - bottom cliff edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, #2d1b3d 30%, #1a1a2e 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{
          background: 'repeating-linear-gradient(90deg, #3d2b4d 0px, #2d1b3d 20px, #3d2b4d 40px)',
          clipPath: 'polygon(0 30%, 5% 20%, 10% 40%, 15% 25%, 20% 35%, 25% 15%, 30% 30%, 35% 20%, 40% 40%, 45% 25%, 50% 35%, 55% 20%, 60% 30%, 65% 15%, 70% 35%, 75% 25%, 80% 40%, 85% 20%, 90% 30%, 95% 25%, 100% 35%, 100% 100%, 0 100%)',
        }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
            Islands of You
          </h1>
          <p className="text-white/70 text-sm">your personality mindscape</p>
        </div>
        <div className="flex gap-2">
          {islands.length > 0 && (
            <button
              onClick={() => setTourMode(!tourMode)}
              className="px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{
                backgroundColor: tourMode ? '#FFD700' : 'rgba(255,255,255,0.2)',
                color: tourMode ? 'black' : 'white',
                border: '2px solid white',
              }}
            >
              {tourMode ? '⏸ Pause' : '▶ Tour'}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full font-bold text-xl transition-all hover:scale-110"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Islands */}
      {islands.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-center p-8 rounded-2xl max-w-sm mx-4"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <div className="text-6xl mb-4">🏝️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Discover Your Islands</h2>
            <p className="text-white/70 mb-6">
              We&apos;ll analyze your conversations to find the core themes that make you YOU
            </p>
            <button
              onClick={analyzeAndCreateIslands}
              disabled={isAnalyzing}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                border: '3px solid white',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
              }}
            >
              {isAnalyzing ? '✨ Discovering...' : '✨ Discover My Islands'}
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0">
          {islands.map((island, index) => {
            const pos = ISLAND_POSITIONS[index] || ISLAND_POSITIONS[0]
            const isHighlighted = tourMode && tourIndex === index
            const isSelected = selectedIsland?.id === island.id

            return (
              <button
                key={island.id}
                onClick={() => setSelectedIsland(island)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scale(${pos.scale * (isHighlighted ? 1.2 : 1)})`,
                  animation: `floatIsland 4s ease-in-out infinite`,
                  animationDelay: `${pos.delay}s`,
                  zIndex: isHighlighted ? 15 : 10 - index,
                  filter: isHighlighted ? 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                }}
              >
                {/* Island base */}
                <div className="relative">
                  {/* Floating island rock */}
                  <svg width="160" height="120" viewBox="0 0 160 120" className="absolute top-0 left-1/2 -translate-x-1/2">
                    {/* Island top surface */}
                    <ellipse cx="80" cy="40" rx="70" ry="25" fill={getIslandColor(index)} stroke="#333" strokeWidth="2"/>
                    {/* Island cliff sides */}
                    <path
                      d="M10 40 Q20 80 40 100 Q60 110 80 105 Q100 110 120 100 Q140 80 150 40"
                      fill="#8B7355"
                      stroke="#5D4E37"
                      strokeWidth="2"
                    />
                    {/* Cliff texture lines */}
                    <path d="M25 50 L35 90" stroke="#5D4E37" strokeWidth="1" opacity="0.5"/>
                    <path d="M50 45 L55 95" stroke="#5D4E37" strokeWidth="1" opacity="0.5"/>
                    <path d="M80 42 L80 105" stroke="#5D4E37" strokeWidth="1" opacity="0.5"/>
                    <path d="M110 45 L105 95" stroke="#5D4E37" strokeWidth="1" opacity="0.5"/>
                    <path d="M135 50 L125 90" stroke="#5D4E37" strokeWidth="1" opacity="0.5"/>
                  </svg>

                  {/* Island content */}
                  <div className="relative z-10 flex flex-col items-center pt-2">
                    {island.image_url ? (
                      <div
                        className="w-20 h-20 rounded-xl overflow-hidden mb-1"
                        style={{
                          border: '3px solid white',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        }}
                      >
                        <img
                          src={island.image_url}
                          alt={island.theme_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl mb-1"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: '3px solid white',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        }}
                      >
                        {island.theme_emoji}
                      </div>
                    )}
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                      }}
                    >
                      {island.theme_name}
                    </div>
                  </div>

                  {/* Glow effect for highlighted island */}
                  {isHighlighted && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        backgroundColor: 'rgba(255, 215, 0, 0.3)',
                        transform: 'scale(1.5)',
                      }}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Re-analyze button */}
      {islands.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={analyzeAndCreateIslands}
            disabled={isAnalyzing}
            className="px-6 py-2 rounded-full font-bold text-sm transition-all hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.5)',
              backdropFilter: 'blur(5px)',
            }}
          >
            {isAnalyzing ? '✨ Rediscovering...' : '🔄 Rediscover Islands'}
          </button>
        </div>
      )}

      {/* Selected Island Modal */}
      {selectedIsland && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSelectedIsland(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
              border: '4px solid black',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedIsland(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center font-bold text-lg rounded-full hover:scale-110 transition-transform"
              style={{ backgroundColor: '#FFB5E8', border: '2px solid black' }}
            >
              ×
            </button>

            <div className="text-center">
              {selectedIsland.image_url ? (
                <div
                  className="w-32 h-32 mx-auto rounded-2xl overflow-hidden mb-4"
                  style={{
                    border: '4px solid black',
                    boxShadow: '6px 6px 0 black',
                  }}
                >
                  <img
                    src={selectedIsland.image_url}
                    alt={selectedIsland.theme_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-6xl mb-4"
                  style={{
                    backgroundColor: getIslandColor(islands.findIndex(i => i.id === selectedIsland.id)),
                    border: '4px solid black',
                    boxShadow: '6px 6px 0 black',
                  }}
                >
                  {selectedIsland.theme_emoji}
                </div>
              )}

              <h2 className="text-2xl font-black mb-2">
                {selectedIsland.theme_emoji} {selectedIsland.theme_name}
              </h2>

              {selectedIsland.theme_description && (
                <p className="text-sm text-gray-600 mb-4">{selectedIsland.theme_description}</p>
              )}

              {/* Strength meter */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Island Strength</span>
                  <span>{Math.round(selectedIsland.strength * 100)}%</span>
                </div>
                <div
                  className="h-4 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#eee', border: '2px solid black' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedIsland.strength * 100}%`,
                      background: `linear-gradient(90deg, #FFD700, #FF69B4)`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => generateImage(selectedIsland)}
                disabled={generatingId !== null}
                className="w-full py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background: selectedIsland.image_url
                    ? 'linear-gradient(135deg, #87CEEB, #B5DEFF)'
                    : 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                {generatingId === selectedIsland.id
                  ? '🎨 Creating Art...'
                  : selectedIsland.image_url
                  ? '🔄 Generate New Art'
                  : '🎨 Generate Island Art'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes floatIsland {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        @keyframes floatCloud {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
