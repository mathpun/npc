'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface ChangePasswordProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePassword({ isOpen, onClose }: ChangePasswordProps) {
  const { theme } = useTheme()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const userId = localStorage.getItem('npc_user_id')
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to change password')
      } else {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setSuccess(false)
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        }, 2000)
      }
    } catch (err) {
      setError('Something went wrong')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="relative w-full max-w-md p-6"
        style={{
          backgroundColor: theme.colors.backgroundAccent,
          border: '4px solid black',
          borderRadius: '20px',
          boxShadow: '8px 8px 0 black',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center font-bold hover:scale-110 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '2px solid black',
            borderRadius: '50%',
          }}
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h2 className="text-xl font-bold">Change Password</h2>
        </div>

        {success ? (
          <div
            className="text-center py-8"
            style={{
              backgroundColor: theme.colors.buttonSuccess,
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            <div className="text-4xl mb-2">✓</div>
            <p className="font-bold">Password changed!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 text-black"
                style={{
                  border: '3px solid black',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 text-black"
                style={{
                  border: '3px solid black',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                }}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 text-black"
                style={{
                  border: '3px solid black',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                }}
                required
              />
            </div>

            {error && (
              <p
                className="text-center text-sm p-2 font-bold"
                style={{
                  backgroundColor: theme.colors.buttonDanger || '#FFB6C1',
                  border: '2px solid black',
                  borderRadius: '8px',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.buttonPrimary,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
