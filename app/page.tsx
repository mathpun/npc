'use client'

import Link from 'next/link'
import NavBar from '@/components/NavBar'
import { useTheme } from '@/lib/ThemeContext'

export default function Home() {
  const { theme } = useTheme()

  return (
    <main className="min-h-screen font-hand" style={{ backgroundColor: theme.colors.background }}>
      {/* Nav */}
      <NavBar />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            an AI that
            <br />
            <span
              className="inline-block px-4 py-2 mt-2 -rotate-2"
              style={{
                backgroundColor: theme.colors.accent2,
                border: '4px solid black',
                boxShadow: '6px 6px 0 black',
              }}
            >
              asks questions
            </span>
          </h1>

          {/* Little blob character */}
          <div className="flex justify-center my-8">
            <svg width="120" height="140" viewBox="0 0 60 70">
              <ellipse cx="30" cy="45" rx="20" ry="25" fill={theme.colors.accent5} stroke="black" strokeWidth="3"/>
              <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
              <circle cx="24" cy="18" r="5" fill="black"/>
              <circle cx="36" cy="18" r="5" fill="black"/>
              <circle cx="25" cy="16" r="2" fill="white"/>
              <circle cx="37" cy="16" r="2" fill="white"/>
              <path d="M24 28 Q30 33 36 28" stroke="black" strokeWidth="2" fill="none"/>
            </svg>
          </div>

          {/* Subtitle */}
          <p
            className="text-xl md:text-2xl mb-4 p-4 inline-block rotate-1"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              boxShadow: '4px 4px 0 black',
            }}
          >
            instead of just giving you answers
          </p>
          <p className="text-lg text-gray-700 mb-10 max-w-md mx-auto">
            a thinking partner that helps you figure things out for yourself
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-10 py-5 text-xl font-bold hover:scale-110 hover:rotate-2 transition-all"
              style={{
                backgroundColor: theme.colors.buttonSuccess,
                border: '4px solid black',
                borderRadius: '20px',
                boxShadow: '6px 6px 0 black',
              }}
            >
              start chatting
            </Link>
          </div>

          {/* About link */}
          <div className="mt-8">
            <Link
              href="/about"
              className="text-sm font-bold hover:scale-105 transition-transform inline-flex items-center gap-2"
              style={{ color: '#666' }}
            >
              learn more about how it works →
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-4 py-16" style={{ backgroundColor: theme.colors.backgroundAlt }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-5xl font-bold inline-block px-6 py-3 -rotate-1"
              style={{
                backgroundColor: theme.colors.accent2,
                border: '4px solid black',
                boxShadow: '6px 6px 0 black',
              }}
            >
              how it&apos;s different
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              className="p-6 hover:scale-105 transition-transform rotate-1"
              style={{
                backgroundColor: theme.colors.accent5,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '5px 5px 0 black',
              }}
            >
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">thinks with you</h3>
              <p className="text-sm">
                asks questions to help you understand what you actually think, instead of just telling you what to do
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="p-6 hover:scale-105 transition-transform -rotate-1"
              style={{
                backgroundColor: theme.colors.accent3,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '5px 5px 0 black',
              }}
            >
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">honest about limits</h3>
              <p className="text-sm">
                says &quot;I don&apos;t know&quot; when it doesn&apos;t. reminds you to talk to real people when that&apos;s what you need.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="p-6 hover:scale-105 transition-transform rotate-2"
              style={{
                backgroundColor: theme.colors.accent4,
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '5px 5px 0 black',
              }}
            >
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">private by design</h3>
              <p className="text-sm">
                your conversations stay yours. we don&apos;t sell your data or use it to train AI models.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="relative z-10 px-4 py-16" style={{ backgroundColor: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-10">
            what people use it for
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🪞', title: 'identity exploration', desc: 'figure out who you are and want to be' },
              { emoji: '💭', title: 'processing feelings', desc: 'talk through what\'s on your mind' },
              { emoji: '✨', title: 'creative projects', desc: 'brainstorm ideas and get unstuck' },
              { emoji: '🎯', title: 'making decisions', desc: 'think through your options clearly' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 text-center hover:scale-110 transition-transform cursor-pointer"
                style={{
                  backgroundColor: theme.colors.primary[i % theme.colors.primary.length],
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 0 black',
                  transform: `rotate(${(i % 2 === 0 ? -2 : 2)}deg)`,
                }}
              >
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-4 py-16" style={{ backgroundColor: theme.colors.backgroundAccent }}>
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="p-10 rotate-1"
            style={{
              backgroundColor: 'white',
              border: '4px solid black',
              borderRadius: '20px',
              boxShadow: '8px 8px 0 black',
            }}
          >
            {/* Little excited blob */}
            <div className="flex justify-center mb-6">
              <svg width="80" height="90" viewBox="0 0 60 70">
                <ellipse cx="30" cy="45" rx="20" ry="25" fill={theme.colors.accent2} stroke="black" strokeWidth="3"/>
                <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
                <circle cx="22" cy="16" r="6" fill="black"/>
                <circle cx="38" cy="16" r="6" fill="black"/>
                <circle cx="24" cy="14" r="2" fill="white"/>
                <circle cx="40" cy="14" r="2" fill="white"/>
                <ellipse cx="30" cy="28" rx="8" ry="5" fill="black"/>
                {/* Arms up */}
                <line x1="10" y1="35" x2="0" y2="20" stroke="black" strokeWidth="3" strokeLinecap="round"/>
                <line x1="50" y1="35" x2="60" y2="20" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ready to try it?
            </h2>
            <p className="text-lg mb-8">
              free to use. no credit card needed.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-10 py-5 text-xl font-bold hover:scale-110 hover:-rotate-2 transition-all"
              style={{
                backgroundColor: theme.colors.buttonPrimary,
                border: '4px solid black',
                borderRadius: '9999px',
                boxShadow: '5px 5px 0 black',
              }}
            >
              start a conversation
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="relative z-10 px-4 py-8 border-t-4 border-black border-dashed"
        style={{ backgroundColor: theme.colors.accent5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👻</span>
              <span className="text-xl font-bold">npc</span>
            </div>
            <p
              className="text-sm text-center px-4 py-2"
              style={{
                backgroundColor: 'white',
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              not a therapist. not a replacement for friends. a thinking partner.
            </p>
          </div>

          {/* Footer links */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t-2 border-dashed border-black/30">
            <Link
              href="/about"
              className="text-sm font-bold hover:scale-105 transition-transform px-3 py-1"
              style={{
                backgroundColor: 'white',
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              about
            </Link>
            <a
              href="https://forms.gle/iWyp8pUumivZDMxr7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold hover:scale-105 transition-transform px-3 py-1"
              style={{
                backgroundColor: 'white',
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              feedback
            </a>
            <Link
              href="/privacy"
              className="text-sm font-bold hover:scale-105 transition-transform px-3 py-1"
              style={{
                backgroundColor: 'white',
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              privacy
            </Link>
          </div>

          <p className="text-center text-xs mt-4 opacity-60">
            made for teens who want to think for themselves
          </p>
        </div>
      </footer>
    </main>
  )
}
