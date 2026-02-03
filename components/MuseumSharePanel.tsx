'use client'

import { useState, useEffect } from 'react'

interface MuseumSharePanelProps {
  userId: string
  itemCount: number
}

export default function MuseumSharePanel({ userId, itemCount }: MuseumSharePanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [shareSlug, setShareSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [userId])

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/museum/share?userId=${userId}`)
      const data = await res.json()
      setIsPublic(data.isPublic)
      setShareSlug(data.shareSlug)
    } catch (err) {
      console.error('Failed to fetch museum settings:', err)
    }
    setLoading(false)
  }

  const togglePublic = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/museum/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          isPublic: !isPublic,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsPublic(data.isPublic)
        setShareSlug(data.shareSlug)
      }
    } catch (err) {
      console.error('Failed to update settings:', err)
    }
    setSaving(false)
  }

  const copyLink = async () => {
    if (!shareSlug) return
    const url = `https://museum.ngrok.app/museum/${shareSlug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = shareSlug ? `https://museum.ngrok.app/museum/${shareSlug}` : null

  return (
    <div className="relative" style={{  }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 font-bold hover:scale-105 transition-transform"
        style={{
          backgroundColor: isPublic ? '#90EE90' : 'white',
          border: '3px solid black',
          borderRadius: '9999px',
          boxShadow: '3px 3px 0 black',
        }}
      >
        {isPublic ? '🌍 public' : '🔒 private'}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className="absolute right-0 top-full mt-2 w-80 p-4 z-50"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '16px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            <h3 className="font-bold text-lg mb-3">share your museum</h3>

            {loading ? (
              <div className="text-center py-4">
                <div className="text-2xl animate-spin">🏛️</div>
              </div>
            ) : (
              <>
                {/* Public Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-sm">make public</p>
                    <p className="text-xs text-gray-600">anyone with the link can view</p>
                  </div>
                  <button
                    onClick={togglePublic}
                    disabled={saving || itemCount === 0}
                    className="w-14 h-8 rounded-full relative transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: isPublic ? '#90EE90' : '#E5E5E5',
                      border: '3px solid black',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full absolute top-0.5 transition-transform"
                      style={{
                        backgroundColor: 'white',
                        border: '2px solid black',
                        transform: isPublic ? 'translateX(24px)' : 'translateX(2px)',
                      }}
                    />
                  </button>
                </div>

                {itemCount === 0 && (
                  <p className="text-xs text-gray-500 mb-4">
                    add some items to your gift shop before sharing!
                  </p>
                )}

                {/* Share Link */}
                {isPublic && shareUrl && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-600">share link:</p>
                    <div
                      className="p-2 text-xs break-all"
                      style={{
                        backgroundColor: '#FAFAFA',
                        border: '2px solid black',
                        borderRadius: '8px',
                      }}
                    >
                      {shareUrl}
                    </div>
                    <button
                      onClick={copyLink}
                      className="w-full py-2 font-bold hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: copied ? '#90EE90' : '#87CEEB',
                        border: '3px solid black',
                        borderRadius: '9999px',
                        boxShadow: '2px 2px 0 black',
                      }}
                    >
                      {copied ? '✓ copied!' : '📋 copy link'}
                    </button>
                  </div>
                )}

                {!isPublic && (
                  <p className="text-xs text-gray-500 text-center">
                    your museum is currently private
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
