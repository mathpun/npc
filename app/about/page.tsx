'use client'

import Link from 'next/link'
import NavBar from '@/components/NavBar'
import { useTheme } from '@/lib/ThemeContext'

const PILLARS = [
  {
    emoji: '🔒',
    title: 'Teen Privacy First',
    description: "Your thoughts are yours. We never share your conversations with parents, schools, or anyone without your explicit consent.",
    color: '#DDA0DD',
  },
  {
    emoji: '🤖',
    title: 'AI Transparency',
    description: "You always know when you're talking to AI. No tricks, no hidden agendas. We explain why our AI responds the way it does.",
    color: '#87CEEB',
  },
  {
    emoji: '🧠',
    title: 'Your Growth, Your Pace',
    description: "We're not here to fix you or tell you what to do. We're here to help you figure things out on your own terms.",
    color: '#90EE90',
  },
  {
    emoji: '🎨',
    title: 'Co-Designed With Teens',
    description: "This app is built WITH teens, not just FOR teens. Your feedback shapes every feature we create.",
    color: '#FFD93D',
  },
  {
    emoji: '💚',
    title: 'Anti-Addictive Design',
    description: "No infinite scroll, no engagement tricks, no dark patterns. We want you to use npc when it helps, not because you can't stop.",
    color: '#98D8C8',
  },
  {
    emoji: '🌱',
    title: 'Real Development',
    description: "Grounded in developmental science. We focus on identity, autonomy, and the actual challenges of being a teen in 2026.",
    color: '#FFB6C1',
  },
]

const WHAT_MAKES_US_DIFFERENT = [
  "We don't sell your data. Ever.",
  "We don't notify your parents about your conversations.",
  "We don't try to keep you scrolling forever.",
  "We don't pretend AI is human.",
  "We don't tell you what to think or feel.",
  "We don't treat teens as problems to be solved.",
]

export default function AboutPage() {
  const { theme } = useTheme()

  return (
    <main className="min-h-screen text-black" style={{ backgroundColor: theme.colors.background }}>
      <NavBar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                border: '4px solid black',
                boxShadow: '4px 4px 0 black',
              }}
            >
              👻
            </div>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black inline-block px-6 py-3 mb-4"
            style={{
              background: 'linear-gradient(135deg, #FF69B4 0%, #FFD700 50%, #87CEEB 100%)',
              border: '4px solid black',
              borderRadius: '16px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            about npc
          </h1>
          <p className="text-lg mt-4 max-w-xl mx-auto">
            npc is an AI companion designed for teens, by teens.
            We&apos;re here to help you think through life&apos;s messy moments without judgment.
          </p>
        </div>

        {/* Our Pillars */}
        <section className="mb-10">
          <h2
            className="text-xl font-bold text-center mb-6 inline-block w-full"
          >
            <span
              className="inline-block px-4 py-2"
              style={{
                backgroundColor: '#E6E6FA',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              our pillars
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PILLARS.map((pillar, i) => (
              <div
                key={i}
                className="p-4"
                style={{
                  backgroundColor: pillar.color,
                  border: '3px solid black',
                  borderRadius: '16px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{pillar.emoji}</span>
                  <div>
                    <h3 className="font-bold text-base mb-1">{pillar.title}</h3>
                    <p className="text-sm opacity-80">{pillar.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-center mb-6">
            <span
              className="inline-block px-4 py-2"
              style={{
                backgroundColor: '#90EE90',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              what makes us different
            </span>
          </h2>

          <div
            className="p-5"
            style={{
              backgroundColor: 'white',
              border: '3px solid black',
              borderRadius: '16px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            <ul className="space-y-3">
              {WHAT_MAKES_US_DIFFERENT.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg">✓</span>
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Co-Design CTA */}
        <section className="text-center mb-10">
          <div
            className="p-6 inline-block"
            style={{
              background: 'linear-gradient(135deg, #FFB6C1 0%, #DDA0DD 100%)',
              border: '3px solid black',
              borderRadius: '20px',
              boxShadow: '4px 4px 0 black',
            }}
          >
            <h3 className="font-bold text-lg mb-2">want to help shape npc?</h3>
            <p className="text-sm mb-4 opacity-80">
              We&apos;re always looking for teen co-designers to help us build better.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://forms.gle/iWyp8pUumivZDMxr7"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 font-bold text-sm hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'white',
                  border: '3px solid black',
                  borderRadius: '9999px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                give feedback 💬
              </a>
              <Link
                href="/chat?tab=growth&subtab=co-design"
                className="px-5 py-2 font-bold text-sm hover:scale-105 transition-transform"
                style={{
                  backgroundColor: '#FFD700',
                  border: '3px solid black',
                  borderRadius: '9999px',
                  boxShadow: '3px 3px 0 black',
                }}
              >
                co-design portal 🎨
              </Link>
            </div>
          </div>
        </section>

        {/* Back home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 font-bold hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.colors.accent1,
              border: '3px solid black',
              borderRadius: '9999px',
              boxShadow: '3px 3px 0 black',
            }}
          >
            ← back home
          </Link>
        </div>
      </div>
    </main>
  )
}
