'use client'

import Link from 'next/link'
import NavBar from '@/components/NavBar'

export default function Home() {
  return (
    <main className="min-h-screen font-hand" style={{ backgroundColor: '#FFB6C1' }}>
      {/* Doodle decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl rotate-12 animate-bounce">⭐</div>
        <div className="absolute top-20 right-20 text-5xl -rotate-12">🌈</div>
        <div className="absolute bottom-40 left-20 text-4xl rotate-6">✨</div>
        <div className="absolute bottom-20 right-40 text-5xl -rotate-6 animate-bounce" style={{ animationDelay: '0.5s' }}>🌸</div>
        <div className="absolute top-1/3 right-10 text-4xl">☀️</div>
        <div className="absolute bottom-1/3 left-5 text-3xl rotate-12">🍪</div>
      </div>

      {/* Nav */}
      <NavBar />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-3xl mx-auto" style={{  }}>
          {/* Pill badge */}
          <div
            className="inline-block px-6 py-3 mb-8 rotate-2"
            style={{
              backgroundColor: '#87CEEB',
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            <span className="text-lg font-bold">ur ai bestie that actually gets it ✨</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            not like
            <br />
            <span
              className="inline-block px-4 py-2 mt-2 -rotate-2"
              style={{
                backgroundColor: '#FFD700',
                border: '4px solid black',
                boxShadow: '6px 6px 0 black',
              }}
            >
              other AIs
            </span>
          </h1>

          {/* Little blob character */}
          <div className="flex justify-center my-8">
            <svg width="120" height="140" viewBox="0 0 60 70">
              <ellipse cx="30" cy="45" rx="20" ry="25" fill="#DDA0DD" stroke="black" strokeWidth="3"/>
              <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
              <circle cx="24" cy="18" r="5" fill="black"/>
              <circle cx="36" cy="18" r="5" fill="black"/>
              <circle cx="25" cy="16" r="2" fill="white"/>
              <circle cx="37" cy="16" r="2" fill="white"/>
              <path d="M24 28 Q30 33 36 28" stroke="black" strokeWidth="2" fill="none"/>
              {/* Speech bubble */}
              <g transform="translate(-20, -30)">
                <ellipse cx="30" cy="10" rx="35" ry="15" fill="white" stroke="black" strokeWidth="2"/>
                <polygon points="40,22 35,25 45,30" fill="white" stroke="black" strokeWidth="2"/>
                <text x="30" y="14" textAnchor="middle" fontSize="8" fontWeight="600">hi im npc!</text>
              </g>
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
            an AI that helps you think, not one that thinks for you
          </p>
          <p className="text-lg text-gray-700 mb-10">
            no cap. just real conversations that help you figure stuff out.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-10 py-5 text-xl font-bold hover:scale-110 hover:rotate-2 transition-all"
              style={{
                backgroundColor: '#90EE90',
                border: '4px solid black',
                borderRadius: '20px',
                boxShadow: '6px 6px 0 black',
              }}
            >
              start chatting →
            </Link>
            <button
              className="px-8 py-4 text-lg font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '20px',
                boxShadow: '4px 4px 0 black',
              }}
            >
              see how it works
            </button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <div
              className="flex items-center gap-3 px-4 py-2 -rotate-1"
              style={{
                backgroundColor: 'white',
                border: '2px solid black',
                borderRadius: '12px',
              }}
            >
              <div className="flex -space-x-3">
                {['🧑‍🎤', '👩‍🎨', '🧑‍💻', '👨‍🚀'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: ['#FF69B4', '#FFD700', '#90EE90', '#87CEEB'][i],
                      border: '2px solid black',
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="font-bold">10k+ convos this week!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-4 py-16" style={{ backgroundColor: '#7FDBFF' }}>
        <div className="max-w-5xl mx-auto" style={{  }}>
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-5xl font-bold inline-block px-6 py-3 -rotate-1"
              style={{
                backgroundColor: '#FFD700',
                border: '4px solid black',
                boxShadow: '6px 6px 0 black',
              }}
            >
              built different fr fr
            </h2>
            <p className="text-lg mt-6">
              we actually talked to teens about what they want from AI. wild concept, right?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              className="p-6 hover:scale-105 transition-transform rotate-1"
              style={{
                backgroundColor: '#DDA0DD',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '5px 5px 0 black',
              }}
            >
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">thinks WITH you</h3>
              <p className="text-sm">
                asks questions instead of just giving answers. helps you figure out what YOU actually think.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="p-6 hover:scale-105 transition-transform -rotate-1"
              style={{
                backgroundColor: '#98FB98',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '5px 5px 0 black',
              }}
            >
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">keeps it real</h3>
              <p className="text-sm">
                doesn&apos;t pretend to know everything. says &quot;idk&quot; when it actually doesn&apos;t know.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="p-6 hover:scale-105 transition-transform rotate-2"
              style={{
                backgroundColor: '#87CEEB',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '5px 5px 0 black',
              }}
            >
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">no weird vibes</h3>
              <p className="text-sm">
                built safe from the start. reminds you to talk to real humans too. no parasocial bs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="relative z-10 px-4 py-16" style={{ backgroundColor: '#FFFACD' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 underline decoration-wavy decoration-black">
            what people use it for
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '🧠', title: 'hw help', desc: 'without just giving answers', color: '#FF69B4' },
              { emoji: '💭', title: 'vent sesh', desc: 'process feelings safely', color: '#87CEEB' },
              { emoji: '✨', title: 'creative stuff', desc: 'brainstorm & create', color: '#98FB98' },
              { emoji: '🎯', title: 'decisions', desc: 'think through choices', color: '#FFD700' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-5 text-center hover:scale-110 transition-transform cursor-pointer"
                style={{
                  backgroundColor: item.color,
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
      <div className="relative z-10 px-4 py-16" style={{ backgroundColor: '#98FB98' }}>
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
                <ellipse cx="30" cy="45" rx="20" ry="25" fill="#FFD700" stroke="black" strokeWidth="3"/>
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
              ready to chat?
            </h2>
            <p className="text-lg mb-8">
              free to try. no credit card. no selling ur data.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-10 py-5 text-xl font-bold hover:scale-110 hover:-rotate-2 transition-all"
              style={{
                backgroundColor: '#FF69B4',
                border: '4px solid black',
                borderRadius: '9999px',
                boxShadow: '5px 5px 0 black',
              }}
            >
              let&apos;s gooooo! 🚀
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="relative z-10 px-4 py-8 border-t-4 border-black border-dashed"
        style={{ backgroundColor: '#DDA0DD' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👻</span>
            <span className="text-xl font-bold">NPC</span>
            <span>|</span>
            <span className="text-sm">AI that gets it</span>
          </div>
          <p
            className="text-sm text-center px-4 py-2"
            style={{
              backgroundColor: 'white',
              border: '2px solid black',
              borderRadius: '8px',
            }}
          >
            not a therapist. not a replacement for real friends. just a thinking buddy.
          </p>
        </div>
      </footer>
    </main>
  )
}
