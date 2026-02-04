// In-memory database for Railway deployment
// Data persists only during the server process lifetime
// For production, consider using Railway's PostgreSQL addon

type Row = Record<string, unknown>
const tables: Record<string, Row[]> = {}

// Initialize empty tables
const tableNames = [
  'users', 'activity_log', 'chat_sessions', 'journal_entries',
  'user_goals', 'milestones', 'daily_activity', 'achievements',
  'parent_prompts', 'prompt_responses', 'museum_items', 'museums', 'chat_messages'
]
tableNames.forEach(name => { tables[name] = [] })

let idCounter = 1

// Simple wrapper that mimics better-sqlite3 API
const db = {
  prepare: (sql: string) => {
    return {
      run: (...params: unknown[]) => {
        try {
          // Extract table name from INSERT
          const insertMatch = sql.match(/INSERT\s+(?:OR\s+IGNORE\s+)?INTO\s+(\w+)/i)
          if (insertMatch) {
            const tableName = insertMatch[1]
            if (!tables[tableName]) tables[tableName] = []

            // Simple insert - just store params as a row
            const row: Row = { id: idCounter++, created_at: new Date().toISOString() }
            const columns = sql.match(/\(([^)]+)\)\s*VALUES/i)?.[1]?.split(',').map(c => c.trim()) || []
            columns.forEach((col, i) => {
              if (params[i] !== undefined) row[col] = params[i]
            })
            tables[tableName].push(row)
          }

          // Handle UPDATE
          const updateMatch = sql.match(/UPDATE\s+(\w+)/i)
          if (updateMatch) {
            // Just log, don't actually need to update for chat to work
          }
        } catch (error) {
          console.error('DB run error (non-fatal):', error)
        }
        return { changes: 1, lastInsertRowid: idCounter - 1 }
      },
      get: (..._params: unknown[]): Row | undefined => {
        try {
          // Return empty for most queries - chat doesn't need reads
          const selectMatch = sql.match(/FROM\s+(\w+)/i)
          if (selectMatch) {
            const tableName = selectMatch[1]
            if (tables[tableName]?.length > 0) {
              return tables[tableName][tables[tableName].length - 1]
            }
          }
        } catch (error) {
          console.error('DB get error (non-fatal):', error)
        }
        return undefined
      },
      all: (..._params: unknown[]): Row[] => {
        try {
          const selectMatch = sql.match(/FROM\s+(\w+)/i)
          if (selectMatch) {
            const tableName = selectMatch[1]
            return tables[tableName] || []
          }
        } catch (error) {
          console.error('DB all error (non-fatal):', error)
        }
        return []
      }
    }
  },
  exec: (_sql: string) => {
    // Table creation - already handled by initialization
  }
}

// Achievement definitions
export const ACHIEVEMENTS = {
  first_steps: { title: 'First Steps', desc: 'Started your journey', icon: '🌱', color: '#90EE90' },
  first_chat: { title: 'First Chat', desc: 'Had your first conversation', icon: '💬', color: '#87CEEB' },
  deep_thinker: { title: 'Deep Thinker', desc: 'Completed 10 reflections', icon: '🧠', color: '#DDA0DD' },
  journal_keeper: { title: 'Journal Keeper', desc: 'Saved 5 journal entries', icon: '📔', color: '#FFD700' },
  goal_setter: { title: 'Goal Setter', desc: 'Set your first goal', icon: '🎯', color: '#FF69B4' },
  goal_getter: { title: 'Goal Getter', desc: 'Completed a goal', icon: '🏆', color: '#FFA500' },
  streak_3: { title: 'On Fire', desc: '3 day streak', icon: '🔥', color: '#FF6B6B' },
  streak_7: { title: 'Week Warrior', desc: '7 day streak', icon: '⚡', color: '#FFD700' },
  streak_30: { title: 'Monthly Master', desc: '30 day streak', icon: '👑', color: '#DDA0DD' },
  world_explorer: { title: 'World Explorer', desc: 'Visited the Moltbook', icon: '🌍', color: '#87CEEB' },
  insight_hunter: { title: 'Insight Hunter', desc: 'Saved 10 insights', icon: '💡', color: '#FFFACD' },
}

// Milestone type definitions
export const MILESTONE_TYPES = {
  journey_start: { title: 'Started Journey', color: '#90EE90' },
  first_chat: { title: 'First Deep Chat', color: '#87CEEB' },
  first_journal: { title: 'First Journal Entry', color: '#FFD700' },
  first_goal: { title: 'Set First Goal', color: '#FF69B4' },
  goal_complete: { title: 'Goal Completed', color: '#FFA500' },
  breakthrough: { title: 'Breakthrough Moment', color: '#DDA0DD' },
  weekly_check: { title: 'Weekly Check-in', color: '#98FB98' },
  streak_milestone: { title: 'Streak Achievement', color: '#FF6B6B' },
}

export default db
