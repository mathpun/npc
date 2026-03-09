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
          {/* Hook question */}
          <p
            className="text-xl md:text-2xl mb-6 inline-block px-6 py-3 -rotate-1"
            style={{
              backgroundColor: theme.colors.accent3,
              border: '3px solid black',
              boxShadow: '4px 4px 0 black',
              borderRadius: '12px',
            }}
          >
            ever feel like an npc?
          </p>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            sometimes it helps to
            <br />
            <span
              className="inline-block px-4 py-2 mt-2 rotate-1"
              style={{
                backgroundColor: theme.colors.accent2,
                border: '4px solid black',
                boxShadow: '6px 6px 0 black',
              }}
            >
              talk it out
            </span>
          </h1>

          {/* Unhinged potato character */}
          <div className="flex justify-center my-8">
            <svg width="140" height="160" viewBox="0 0 70 80">
              {/* Potato body - wonky oval shape */}
              <path
                d="M35 75 C10 75 5 45 12 25 C18 8 52 8 58 25 C65 45 60 75 35 75"
                fill="#D4A574"
                stroke="black"
                strokeWidth="3"
              />
              {/* Potato spots */}
              <ellipse cx="20" cy="40" rx="4" ry="3" fill="#C4956A"/>
              <ellipse cx="50" cy="55" rx="3" ry="4" fill="#C4956A"/>
              <ellipse cx="45" cy="35" rx="2" ry="2" fill="#C4956A"/>
              {/* Eyes - slightly uneven for unhinged look */}
              <circle cx="25" cy="35" r="8" fill="white" stroke="black" strokeWidth="2"/>
              <circle cx="45" cy="33" r="9" fill="white" stroke="black" strokeWidth="2"/>
              {/* Pupils - looking slightly different directions */}
              <circle cx="27" cy="36" r="4" fill="black"/>
              <circle cx="48" cy="32" r="5" fill="black"/>
              <circle cx="28" cy="34" r="1.5" fill="white"/>
              <circle cx="49" cy="30" r="2" fill="white"/>
              {/* Wonky smile */}
              <path d="M22 50 Q35 60 48 48" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round"/>
              {/* Little arms */}
              <path d="M8 45 Q0 40 5 32" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M62 43 Q70 38 65 30" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round"/>
              {/* Speech bubble */}
              <g transform="translate(45, -5)">
                <ellipse cx="15" cy="12" rx="20" ry="12" fill="white" stroke="black" strokeWidth="2"/>
                <polygon points="5,20 10,24 12,18" fill="white" stroke="black" strokeWidth="2"/>
                <text x="15" y="15" textAnchor="middle" fontSize="7" fontWeight="600">hi!</text>
              </g>
            </svg>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-700 mb-3 max-w-lg mx-auto">
            talk to an unhinged potato about whatever&apos;s on your mind
          </p>
          <p className="text-base text-gray-500 mb-10 max-w-md mx-auto">
            an AI that asks questions to help you think, not one that thinks for you
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
              why a potato? →
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
              <div className="text-5xl mb-4">🥔</div>
              <h3 className="text-xl font-bold mb-2">zero judgment</h3>
              <p className="text-sm">
                it&apos;s a potato. it&apos;s not going to judge you. say whatever you need to say.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="relative z-10 px-4 py-16" style={{ backgroundColor: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-10">
            what people talk about
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🪞', title: 'identity stuff', desc: 'figuring out who you are' },
              { emoji: '💭', title: 'feelings', desc: 'processing what\'s going on' },
              { emoji: '✨', title: 'ideas', desc: 'brainstorming and creating' },
              { emoji: '🎯', title: 'decisions', desc: 'thinking through choices' },
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
            {/* Excited potato */}
            <div className="flex justify-center mb-6">
              <svg width="80" height="90" viewBox="0 0 60 70">
                {/* Potato body */}
                <path
                  d="M30 65 C10 65 5 40 10 22 C15 8 45 8 50 22 C55 40 50 65 30 65"
                  fill="#D4A574"
                  stroke="black"
                  strokeWidth="3"
                />
                {/* Eyes - excited */}
                <circle cx="20" cy="30" r="7" fill="white" stroke="black" strokeWidth="2"/>
                <circle cx="40" cy="28" r="8" fill="white" stroke="black" strokeWidth="2"/>
                <circle cx="22" cy="30" r="4" fill="black"/>
                <circle cx="43" cy="27" r="5" fill="black"/>
                <circle cx="23" cy="28" r="1.5" fill="white"/>
                <circle cx="44" cy="25" r="2" fill="white"/>
                {/* Big excited smile */}
                <ellipse cx="30" cy="45" rx="10" ry="7" fill="black"/>
                <ellipse cx="30" cy="43" rx="6" ry="3" fill="#FF6B6B"/>
                {/* Arms up */}
                <path d="M5 35 Q-5 25 0 15" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M55 33 Q65 23 60 13" stroke="black" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              stop feeling like a background character
            </h2>
            <p className="text-lg mb-8">
              free to use. the potato is waiting.
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
              talk to the potato
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
              <span className="text-3xl">🥔</span>
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
              not a therapist. not a replacement for friends. just a potato that listens.
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
            be the main character of your own story
          </p>
        </div>
      </footer>
    </main>
  )
}
