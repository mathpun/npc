'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'

// Simple blob characters for each friend
const friends = [
  { id: 1, name: 'alex', color: '#FF69B4', mood: 'vibing', thought: 'what even is college', x: 15, y: 30 },
  { id: 2, name: 'jordan', color: '#FFD700', mood: 'confused', thought: 'why am i like this', x: 60, y: 20 },
  { id: 3, name: 'sam', color: '#90EE90', mood: 'excited', thought: 'DOGS', x: 35, y: 55 },
  { id: 4, name: 'riley', color: '#87CEEB', mood: 'sleepy', thought: 'need coffee', x: 75, y: 60 },
  { id: 5, name: 'you', color: '#DDA0DD', mood: 'curious', thought: 'this is cool', x: 45, y: 40 },
]

const zones = [
  { id: 1, name: 'the feelings corner', color: '#87CEEB', emoji: '😭', desc: 'for when things are A Lot' },
  { id: 2, name: 'chaos zone', color: '#FFB6C1', emoji: '🔥', desc: 'no thoughts just vibes' },
  { id: 3, name: 'the thinking tree', color: '#98FB98', emoji: '🌳', desc: 'figure stuff out here' },
  { id: 4, name: 'dream cloud', color: '#DDA0DD', emoji: '☁️', desc: 'big dreams live here' },
]

const groupThoughts = [
  { user: 'jordan', text: 'does anyone else feel like theyre just pretending to know things', color: '#FFD700' },
  { user: 'alex', text: 'YES constantly', color: '#FF69B4' },
  { user: 'sam', text: 'wait we\'re supposed to know things??', color: '#90EE90' },
  { user: 'NPC', text: 'sounds like you\'re all experiencing imposter feelings - thats actually super common. what makes it feel like pretending?', color: '#E0E0E0', isAI: true },
]

