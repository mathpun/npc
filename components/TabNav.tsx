'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

export type TabId = 'chat' | 'growth' | 'parent'
export type GrowthSubTab = 'insights' | 'progress' | 'challenges' | 'epistemic' | 'peers' | 'literacy' | 'anti-engagement' | 'co-design'

interface TabNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  activeGrowthTab?: GrowthSubTab
  onGrowthTabChange?: (tab: GrowthSubTab) => void
}

const MAIN_TABS = [
  { id: 'chat' as TabId, label: 'chat', emoji: '💬' },
  { id: 'growth' as TabId, label: 'growth', emoji: '🌱' },
  { id: 'parent' as TabId, label: 'parent', emoji: '👨‍👩‍👧' },
]

const GROWTH_SUBTABS = [
  { id: 'insights' as GrowthSubTab, label: 'insights', emoji: '💡' },
  { id: 'progress' as GrowthSubTab, label: 'progress', emoji: '📈' },
  { id: 'challenges' as GrowthSubTab, label: 'challenges', emoji: '🎯' },
  { id: 'epistemic' as GrowthSubTab, label: 'thinking', emoji: '🧠' },
  { id: 'peers' as GrowthSubTab, label: 'peers', emoji: '👥' },
  { id: 'literacy' as GrowthSubTab, label: 'AI info', emoji: '🤖' },
  { id: 'anti-engagement' as GrowthSubTab, label: 'independence', emoji: '🦋' },
  { id: 'co-design' as GrowthSubTab, label: 'co-design', emoji: '🎨' },
]

export default function TabNav({
  activeTab,
  onTabChange,
  activeGrowthTab = 'insights',
  onGrowthTabChange
}: TabNavProps) {
  const [showGrowthMenu, setShowGrowthMenu] = useState(false)
  const { theme } = useTheme()
  const TAB_COLORS = theme.colors.primary

  return (
    <div className="flex flex-col items-center gap-2" style={{  }}>
      {/* Main Tab Navigation */}
      <nav
        className="flex items-center gap-2 p-2"
        style={{
          backgroundColor: 'white',
          border: '3px solid black',
          borderRadius: '9999px',
          boxShadow: '4px 4px 0 black',
        }}
      >
        {MAIN_TABS.map((tab, i) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id)
                if (tab.id === 'growth') {
                  setShowGrowthMenu(!showGrowthMenu)
                } else {
                  setShowGrowthMenu(false)
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: isActive ? TAB_COLORS[i] : 'transparent',
                borderRadius: '9999px',
                border: isActive ? '2px solid black' : 'none',
              }}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === 'growth' && (
                <span className={`transition-transform ${showGrowthMenu ? 'rotate-180' : ''}`}>▼</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Growth Sub-Navigation */}
      {activeTab === 'growth' && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2 p-2 max-w-full"
          style={{
            backgroundColor: 'white',
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
      )}
    </div>
  )
}
