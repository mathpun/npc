'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/ThemeContext'

interface Goal {
  id: number
  title: string
  progress: number
  status: 'active' | 'completed'
  created_at: string
  completed_at: string | null
}

interface GoalsProps {
  userId: string
  onGoalChange?: () => void
}

const GOAL_EMOJIS = ['🎯', '💪', '🚀', '⭐', '🌟', '💡', '🎨', '📚', '🎵', '💻']

export default function Goals({ userId, onGoalChange }: GoalsProps) {
  const { theme } = useTheme()
  const GOAL_COLORS = [theme.colors.accent5, theme.colors.accent1, theme.colors.accent4, theme.colors.accent2, theme.colors.accent3]
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [celebration, setCelebration] = useState<string | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [userId])

  const fetchGoals = async () => {
    try {
      const res = await fetch(`/api/goals?userId=${userId}`)
      const data = await res.json()
      if (data.goals) {
        setGoals(data.goals)
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err)
    }
    setLoading(false)
  }

  const addGoal = async () => {
    if (!newGoalTitle.trim() || adding) return

    setAdding(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title: newGoalTitle.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        setGoals([{ id: data.id, title: data.title, progress: 0, status: 'active', created_at: new Date().toISOString(), completed_at: null }, ...goals])
        setNewGoalTitle('')
        setShowAddForm(false)

        if (data.isFirstGoal) {
          setCelebration('🎯 Goal Setter achievement unlocked!')
          setTimeout(() => setCelebration(null), 3000)
        }

        onGoalChange?.()
      }
    } catch (err) {
      console.error('Failed to add goal:', err)
    }
    setAdding(false)
  }

  const updateProgress = async (goalId: number, newProgress: number) => {
    try {
      await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, progress: newProgress }),
      })

      setGoals(goals.map(g => g.id === goalId ? { ...g, progress: newProgress } : g))
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }

  const completeGoal = async (goalId: number) => {
    try {
      await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, status: 'completed', userId }),
      })

      setGoals(goals.map(g => g.id === goalId ? { ...g, status: 'completed', progress: 100 } : g))
      setCelebration('🏆 Goal completed! You earned the Goal Getter achievement!')
      setTimeout(() => setCelebration(null), 3000)
      onGoalChange?.()
    } catch (err) {
      console.error('Failed to complete goal:', err)
    }
  }

  const deleteGoal = async (goalId: number) => {
    try {
      await fetch(`/api/goals?goalId=${goalId}`, { method: 'DELETE' })
      setGoals(goals.filter(g => g.id !== goalId))
      onGoalChange?.()
    } catch (err) {
      console.error('Failed to delete goal:', err)
    }
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-2xl animate-bounce">🎯</div>
        <p>loading goals...</p>
      </div>
    )
  }

  return (
    <div className="text-black" style={{  }}>
      {/* Celebration toast */}
      {celebration && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 text-center font-bold animate-bounce"
          style={{
            backgroundColor: theme.colors.accent2,
            border: '3px solid black',
            borderRadius: '12px',
            boxShadow: '4px 4px 0 black',
          }}
        >
          {celebration}
        </div>
      )}

      {/* Active Goals */}
      <div className="space-y-3 mb-4">
        {activeGoals.length === 0 && !showAddForm ? (
          <div
            className="p-4 text-center"
            style={{
              backgroundColor: 'white',
              border: '3px dashed black',
              borderRadius: '12px',
            }}
          >
            <p className="text-gray-600 mb-2">no goals yet!</p>
            <p className="text-sm">add one to start tracking 🎯</p>
          </div>
        ) : (
          activeGoals.map((goal, i) => (
            <div
              key={goal.id}
              className="p-3"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '12px',
                boxShadow: '3px 3px 0 black',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{GOAL_EMOJIS[i % GOAL_EMOJIS.length]}</span>
                  <span className="font-bold">{goal.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => completeGoal(goal.id)}
                    className="px-2 py-1 text-xs font-bold hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: theme.colors.buttonSuccess,
                      border: '2px solid black',
                      borderRadius: '6px',
                    }}
                    title="Mark complete"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="px-2 py-1 text-xs font-bold hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: theme.colors.buttonDanger,
                      border: '2px solid black',
                      borderRadius: '6px',
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-4 rounded-full overflow-hidden"
                  style={{ backgroundColor: '#f0f0f0', border: '2px solid black' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${goal.progress}%`,
                      backgroundColor: GOAL_COLORS[i % GOAL_COLORS.length],
                    }}
                  />
                </div>
                <span className="text-sm font-bold w-10">{goal.progress}%</span>
              </div>

              {/* Progress buttons */}
              <div className="flex gap-1 mt-2">
                {[0, 25, 50, 75, 100].map(p => (
                  <button
                    key={p}
                    onClick={() => updateProgress(goal.id, p)}
                    className={`flex-1 py-1 text-xs font-bold transition-all ${goal.progress >= p ? 'scale-105' : ''}`}
                    style={{
                      backgroundColor: goal.progress >= p ? GOAL_COLORS[i % GOAL_COLORS.length] : '#f0f0f0',
                      border: '2px solid black',
                      borderRadius: '4px',
                    }}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Goal Form */}
      {showAddForm ? (
        <div
          className="p-3"
          style={{
            backgroundColor: '#FFFACD',
            border: '3px solid black',
            borderRadius: '12px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          <input
            type="text"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            placeholder="what do you want to achieve?"
            className="w-full px-3 py-2 mb-2"
            style={{
              border: '2px solid black',
              borderRadius: '8px',
              backgroundColor: 'white',
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={addGoal}
              disabled={adding || !newGoalTitle.trim()}
              className="flex-1 py-2 font-bold hover:scale-105 transition-transform disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.buttonSuccess,
                border: '3px solid black',
                borderRadius: '8px',
                boxShadow: '2px 2px 0 black',
              }}
            >
              {adding ? 'adding...' : 'add goal! 🎯'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewGoalTitle(''); }}
              className="px-4 py-2 font-bold hover:scale-105 transition-transform"
              style={{
                backgroundColor: 'white',
                border: '3px solid black',
                borderRadius: '8px',
              }}
            >
              cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 font-bold hover:scale-105 transition-transform"
          style={{
            backgroundColor: 'white',
            border: '3px solid black',
            borderRadius: '9999px',
            boxShadow: '3px 3px 0 black',
          }}
        >
          + Add New Goal
        </button>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-bold mb-2 text-gray-600">completed ({completedGoals.length})</p>
          <div className="space-y-2">
            {completedGoals.slice(0, 3).map((goal, i) => (
              <div
                key={goal.id}
                className="p-2 flex items-center gap-2 opacity-70"
                style={{
                  backgroundColor: theme.colors.buttonSuccess,
                  border: '2px solid black',
                  borderRadius: '8px',
                }}
              >
                <span>✅</span>
                <span className="font-bold line-through">{goal.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
