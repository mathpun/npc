'use client'

import { useTheme } from '@/lib/ThemeContext'

export default function Moltbook() {
  const { theme } = useTheme()

  return (
    <div className="max-w-sm mx-auto px-3 py-4">
      {/* Main Card - Screenshot friendly */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '4px solid black',
          boxShadow: '6px 6px 0 black',
          background: `linear-gradient(180deg, #E8D5FF 0%, #FFE4EC 50%, #D5F5E3 100%)`,
        }}
      >
        {/* Header */}
        <div className="text-center py-4 px-4">
          <div className="text-5xl mb-2">🦋</div>
          <h1 className="text-2xl font-bold">moltbook</h1>
          <p className="text-xs opacity-70 mt-1">your digital scrapbook of growth</p>
        </div>

        {/* Coming Soon Banner */}
        <div className="px-3 pb-3">
          <div
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              border: '3px solid black',
              boxShadow: '4px 4px 0 black',
            }}
          >
            <div className="text-3xl mb-2">✨</div>
            <h2 className="text-lg font-bold mb-2">coming soon!</h2>
            <p className="text-xs opacity-80 leading-relaxed">
              like a butterfly's molt, this is where you'll collect the versions of yourself as you grow
            </p>
          </div>
        </div>

        {/* Preview Features */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          {[
            { emoji: '📸', title: 'memory captures', desc: 'save meaningful moments' },
            { emoji: '🎨', title: 'mood boards', desc: 'visualize your vibes' },
            { emoji: '📝', title: 'growth notes', desc: 'track your evolution' },
            { emoji: '🏆', title: 'milestones', desc: 'celebrate your wins' },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-2.5 rounded-xl text-center opacity-60"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                border: '2px dashed black',
              }}
            >
              <div className="text-xl mb-1">{feature.emoji}</div>
              <div className="text-xs font-bold">{feature.title}</div>
              <div className="text-[9px] opacity-70">{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-3 pb-3">
          <div
            className="p-3 rounded-xl text-center"
            style={{
              backgroundColor: theme.colors.accent3,
              border: '2px solid black',
            }}
          >
            <p className="text-xs font-bold">want it faster? let us know!</p>
            <p className="text-[10px] opacity-70 mt-0.5">your feedback shapes what we build next</p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center py-2 px-3 text-[10px] font-bold"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
        >
          shed your old self, keep the memories · npc.chat
        </div>
      </div>
    </div>
  )
}
