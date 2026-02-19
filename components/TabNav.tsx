'use client'

import { useTheme } from '@/lib/ThemeContext'

export type TabId = 'chat' | 'growth'
export type GrowthSubTab = 'insights' | 'progress' | 'challenges' | 'epistemic' | 'peers' | 'literacy' | 'anti-engagement' | 'co-design' | 'parent'

interface TabNavProps {
  activeTab: TabId
  activeGrowthTab?: GrowthSubTab
  onGrowthTabChange?: (tab: GrowthSubTab) => void
}

const GROWTH_SUBTABS = [
  { id: 'insights' as GrowthSubTab, label: 'insights', emoji: '💡' },
  { id: 'progress' as GrowthSubTab, label: 'progress', emoji: '📈' },
  { id: 'challenges' as GrowthSubTab, label: 'challenges', emoji: '🎯' },
  { id: 'epistemic' as GrowthSubTab, label: 'thinking', emoji: '🧠' },
  { id: 'peers' as GrowthSubTab, label: 'peers', emoji: '👥' },
  { id: 'literacy' as GrowthSubTab, label: 'AI info', emoji: '🤖' },
  { id: 'anti-engagement' as GrowthSubTab, label: 'independence', emoji: '🦋' },
  { id: 'co-design' as GrowthSubTab, label: 'co-design', emoji: '🎨' },
  { id: 'parent' as GrowthSubTab, label: 'parent', emoji: '👨‍👩‍👧' },
]

export default function TabNav({
  activeTab,
  activeGrowthTab = 'insights',
  onGrowthTabChange
}: TabNavProps) {
  const { theme } = useTheme()
  const TAB_COLORS = theme.colors.primary

  // Only show subtabs when on growth tab
  if (activeTab !== 'growth') {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <nav
        className="flex flex-wrap items-center justify-center gap-2 p-2 max-w-full"
        style={{
          backgroundColor: theme.colors.backgroundAlt,
          border: '3px solid black',
          borderRadius: '16px',
          boxShadow: '4px 4px 0 black',
        }}
      >
        {GROWTH_SUBTABS.map((tab, i) => {
          const isActive = activeGrowthTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onGrowthTabChange?.(tab.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all duration-200 whitespace-nowrap hover:scale-105"
              style={{
                backgroundColor: isActive ? TAB_COLORS[i % TAB_COLORS.length] : 'transparent',
                borderRadius: '9999px',
                border: isActive ? '2px solid black' : 'none',
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
