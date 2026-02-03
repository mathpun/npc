'use client'

import { useState } from 'react'

interface FeatureProposal {
  id: string
  title: string
  description: string
  votes: number
  status: 'voting' | 'planned' | 'building' | 'shipped'
  proposedBy: string
  userVoted: boolean
  emoji: string
  color: string
}

export default function CoDesignPortal() {
  const [proposals, setProposals] = useState<FeatureProposal[]>([
    {
      id: '1',
      title: 'Group reflection sessions',
      description: 'Let friends join a shared thinking session together',
      votes: 234,
      status: 'voting',
      proposedBy: 'Maya, 16',
      userVoted: false,
      emoji: '👥',
      color: '#FF69B4',
    },
    {
      id: '2',
      title: 'Voice conversation mode',
      description: 'Talk out loud instead of typing',
      votes: 189,
      status: 'planned',
      proposedBy: 'Jordan, 15',
      userVoted: true,
      emoji: '🎤',
      color: '#87CEEB',
    },
    {
      id: '3',
      title: 'Daily reflection prompts',
      description: 'Morning/evening prompts to build thinking habits',
      votes: 156,
      status: 'building',
      proposedBy: 'Alex, 17',
      userVoted: false,
      emoji: '📅',
      color: '#90EE90',
    },
    {
      id: '4',
      title: 'Mood tracking',
      description: 'Connect emotional patterns to thinking patterns',
      votes: 312,
      status: 'shipped',
      proposedBy: 'Sam, 14',
      userVoted: true,
      emoji: '😊',
      color: '#FFD700',
    },
  ])

  const [showIdeaForm, setShowIdeaForm] = useState(false)
  const [newIdea, setNewIdea] = useState('')

  const handleVote = (id: string) => {
    setProposals(proposals.map(p =>
      p.id === id
        ? { ...p, votes: p.userVoted ? p.votes - 1 : p.votes + 1, userVoted: !p.userVoted }
        : p
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'voting': return { label: '🗳️ Voting', color: '#87CEEB' }
      case 'planned': return { label: '📋 Planned', color: '#DDA0DD' }
      case 'building': return { label: '🔨 Building', color: '#FFD700' }
      case 'shipped': return { label: '🚀 Shipped!', color: '#90EE90' }
      default: return { label: status, color: '#f0f0f0' }
    }
  }

  const teenfeedback = [
    { quote: "I said the AI felt too formal, and they actually changed it!", impact: "Tone now feels more like a friend", teen: "Riley, 15" },
    { quote: "I wanted it to ask ME questions first", impact: "AI now asks clarifying questions before responding", teen: "Casey, 16" },
    { quote: "The parent dashboard felt like surveillance", impact: "Redesigned to show themes only", teen: "Taylor, 17" },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 text-black" style={{  }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-3 inline-block px-6 py-2 -rotate-1"
          style={{
            backgroundColor: '#DDA0DD',
            border: '4px solid black',
            borderRadius: '12px',
            boxShadow: '5px 5px 0 black',
          }}
        >
          🎨 Co-Design Portal 🎨
        </h1>
        <p className="text-lg mt-4">Teens actually shape how this AI works!</p>
      </div>

      {/* Impact Stats */}
      <div
        className="p-4 rotate-1"
        style={{
          backgroundColor: '#90EE90',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-lg font-bold mb-3 text-center">⭐ Your Voice Matters</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: '47', label: 'Teen ideas shipped', color: '#FF69B4' },
            { value: '1,234', label: 'Active advisors', color: '#87CEEB' },
            { value: '89%', label: 'Features by teens', color: '#FFD700' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-2 text-center"
              style={{
                backgroundColor: stat.color,
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Proposals */}
      <div
        className="p-5 -rotate-1"
        style={{
          backgroundColor: '#87CEEB',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">🗳️ Vote on Features</h2>
          <button
            onClick={() => setShowIdeaForm(!showIdeaForm)}
            className="px-3 py-1 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: '#FFD700',
              border: '2px solid black',
              borderRadius: '8px',
            }}
          >
            💡 Suggest
          </button>
        </div>

        {showIdeaForm && (
          <div
            className="mb-4 p-3"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '12px',
            }}
          >
            <textarea
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="What feature would make this better for teens?"
              className="w-full px-3 py-2 mb-2"
              rows={2}
              style={{ border: '2px solid black', borderRadius: '8px' }}
            />
            <button
              onClick={() => { setShowIdeaForm(false); setNewIdea('') }}
              className="w-full py-2 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: '#90EE90',
                border: '2px solid black',
                borderRadius: '8px',
              }}
            >
              Submit Idea! 🚀
            </button>
          </div>
        )}

        <div className="space-y-3">
          {proposals.map((proposal, index) => {
            const status = getStatusBadge(proposal.status)
            return (
              <div
                key={proposal.id}
                className="p-3"
                style={{
                  backgroundColor: proposal.color,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '2px 2px 0 black',
                  transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)`,
                }}
              >
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVote(proposal.id)}
                    disabled={proposal.status !== 'voting'}
                    className="flex flex-col items-center p-2 font-bold hover:scale-105 transition-transform disabled:opacity-50"
                    style={{
                      backgroundColor: proposal.userVoted ? '#FFD700' : 'white',
                      border: '2px solid black',
                      borderRadius: '8px',
                    }}
                  >
                    <span>⬆️</span>
                    <span className="text-sm">{proposal.votes}</span>
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{proposal.emoji}</span>
                      <h3 className="font-bold">{proposal.title}</h3>
                    </div>
                    <p className="text-sm">{proposal.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="px-2 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor: status.color,
                          border: '1px solid black',
                          borderRadius: '8px',
                        }}
                      >
                        {status.label}
                      </span>
                      <span className="text-xs">by {proposal.proposedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Teen Feedback That Shipped */}
      <div
        className="p-5 rotate-1"
        style={{
          backgroundColor: '#FFB6C1',
          border: '4px solid black',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <h2 className="text-xl font-bold mb-4">✅ Teen Feedback → Real Changes</h2>
        <div className="space-y-3">
          {teenfeedback.map((feedback, index) => (
            <div
              key={index}
              className="p-3"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              <p className="font-bold mb-1">"{feedback.quote}"</p>
              <p className="text-xs mb-2">— {feedback.teen}</p>
              <div
                className="p-2"
                style={{
                  backgroundColor: '#90EE90',
                  border: '2px solid black',
                  borderRadius: '8px',
                }}
              >
                <span className="text-sm">✅ Result: {feedback.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Advisory */}
      <div
        className="p-4 text-center"
        style={{
          backgroundColor: '#FFD700',
          border: '3px solid black',
          borderRadius: '12px',
          boxShadow: '4px 4px 0 black',
        }}
      >
        <p className="font-bold mb-2">🌟 Join the Teen Advisory Council!</p>
        <p className="text-sm">Help shape the future of youth-aligned AI</p>
      </div>
    </div>
  )
}
