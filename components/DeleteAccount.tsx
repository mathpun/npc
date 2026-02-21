'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useTheme } from '@/lib/ThemeContext'

interface DeleteAccountProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccount({ isOpen, onClose }: DeleteAccountProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'warning' | 'confirm'>('warning')

  const handleDelete = async () => {
    setError(null)

    if (confirmText.toLowerCase() !== 'delete') {
      setError('Please type "delete" to confirm')
      return
    }

    setLoading(true)

    try {
      const userId = localStorage.getItem('npc_user_id')
      const res = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to delete account')
        setLoading(false)
        return
      }

      // Clear all local storage
      localStorage.removeItem('youthai_profile')
      localStorage.removeItem('npc_user_id')
      localStorage.removeItem('youthai_journal')
      localStorage.removeItem('youthai_shared')
      localStorage.removeItem('npc_color_skin')

      // Sign out from NextAuth
      await signOut({ redirect: false })

      // Redirect to home page
      router.push('/')
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('warning')
    setPassword('')
    setConfirmText('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div
        className="relative w-full max-w-md p-6 max-h-[90vh] overflow-y-auto text-black"
        style={{
          backgroundColor: 'white',
          border: '4px solid black',
          borderRadius: '20px',
          boxShadow: '8px 8px 0 black',
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center font-bold hover:scale-110 transition-transform"
          style={{
            backgroundColor: theme.colors.accent1,
            border: '2px solid black',
            borderRadius: '50%',
          }}
        >
          X
        </button>

        {step === 'warning' ? (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">
                <span role="img" aria-label="warning">
                  ⚠️
                </span>
              </div>
              <h2 className="text-xl font-bold">Delete Account?</h2>
            </div>

            <div
              className="p-4 mb-4"
              style={{
                backgroundColor: '#FFF3CD',
                border: '3px solid black',
                borderRadius: '12px',
              }}
            >
              <p className="font-bold mb-2">This will permanently delete:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>
                  <span role="img" aria-label="chat">
                    💬
                  </span>{' '}
                  All your chat history
                </li>
                <li>
                  <span role="img" aria-label="journal">
                    📔
                  </span>{' '}
                  Journal entries &amp; reflections
                </li>
                <li>
                  <span role="img" aria-label="museum">
                    🏛️
                  </span>{' '}
                  Your museum collection
                </li>
                <li>
                  <span role="img" aria-label="growth">
                    🌱
                  </span>{' '}
                  Goals &amp; achievements
                </li>
                <li>
                  <span role="img" aria-label="profile">
                    👤
                  </span>{' '}
                  Your profile &amp; settings
                </li>
              </ul>
            </div>

            <p className="text-center text-sm mb-4 text-gray-600">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: theme.colors.buttonSuccess,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                Keep Account
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 py-3 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: '#FF6B6B',
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">
                <span role="img" aria-label="trash">
                  🗑️
                </span>
              </div>
              <h2 className="text-xl font-bold">Confirm Deletion</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Enter your password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-black"
                  style={{
                    border: '3px solid black',
                    borderRadius: '12px',
                    backgroundColor: '#FFFACD',
                  }}
                  placeholder="Your password"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Type &quot;delete&quot; to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 text-black"
                  style={{
                    border: '3px solid black',
                    borderRadius: '12px',
                    backgroundColor: '#FFFACD',
                  }}
                  placeholder="delete"
                />
              </div>

              {error && (
                <p
                  className="text-center text-sm p-2 font-bold"
                  style={{
                    backgroundColor: '#FFB6C1',
                    border: '2px solid black',
                    borderRadius: '8px',
                  }}
                >
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('warning')}
                  className="flex-1 py-3 font-bold hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: 'white',
                    border: '3px solid black',
                    borderRadius: '12px',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  Go Back
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading || confirmText.toLowerCase() !== 'delete'}
                  className="flex-1 py-3 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                  style={{
                    backgroundColor:
                      confirmText.toLowerCase() === 'delete' ? '#FF6B6B' : '#ccc',
                    border: '3px solid black',
                    borderRadius: '12px',
                    boxShadow: '3px 3px 0 black',
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
