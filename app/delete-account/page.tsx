'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'

export default function DeleteAccountPage() {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete') {
      setError('Please type "delete" to confirm')
      return
    }

    const userId = localStorage.getItem('npc_user_id')
    if (!userId) {
      setError('No account found')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        // Clear local storage
        localStorage.removeItem('npc_user_id')
        localStorage.removeItem('youthai_profile')
        localStorage.removeItem('ai_data_consent')
        setSuccess(true)

        // Redirect after a moment
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete account')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#7FDBFF' }}>
        <NavBar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className="max-w-md w-full p-8 text-center"
            style={{
              backgroundColor: 'white',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '8px 8px 0 black',
            }}
          >
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-2xl font-bold mb-4">Account Deleted</h1>
            <p className="text-gray-600 mb-4">
              Your account and all data have been deleted. We're sorry to see you go!
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to home page...
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#7FDBFF' }}>
      <NavBar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="max-w-md w-full p-6"
          style={{
            backgroundColor: 'white',
            border: '4px solid black',
            borderRadius: '20px',
            boxShadow: '8px 8px 0 black',
          }}
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">😢</div>
            <h1 className="text-2xl font-bold">Delete Account</h1>
            <p className="text-gray-600 mt-2">
              We're sad to see you go! This will permanently delete all your data.
            </p>
          </div>

          <div
            className="p-4 mb-6 rounded-xl"
            style={{
              backgroundColor: '#FFE4E4',
              border: '2px solid #FF6B6B',
            }}
          >
            <p className="font-bold text-red-700 mb-2">⚠️ This action cannot be undone!</p>
            <p className="text-sm text-red-600">
              Deleting your account will permanently remove:
            </p>
            <ul className="text-sm text-red-600 mt-2 space-y-1">
              <li>• All your chat history</li>
              <li>• Your profile and preferences</li>
              <li>• Journal entries and check-ins</li>
              <li>• Islands of You and insights</li>
              <li>• Everything else</li>
            </ul>
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-2">
              Type "delete" to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              className="w-full px-4 py-3 text-lg"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
              }}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 border-2 border-red-400 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/chat"
              className="flex-1 py-3 text-center font-bold rounded-xl hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#90EE90',
                border: '3px solid black',
                boxShadow: '3px 3px 0 black',
              }}
            >
              keep my account
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting || confirmText.toLowerCase() !== 'delete'}
              className="flex-1 py-3 font-bold rounded-xl transition-transform disabled:opacity-50"
              style={{
                backgroundColor: '#FF6B6B',
                border: '3px solid black',
                boxShadow: '3px 3px 0 black',
              }}
            >
              {isDeleting ? 'deleting...' : 'delete forever'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
