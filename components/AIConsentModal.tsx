'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface AIConsentModalProps {
  onAccept: () => void
  onDecline: () => void
}

export default function AIConsentModal({ onAccept, onDecline }: AIConsentModalProps) {
  const { theme } = useTheme()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-black">
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: theme.colors.background,
          border: '4px solid black',
          borderRadius: '20px',
          boxShadow: '8px 8px 0 black',
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h2
            className="text-xl font-bold inline-block px-4 py-2"
            style={{
              backgroundColor: theme.colors.accent1,
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            Data Sharing Permission
          </h2>
        </div>

        {/* Main explanation */}
        <div
          className="p-4 mb-4"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '3px solid black',
            borderRadius: '12px',
          }}
        >
          <p className="font-bold mb-3 text-lg">We need your permission to use AI chat</p>
          <p className="text-sm mb-4">
            To provide AI-powered conversations, we need to send some of your data to a third-party service.
            Please review what data is shared and with whom before continuing.
          </p>

          <div
            className="p-3 mb-3"
            style={{
              backgroundColor: '#FFF9C4',
              border: '2px solid black',
              borderRadius: '8px',
            }}
          >
            <p className="font-bold text-sm mb-2">📤 DATA WE WILL SEND:</p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Your chat messages</li>
              <li>Your first name or nickname</li>
              <li>Your age</li>
              <li>Your interests (from your profile)</li>
            </ul>
          </div>

          <div
            className="p-3"
            style={{
              backgroundColor: '#E3F2FD',
              border: '2px solid black',
              borderRadius: '8px',
            }}
          >
            <p className="font-bold text-sm mb-2">🏢 WHO RECEIVES THIS DATA:</p>
            <p className="text-sm">
              <strong>Anthropic, PBC</strong> - a US-based AI safety company that provides the Claude AI
              which powers our chat feature.
            </p>
            <a
              href="https://www.anthropic.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 underline"
            >
              View Anthropic's Privacy Policy →
            </a>
          </div>
        </div>

        {/* Expandable details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-3 mb-4 font-bold text-sm flex items-center justify-between"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '2px solid black',
            borderRadius: '8px',
          }}
        >
          <span>📋 How is my data protected?</span>
          <span>{expanded ? '▲' : '▼'}</span>
        </button>

        {expanded && (
          <div
            className="p-4 mb-4 text-sm space-y-3"
            style={{
              backgroundColor: 'white',
              border: '2px solid black',
              borderRadius: '8px',
            }}
          >
            <p>
              <strong>Encryption:</strong> All data is encrypted when sent to Anthropic using
              industry-standard HTTPS/TLS encryption.
            </p>
            <p>
              <strong>No advertising:</strong> Anthropic does not use your data for advertising
              purposes and does not sell your data to third parties.
            </p>
            <p>
              <strong>No AI training:</strong> Your conversations are not used to train AI models.
            </p>
            <p>
              <strong>Your rights:</strong> You can stop using AI chat anytime and request deletion
              of your data. See our <a href="/privacy" className="underline text-blue-600">privacy policy</a>.
            </p>
          </div>
        )}

        {/* Consent confirmation */}
        <div
          className="p-3 mb-4 text-sm"
          style={{
            backgroundColor: '#E8F5E9',
            border: '2px solid black',
            borderRadius: '8px',
          }}
        >
          <p>
            By tapping "I Agree", you consent to sharing the data listed above with Anthropic
            for the purpose of providing AI chat responses.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-3 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            Don't Allow
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.colors.buttonSuccess,
              border: '3px solid black',
              borderRadius: '12px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            I Agree
          </button>
        </div>

        <p className="text-xs text-center mt-4 opacity-70">
          You can withdraw consent anytime in Settings or by contacting us
        </p>
      </div>
    </div>
  )
}
