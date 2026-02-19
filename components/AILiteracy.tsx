'use client'

import { useTheme } from '@/lib/ThemeContext'

import { useState } from 'react'

interface UserProfile {
  name: string
  currentAge: number
  interests: string[]
  currentGoals: string
}

interface AILiteracyProps {
  profile: UserProfile
}

export default function AILiteracy({ profile }: AILiteracyProps) {
  const { theme } = useTheme()
  const [expandedSection, setExpandedSection] = useState<string | null>('what-ai-knows')

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-black" style={{  }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-3 inline-block px-6 py-2 -rotate-1"
          style={{
            backgroundColor: theme.colors.accent4,
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 black',
          }}
        >
          👁️ AI Transparency 👁️
        </h1>
        <p className="text-lg mt-4">Know what's happening under the hood!</p>
      </div>

      {/* What AI Knows */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: theme.colors.accent3,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4">🧠 What the AI Knows About You</h2>
        <div
          className="p-4"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '3px solid black',
            borderRadius: '12px',
          }}
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2" style={{ backgroundColor: theme.colors.backgroundAccent, borderRadius: '8px' }}>
              <span className="font-bold">Name:</span>
              <span>{profile.name}</span>
            </div>
            <div className="flex justify-between p-2" style={{ backgroundColor: theme.colors.backgroundAccent, borderRadius: '8px' }}>
              <span className="font-bold">Age:</span>
              <span>{profile.currentAge}</span>
            </div>
            <div className="flex justify-between p-2" style={{ backgroundColor: theme.colors.backgroundAccent, borderRadius: '8px' }}>
              <span className="font-bold">Interests:</span>
              <span>{profile.interests.slice(0, 3).join(', ')}</span>
            </div>
          </div>
        </div>
        <div
          className="mt-3 p-3 flex items-center gap-2"
          style={{
            backgroundColor: theme.colors.accent2,
            border: '2px solid black',
            borderRadius: '8px',
          }}
        >
          <span>✅</span>
          <p className="text-sm">The AI ONLY knows this! It can't see your other apps or search history.</p>
        </div>
      </div>

      {/* How It Works */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: theme.colors.accent5,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4">⚙️ How Responses Are Generated</h2>
        <div className="space-y-2">
          {[
            { step: 1, title: 'Your message is sent', emoji: '📤', color: theme.colors.accent1 },
            { step: 2, title: 'Safety guidelines applied', emoji: '🛡️', color: theme.colors.accent4 },
            { step: 3, title: 'AI generates response', emoji: '🤖', color: theme.colors.accent3 },
            { step: 4, title: 'Safety checks before showing', emoji: '✓', color: theme.colors.accent2 },
          ].map((item) => (
            <div
              key={item.step}
              className="p-3 flex items-center gap-3"
              style={{
                backgroundColor: item.color,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              <div
                className="w-8 h-8 flex items-center justify-center font-bold"
                style={{
                  backgroundColor: theme.colors.backgroundAlt,
                  border: '2px solid black',
                  borderRadius: '50%',
                }}
              >
                {item.step}
              </div>
              <span className="text-xl">{item.emoji}</span>
              <span className="font-bold">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What AI Can't Do */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: theme.colors.background,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4">⚠️ What AI Can't Do</h2>
        <div className="space-y-2">
          {[
            "Know the future or predict outcomes",
            "Access real-time info (news, events)",
            "Remember previous sessions",
            "Feel emotions or truly understand you",
            "Replace professional help",
            "Always be right - AI makes mistakes!",
          ].map((limitation, index) => (
            <div
              key={index}
              className="p-2 flex items-center gap-2"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              <span className="text-lg">❌</span>
              <span className="text-sm">{limitation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Your Rights */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: theme.colors.backgroundAccent,
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4">✨ Your Rights</h2>
        <div className="space-y-2">
          {[
            { right: "See what data we have about you", emoji: "👁️" },
            { right: "Edit or delete your information", emoji: "✏️" },
            { right: "Download your journal entries", emoji: "📥" },
            { right: "Delete your account entirely", emoji: "🗑️" },
            { right: "Disagree with the AI anytime!", emoji: "🙅" },
          ].map((item, index) => (
            <div
              key={index}
              className="p-2 flex items-center gap-2"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="text-sm">{item.right}</span>
              <span className="ml-auto">✅</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tip */}
      <div
        className="p-4 text-center"
        style={{
          backgroundColor: theme.colors.backgroundAlt,
          border: '2px dashed black',
          borderRadius: '12px',
        }}
      >
        <p className="text-sm">
          🎓 Being AI-literate is a superpower! Understanding how AI works makes you harder to manipulate.
        </p>
      </div>
    </div>
  )
}
