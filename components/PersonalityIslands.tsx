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
        alert('You\'ve used all your image generations for today!')
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-2">🏝️</div>
          <p className="font-bold text-sm">Loading islands...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-3 py-4">
      {islands.length === 0 ? (
        /* Empty state */
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: `linear-gradient(180deg, ${theme.colors.accent4} 0%, ${theme.colors.accent5} 100%)`,
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
          }}
        >
          <div className="text-4xl mb-3">🏝️</div>
          <h2 className="text-lg font-bold mb-2">Discover Your Islands</h2>
          <p className="text-xs mb-4 opacity-80">Find the core themes that make you YOU</p>
          <button
            onClick={analyzeAndCreateIslands}
            disabled={isAnalyzing}
            className="px-5 py-2.5 font-bold text-sm rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.accent1,
              border: '3px solid black',
              boxShadow: '4px 4px 0 black',
            }}
          >
            {isAnalyzing ? '🔍 Analyzing...' : '✨ Discover'}
          </button>
        </div>
      ) : (
        /* Islands Card - Screenshot friendly */
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '4px solid black',
            boxShadow: '6px 6px 0 black',
            background: `linear-gradient(180deg, #87CEEB 0%, #E6E6FA 50%, #FFB6C1 100%)`,
          }}
        >
          {/* Header */}
          <div className="text-center py-3 px-4">
            <h1 className="text-xl font-bold">🏝️ Islands of You</h1>
            <p className="text-xs opacity-70">your personality themes</p>
          </div>

          {/* Islands Grid */}
          <div className="grid grid-cols-2 gap-2 px-3 pb-3">
            {islands.slice(0, 4).map((island, index) => (
              <button
                key={island.id}
                onClick={() => setSelectedIsland(island)}
                className="p-3 rounded-xl text-center hover:scale-105 active:scale-95 transition-transform"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '3px solid black',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                {island.image_url ? (
                  <img
                    src={island.image_url}
                    alt={island.theme_name}
                    className="w-12 h-12 mx-auto rounded-lg object-cover mb-1"
                    style={{ border: '2px solid black' }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-2xl mb-1"
                    style={{ backgroundColor: getIslandColor(index), border: '2px solid black' }}
                  >
                    {island.theme_emoji}
                  </div>
                )}
                <div className="font-bold text-xs leading-tight">{island.theme_name}</div>
                <div
                  className="h-1.5 rounded-full mt-1.5 overflow-hidden"
                  style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${island.strength * 100}%`, backgroundColor: getIslandColor(index) }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* 5th island if exists */}
          {islands.length > 4 && (
            <div className="px-3 pb-3">
              <button
                onClick={() => setSelectedIsland(islands[4])}
                className="w-full p-2.5 rounded-xl flex items-center gap-3 hover:scale-[1.02] active:scale-100 transition-transform"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '3px solid black',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                {islands[4].image_url ? (
                  <img
                    src={islands[4].image_url}
                    alt={islands[4].theme_name}
                    className="w-10 h-10 rounded-lg object-cover"
                    style={{ border: '2px solid black' }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: getIslandColor(4), border: '2px solid black' }}
                  >
                    {islands[4].theme_emoji}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <div className="font-bold text-xs">{islands[4].theme_name}</div>
                  <div
                    className="h-1.5 rounded-full mt-1 overflow-hidden"
                    style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${islands[4].strength * 100}%`, backgroundColor: getIslandColor(4) }}
                    />
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Footer */}
          <div
            className="text-center py-2 px-3 text-[10px] font-bold"
            style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
          >
            tap an island to explore · npc.chat
          </div>
        </div>
      )}

      {/* Re-analyze button */}
      {islands.length > 0 && (
        <button
          onClick={analyzeAndCreateIslands}
          disabled={isAnalyzing}
          className="w-full mt-3 p-2 text-xs font-bold rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '2px solid black',
          }}
        >
          {isAnalyzing ? '🔍 Analyzing...' : '🔄 Re-discover'}
        </button>
      )}

      {/* Selected Island Modal */}
      {selectedIsland && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSelectedIsland(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl p-4"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '4px solid black',
              boxShadow: '8px 8px 0 black',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedIsland(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center font-bold rounded-full hover:scale-110"
              style={{ backgroundColor: theme.colors.accent1, border: '2px solid black' }}
            >
              ×
            </button>

            <div className="text-center">
              {/* Image/Emoji */}
              {selectedIsland.image_url ? (
                <img
                  src={selectedIsland.image_url}
                  alt={selectedIsland.theme_name}
                  className="w-24 h-24 mx-auto rounded-xl object-cover mb-3"
                  style={{ border: '3px solid black', boxShadow: '4px 4px 0 black' }}
                />
              ) : (
                <div
                  className="w-24 h-24 mx-auto rounded-xl flex items-center justify-center text-5xl mb-3"
                  style={{
                    backgroundColor: getIslandColor(islands.findIndex(i => i.id === selectedIsland.id)),
                    border: '3px solid black',
                    boxShadow: '4px 4px 0 black',
                  }}
                >
                  {selectedIsland.theme_emoji}
                </div>
              )}

              <h3 className="text-lg font-bold mb-1">
                {selectedIsland.theme_emoji} {selectedIsland.theme_name}
              </h3>

              {selectedIsland.theme_description && (
                <p className="text-xs mb-3 opacity-80">{selectedIsland.theme_description}</p>
              )}

              {/* Strength */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>strength</span>
                  <span>{Math.round(selectedIsland.strength * 100)}%</span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(0,0,0,0.1)', border: '2px solid black' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${selectedIsland.strength * 100}%`,
                      background: `linear-gradient(90deg, ${theme.colors.accent1}, ${theme.colors.accent3})`,
                    }}
                  />
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={() => generateImage(selectedIsland)}
                disabled={generatingId !== null}
                className="w-full py-2.5 font-bold text-sm rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                style={{
                  backgroundColor: selectedIsland.image_url ? theme.colors.accent3 : theme.colors.accent1,
                  border: '3px solid black',
                  boxShadow: '4px 4px 0 black',
                }}
              >
                {generatingId === selectedIsland.id
                  ? '🎨 Creating...'
                  : selectedIsland.image_url
                  ? '🔄 New Image'
                  : '🎨 Generate Art'}
              </button>

              {remainingGenerations !== null && (
                <p className="text-[10px] mt-2 opacity-60">{remainingGenerations} left today</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