export default function Moltbook() {
  const router = useRouter()
  const [selectedFriend, setSelectedFriend] = useState<typeof friends[0] | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [vibesSent, setVibesSent] = useState(false)
  const [showVibesAnimation, setShowVibesAnimation] = useState(false)

  const handleSendVibes = () => {
    setShowVibesAnimation(true)
    setTimeout(() => {
      setVibesSent(true)
      setTimeout(() => {
        setShowVibesAnimation(false)
      }, 1000)
    }, 1500)
  }

  const handleStartChat = (friend: typeof friends[0]) => {
    // Store the friend context for the chat
    localStorage.setItem('chat_context', JSON.stringify({
      friendName: friend.name,
      friendThought: friend.thought,
      friendMood: friend.mood,
    }))
    router.push(`/chat?topic=${encodeURIComponent(`My friend ${friend.name} is thinking about: "${friend.thought}". They seem ${friend.mood}. Can we talk about this?`)}`)
  }

  return (
    <div className="min-h-screen font-hand text-black" style={{ backgroundColor: '#7FDBFF' }}>
      {/* Nav */}
      <NavBar />

      {/* Page title bar */}
      <div className="relative z-10 p-3 text-center" style={{ backgroundColor: '#7FDBFF' }}>
        <div className="inline-block px-4 py-2 bg-white border-3 border-black rounded-full rotate-2" style={{ borderWidth: '3px' }}>
          the moltbook
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4">
        {/* Title - hand drawn style */}
        <div className="text-center mb-8 mt-4">
          <h1
            className="text-4xl md:text-6xl font-bold mb-2 inline-block px-6 py-2 -rotate-1"
            style={{
              backgroundColor: '#FFD700',
              border: '4px solid black',
              borderRadius: '8px',
              boxShadow: '6px 6px 0 black'
            }}
          >
            our world
          </h1>
          <p className="text-xl mt-4" style={{  }}>
            (its a mess but its OUR mess)
          </p>
        </div>

        {/* The World Map - hand drawn style */}
        <div
          className="relative rounded-3xl mb-8 overflow-hidden"
          style={{
            backgroundColor: '#98FB98',
            border: '5px solid black',
            height: '400px',
            boxShadow: '8px 8px 0 black'
          }}
        >
          {/* Doodle decorations */}
          <div className="absolute top-4 right-4 text-4xl animate-bounce">☀️</div>
          <div className="absolute top-20 left-8 text-2xl rotate-12">🌸</div>
          <div className="absolute bottom-8 right-12 text-3xl">🌻</div>
          <div className="absolute bottom-20 left-4 text-2xl -rotate-12">✨</div>

          {/* Rainbow */}
          <div
            className="absolute top-0 left-1/4 w-64 h-32 opacity-80"
            style={{
              background: 'linear-gradient(180deg, transparent 50%, #FF0000 50%, #FF0000 57%, #FF7F00 57%, #FF7F00 64%, #FFFF00 64%, #FFFF00 71%, #00FF00 71%, #00FF00 78%, #0000FF 78%, #0000FF 85%, #4B0082 85%, #4B0082 92%, #9400D3 92%)',
              borderRadius: '100px 100px 0 0',
            }}
          />

          {/* Friend blobs on the map */}
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="absolute cursor-pointer transform hover:scale-110 transition-transform"
              style={{ left: `${friend.x}%`, top: `${friend.y}%` }}
              onClick={() => setSelectedFriend(friend)}
            >
              {/* The blob character */}
              <div className="relative">
                {/* Thought bubble */}
                <div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-1 bg-white rounded-xl text-xs whitespace-nowrap"
                  style={{
                    border: '2px solid black',
                    maxWidth: '120px'
                  }}
                >
                  {friend.thought}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-black rotate-45" />
                </div>

                {/* Blob body */}
                <svg width="60" height="70" viewBox="0 0 60 70">
                  {/* Body */}
                  <ellipse cx="30" cy="45" rx="20" ry="25" fill={friend.color} stroke="black" strokeWidth="3"/>
                  {/* Head */}
                  <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
                  {/* Eyes */}
                  <circle cx="24" cy="18" r="4" fill="black"/>
                  <circle cx="36" cy="18" r="4" fill="black"/>
                  {/* Eye shine */}
                  <circle cx="25" cy="17" r="1.5" fill="white"/>
                  <circle cx="37" cy="17" r="1.5" fill="white"/>
                  {/* Party hat for one */}
                  {friend.name === 'you' && (
                    <polygon points="30,2 24,15 36,15" fill="#FFD700" stroke="black" strokeWidth="2"/>
                  )}
                </svg>

                {/* Name label */}
                <div
                  className="text-center text-sm font-bold"
                  style={{  }}
                >
                  {friend.name}
                </div>
              </div>
            </div>
          ))}

          {/* Zone labels on map */}
          <div className="absolute bottom-4 left-4 text-sm px-2 py-1 bg-white/80 rounded border-2 border-black rotate-3" style={{  }}>
            🌳 thinking tree →
          </div>
          <div className="absolute top-4 left-4 text-sm px-2 py-1 bg-white/80 rounded border-2 border-black -rotate-2" style={{  }}>
            ← chaos zone 🔥
          </div>
        </div>

        {/* Zones Grid - sticky note style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {zones.map((zone, i) => (
            <div
              key={zone.id}
              className="p-4 cursor-pointer hover:scale-105 transition-transform"
              style={{
                backgroundColor: zone.color,
                border: '3px solid black',
                borderRadius: '4px',
                boxShadow: '4px 4px 0 black',
                transform: `rotate(${(i % 2 === 0 ? -2 : 2)}deg)`,
                
              }}
            >
              <div className="text-3xl mb-2">{zone.emoji}</div>
              <h3 className="font-bold text-sm mb-1">{zone.name}</h3>
              <p className="text-xs opacity-80">{zone.desc}</p>
            </div>
          ))}
        </div>

        {/* Group chat - notebook paper style */}
        <div
          className="mb-8 p-6 relative"
          style={{
            backgroundColor: 'white',
            border: '3px solid black',
            boxShadow: '6px 6px 0 black',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #E0E0E0 28px)',
            
          }}
        >
          {/* Red margin line */}
          <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-red-400" />

          <h2 className="text-xl font-bold mb-4 ml-8">💬 group thoughts rn:</h2>

          <div className="space-y-4 ml-8">
            {groupThoughts.map((thought, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: thought.color,
                    border: '2px solid black'
                  }}
                >
                  {thought.isAI ? '🤖' : thought.user[0]}
                </div>
                <div>
                  <span className="font-bold">{thought.user}:</span>{' '}
                  <span className={thought.isAI ? 'text-gray-600' : ''}>{thought.text}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 ml-8 flex gap-2">
            <input
              type="text"
              placeholder="add a thought..."
              className="flex-1 px-4 py-2 border-2 border-black rounded-full"
              style={{  }}
            />
            <button
              className="px-6 py-2 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#FF69B4',
                border: '3px solid black',
                borderRadius: '9999px',
                boxShadow: '3px 3px 0 black'
              }}
            >
              send
            </button>
          </div>
        </div>

        {/* Priorities list - hand drawn */}
        <div
          className="mb-8 p-6"
          style={{
            backgroundColor: '#87CEEB',
            border: '3px solid black',
            boxShadow: '6px 6px 0 black',
            transform: 'rotate(1deg)'
          }}
        >
          <h2 className="text-xl font-bold mb-4 underline">group priorities:</h2>
          <ul className="space-y-2 text-lg">
            <li>• figure out life (ongoing)</li>
            <li>• support each other</li>
            <li>• no judgment zone</li>
            <li>• celebrate small wins</li>
            <li>• memes are encouraged</li>
          </ul>

          {/* Little blob doodle */}
          <div className="absolute -right-4 -bottom-4">
            <svg width="80" height="90" viewBox="0 0 60 70">
              <ellipse cx="30" cy="45" rx="20" ry="25" fill="#DDA0DD" stroke="black" strokeWidth="3"/>
              <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
              <circle cx="24" cy="18" r="4" fill="black"/>
              <circle cx="36" cy="18" r="4" fill="black"/>
              <circle cx="25" cy="17" r="1.5" fill="white"/>
              <circle cx="37" cy="17" r="1.5" fill="white"/>
              <path d="M24 28 Q30 32 36 28" stroke="black" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        </div>

        {/* Add friend button */}
        <div className="text-center mb-8">
          <button
            className="px-8 py-4 text-xl font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#FFD700',
              border: '4px solid black',
              borderRadius: '9999px',
              boxShadow: '5px 5px 0 black',
              
            }}
          >
            + invite a friend to the world
          </button>
        </div>

        {/* Bottom quote */}
        <div className="text-center pb-20" style={{  }}>
          <p className="text-lg italic">"maybe everything isn't hopeless bullshit"</p>
          <p className="text-sm mt-2">- us, hopefully</p>
        </div>
      </main>

      {/* Friend detail modal */}
      {selectedFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedFriend(null); setVibesSent(false); setShowVibesAnimation(false); }}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative p-6 max-w-sm w-full"
            style={{
              backgroundColor: selectedFriend.color,
              border: '4px solid black',
              borderRadius: '12px',
              boxShadow: '8px 8px 0 black',
              
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Blob */}
            <div className="flex justify-center mb-4">
              <svg width="100" height="120" viewBox="0 0 60 70">
                <ellipse cx="30" cy="45" rx="20" ry="25" fill={selectedFriend.color} stroke="black" strokeWidth="3"/>
                <circle cx="30" cy="20" r="18" fill="white" stroke="black" strokeWidth="3"/>
                <circle cx="24" cy="18" r="4" fill="black"/>
                <circle cx="36" cy="18" r="4" fill="black"/>
                <circle cx="25" cy="17" r="1.5" fill="white"/>
                <circle cx="37" cy="17" r="1.5" fill="white"/>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">{selectedFriend.name}</h2>
            <p className="text-center mb-4">mood: {selectedFriend.mood}</p>

            <div className="p-3 bg-white rounded-lg border-2 border-black mb-4">
              <p className="text-sm">currently thinking about:</p>
              <p className="font-bold">"{selectedFriend.thought}"</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSendVibes}
                disabled={vibesSent}
                className="flex-1 py-2 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                style={{
                  backgroundColor: vibesSent ? '#90EE90' : 'white',
                  border: '3px solid black',
                  borderRadius: '8px'
                }}
              >
                {vibesSent ? 'vibes sent! 💖' : 'send vibes ✨'}
              </button>
              <button
                onClick={() => handleStartChat(selectedFriend)}
                className="flex-1 py-2 font-bold hover:scale-105 transition-transform"
                style={{
                  backgroundColor: '#90EE90',
                  border: '3px solid black',
                  borderRadius: '8px'
                }}
              >
                start chat 💬
              </button>
            </div>

            {/* Vibes animation overlay */}
            {showVibesAnimation && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl animate-ping"
                    style={{
                      left: `${Math.random() * 80 + 10}%`,
                      top: `${Math.random() * 80 + 10}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: '1s',
                    }}
                  >
                    {['✨', '💖', '💫', '🌟', '💕', '⭐'][Math.floor(Math.random() * 6)]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom nav - crayon style */}
      <nav
        className="fixed bottom-0 left-0 right-0 p-3"
        style={{
          backgroundColor: 'white',
          borderTop: '4px solid black',
          
        }}
      >
        <div className="max-w-md mx-auto flex justify-around">
          {[
            { emoji: '🗺️', label: 'world', active: true, href: '/moltbook' },
            { emoji: '💭', label: 'chat', active: false, href: '/chat' },
            { emoji: '🗺️', label: 'journey', active: false, href: '/dashboard' },
            { emoji: '📊', label: 'report', active: false, href: '/report' },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`flex flex-col items-center px-4 py-2 rounded-xl`}
              style={{
                backgroundColor: item.active ? '#FFD700' : 'transparent',
                border: item.active ? '2px solid black' : 'none',
              }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
