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
          <div className="text-5xl mb-3">🤖</div>
          <h2
            className="text-xl font-bold inline-block px-4 py-2"
            style={{
              backgroundColor: theme.colors.accent1,
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            Before You Chat
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
          <p className="font-bold mb-3">This app uses AI to chat with you!</p>
          <p className="text-sm mb-3">
            When you send messages, they go to <strong>Anthropic</strong> (the company that makes Claude AI) 
            to generate responses.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span>📤</span>
              <span><strong>What we send:</strong> Your messages, name, age, and interests</span>
            </div>
            <div className="flex items-start gap-2">
              <span>🏢</span>
              <span><strong>Who receives it:</strong> Anthropic (AI provider)</span>
            </div>
            <div className="flex items-start gap-2">
              <span>🔒</span>
              <span><strong>How it's protected:</strong> Encrypted, not used for ads, not sold</span>
            </div>
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
          <span>📋 See more details</span>
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
              <strong>Why we need this:</strong> The AI needs context about you to give helpful, 
              personalized responses. We send your first name, age range, and interests so it can 
              talk to you appropriately.
            </p>
            <p>
              <strong>What Anthropic does:</strong> They process your messages to generate responses. 
              They don't use your data for advertising or sell it to third parties. 
              See their <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">privacy policy</a>.
            </p>
            <p>
              <strong>Your rights:</strong> You can stop using the AI chat anytime. 
              See our <a href="/privacy" className="underline text-blue-600">privacy policy</a> for 
              how to request data deletion.
            </p>
          </div>
        )}

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
            No thanks
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
            I understand, let's go!
          </button>
        </div>

        <p className="text-xs text-center mt-4 opacity-70">
          You can review this anytime in Settings
        </p>
      </div>
    </div>
  )
}
