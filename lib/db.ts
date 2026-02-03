import Database from 'better-sqlite3'
import path from 'path'

// Initialize database
const dbPath = path.join(process.cwd(), 'npc.db')
const db = new Database(dbPath)

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    interests TEXT NOT NULL,
    goals TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Activity log (tracks everything users do)
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Chat sessions
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_goal TEXT,
    session_topic TEXT,
    message_count INTEGER DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Journal entries
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    entry_type TEXT NOT NULL,
    content TEXT NOT NULL,
    context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- User goals
  CREATE TABLE IF NOT EXISTS user_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Milestones (for the candyland journey)
  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    milestone_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    color TEXT,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Daily streaks tracking
  CREATE TABLE IF NOT EXISTS daily_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    activity_date DATE NOT NULL,
    chat_count INTEGER DEFAULT 0,
    journal_count INTEGER DEFAULT 0,
    UNIQUE(user_id, activity_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Achievements
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_key TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_key),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Parent prompts (goals/journal prompts set by parents for teens)
  CREATE TABLE IF NOT EXISTS parent_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    prompt_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '💭',
    is_global INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Track which prompts teens have seen/responded to
  CREATE TABLE IF NOT EXISTS prompt_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    response_type TEXT,
    response_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES parent_prompts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Museum items (the gift shop products)
  CREATE TABLE IF NOT EXISTS museum_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    emoji TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    origin_story TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Museum settings and sharing
  CREATE TABLE IF NOT EXISTS museums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    share_slug TEXT UNIQUE,
    museum_name TEXT,
    tagline TEXT,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Chat messages (stores full conversation history)
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)

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
