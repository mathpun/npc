'use client'

import { useTheme } from '@/lib/ThemeContext'

export type TabId = 'chat' | 'growth'
// Keep original types for backwards compatibility, but simplify display
export type GrowthSubTab = 'insights' | 'progress' | 'challenges' | 'epistemic' | 'peers' | 'literacy' | 'anti-engagement' | 'co-design' | 'parent'
// Simplified grouped tabs
export type GrowthGroup = 'insights' | 'progress' | 'learn' | 'connect'

interface TabNavProps {
  activeTab: TabId
  activeGrowthTab?: GrowthSubTab
  onTabChange?: (tab: TabId) => void
  onGrowthTabChange?: (tab: GrowthSubTab) => void
}

const MAIN_TABS = [
  { id: 'chat' as TabId, label: 'chat', emoji: '💬' },
  { id: 'growth' as TabId, label: 'mnd wrapped', emoji: '🎁' },
]

// Simplified to 4 tabs - grouped from 9
const GROWTH_GROUPS = [
  { id: 'insights' as GrowthGroup, label: 'insights', emoji: '💡', subTab: 'insights' as GrowthSubTab },
  { id: 'progress' as GrowthGroup, label: 'goals', emoji: '🎯', subTab: 'challenges' as GrowthSubTab },
  { id: 'learn' as GrowthGroup, label: 'learn', emoji: '🧠', subTab: 'epistemic' as GrowthSubTab },
  { id: 'connect' as GrowthGroup, label: 'connect', emoji: '👥', subTab: 'peers' as GrowthSubTab },
]

// Map groups to their subtabs for active state
const GROUP_SUBTABS: Record<GrowthGroup, GrowthSubTab[]> = {
  'insights': ['insights'],
  'progress': ['progress', 'challenges'],
  'learn': ['epistemic', 'literacy', 'anti-engagement'],
  'connect': ['peers', 'co-design', 'parent'],
}

export default function TabNav({
  activeTab,
  activeGrowthTab = 'insights',
  onTabChange,
  onGrowthTabChange
}: TabNavProps) {
  const { theme } = useTheme()
  const TAB_COLORS = theme.colors.primary

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main Tab Toggle - Chat / Growth */}
      <div
        className="flex items-center gap-1 p-1"
        style={{
          backgroundColor: theme.colors.backgroundAlt,
          border: '3px solid black',
          borderRadius: '9999px',
          boxShadow: '4px 4px 0 black',
        }}
      >
        {MAIN_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: isActive ? (tab.id === 'chat' ? theme.colors.accent1 : theme.colors.accent3) : 'transparent',
                borderRadius: '9999px',
                border: isActive ? '2px solid black' : '2px solid transparent',
                color: theme.colors.text,
              }}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="text-sm sm:text-base">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Growth Subtabs - simplified to 4 groups */}
      {activeTab === 'growth' && (
        <nav
          className="flex items-center justify-center gap-2 p-2"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            border: '3px solid black',
            borderRadius: '16px',
            boxShadow: '4px 4px 0 black',
          }}
        >
          {GROWTH_GROUPS.map((group, i) => {
            // Check if current subtab belongs to this group
            const isActive = GROUP_SUBTABS[group.id].includes(activeGrowthTab)

            return (
              <button
                key={group.id}
                onClick={() => onGrowthTabChange?.(group.subTab)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-all duration-200 whitespace-nowrap hover:scale-105"
                style={{
                  backgroundColor: isActive ? TAB_COLORS[i % TAB_COLORS.length] : 'transparent',
                  borderRadius: '9999px',
                  border: isActive ? '2px solid black' : 'none',
                }}
              >
                <span className="text-lg">{group.emoji}</span>
                <span>{group.label}</span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
