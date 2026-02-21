'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface WorldInviteProps {
  isOpen: boolean
  onClose: () => void
  worldId: number
  worldName: string
  inviteCode: string | null
  shareSlug: string | null
  isPublic: boolean
  isOwner: boolean
  userId: string
}

export default function WorldInvite({
  isOpen,
  onClose,
  worldId,
  worldName,
  inviteCode,
  shareSlug,
  isPublic,
  isOwner,
  userId,
}: WorldInviteProps) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState<'invite' | 'public' | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [currentInviteCode, setCurrentInviteCode] = useState(inviteCode)

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/create/join/${currentInviteCode}`
    : ''

  const publicUrl = typeof window !== 'undefined' && shareSlug
    ? `${window.location.origin}/create/view/${shareSlug}`
    : ''

  const copyToClipboard = async (text: string, type: 'invite' | 'public') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const regenerateCode = async () => {
    setRegenerating(true)
    try {
      const res = await fetch(`/api/world/${worldId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.inviteCode) {
        setCurrentInviteCode(data.inviteCode)
      }
    } catch (err) {
      console.error('Failed to regenerate code:', err)
    }
    setRegenerating(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{
          backgroundColor: theme.colors.background,
          border: '4px solid black',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: theme.colors.text }}>
          Share {worldName}
        </h2>
        <p className="text-center mb-6" style={{ color: theme.colors.textMuted }}>
          Invite friends to collaborate or share publicly
        </p>

        {/* Invite Link Section */}
        <div className="mb-6">
          <h3 className="font-bold mb-2" style={{ color: theme.colors.text }}>
            Invite Collaborators
          </h3>
          <p className="text-sm mb-3" style={{ color: theme.colors.textMuted }}>
            Friends who join can add their own elements
          </p>

          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '2px solid black',
            }}
          >
            <input
              type="text"
              value={inviteUrl}
              readOnly
              className="flex-1 bg-transparent text-sm font-mono"
              style={{ color: theme.colors.text }}
            />
            <button
              onClick={() => copyToClipboard(inviteUrl, 'invite')}
              className="px-3 py-1 text-sm font-bold rounded-lg hover:scale-105 transition-transform"
              style={{
                backgroundColor: copied === 'invite' ? theme.colors.buttonSuccess : theme.colors.buttonPrimary,
                border: '2px solid black',
                color: theme.colors.text,
              }}
            >
              {copied === 'invite' ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {isOwner && (
            <button
              onClick={regenerateCode}
              disabled={regenerating}
              className="mt-2 text-sm font-medium hover:underline"
              style={{ color: theme.colors.textMuted }}
            >
              {regenerating ? 'Regenerating...' : 'Regenerate invite code'}
            </button>
          )}
        </div>

        {/* Public Link Section */}
        {isPublic && shareSlug && (
          <div className="mb-6">
            <h3 className="font-bold mb-2" style={{ color: theme.colors.text }}>
              Public Link
            </h3>
            <p className="text-sm mb-3" style={{ color: theme.colors.textMuted }}>
              Anyone can explore (read-only)
            </p>

            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px solid black',
              }}
            >
              <input
                type="text"
                value={publicUrl}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono"
                style={{ color: theme.colors.text }}
              />
              <button
                onClick={() => copyToClipboard(publicUrl, 'public')}
                className="px-3 py-1 text-sm font-bold rounded-lg hover:scale-105 transition-transform"
                style={{
                  backgroundColor: copied === 'public' ? theme.colors.buttonSuccess : theme.colors.buttonSecondary,
                  border: '2px solid black',
                  color: theme.colors.text,
                }}
              >
                {copied === 'public' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div
          className="p-3 rounded-xl text-sm"
          style={{
            backgroundColor: theme.colors.accent2,
            border: '2px solid black',
            color: theme.colors.text,
          }}
        >
          {isPublic ? (
            <>Your world is <strong>public</strong> - anyone with the link can explore it.</>
          ) : (
            <>Your world is <strong>private</strong> - only collaborators with the invite link can access it.</>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 font-bold rounded-xl hover:scale-105 transition-transform"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '2px solid black',
            color: theme.colors.text,
          }}
        >
          Done
        </button>
      </div>
    </div>
  )
}
