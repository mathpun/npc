import { Pool, QueryResult } from 'pg'

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Initialize database tables
async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        nickname TEXT,
        age INTEGER NOT NULL,
        interests TEXT NOT NULL,
        goals TEXT,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add password_hash column if it doesn't exist (for existing databases)
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'users' AND column_name = 'password_hash') THEN
          ALTER TABLE users ADD COLUMN password_hash TEXT;
        END IF;
      END $$;

      -- Add nickname column if it doesn't exist (for existing databases)
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'users' AND column_name = 'nickname') THEN
          ALTER TABLE users ADD COLUMN nickname TEXT;
        END IF;
      END $$;

      -- Add pronouns column if it doesn't exist (for existing databases)
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'users' AND column_name = 'pronouns') THEN
          ALTER TABLE users ADD COLUMN pronouns TEXT;
        END IF;
      END $$;

      -- Add email column if it doesn't exist (for teen email storage)
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'users' AND column_name = 'email') THEN
          ALTER TABLE users ADD COLUMN email TEXT;
        END IF;
      END $$;

      -- Add google_id column for Google OAuth authentication
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'users' AND column_name = 'google_id') THEN
          ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
        END IF;
      END $$;

      -- Add auth_provider column to track login method
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'users' AND column_name = 'auth_provider') THEN
          ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'password';
        END IF;
      END $$;

      -- Parent auth tokens (for magic link authentication)
      CREATE TABLE IF NOT EXISTS parent_auth_tokens (
        id SERIAL PRIMARY KEY,
        parent_email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Activity log
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        activity_type TEXT NOT NULL,
        activity_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Chat buckets (user-created folders/projects for organizing chats)
      CREATE TABLE IF NOT EXISTS chat_buckets (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        emoji TEXT DEFAULT '📁',
        color TEXT DEFAULT '#87CEEB',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      );

      -- Chat sessions
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT,
        category TEXT DEFAULT 'general',
        session_goal TEXT,
        session_topic TEXT,
        persona TEXT,
        bucket_id INTEGER REFERENCES chat_buckets(id) ON DELETE SET NULL,
        message_count INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP
      );

      -- Add new columns to chat_sessions if they don't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'chat_sessions' AND column_name = 'title') THEN
          ALTER TABLE chat_sessions ADD COLUMN title TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'chat_sessions' AND column_name = 'category') THEN
          ALTER TABLE chat_sessions ADD COLUMN category TEXT DEFAULT 'general';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'chat_sessions' AND column_name = 'persona') THEN
          ALTER TABLE chat_sessions ADD COLUMN persona TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'chat_sessions' AND column_name = 'bucket_id') THEN
          ALTER TABLE chat_sessions ADD COLUMN bucket_id INTEGER REFERENCES chat_buckets(id) ON DELETE SET NULL;
        END IF;
      END $$;

      -- Journal entries
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        entry_type TEXT NOT NULL,
        content TEXT NOT NULL,
        context TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- User goals
      CREATE TABLE IF NOT EXISTS user_goals (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );

      -- Milestones
      CREATE TABLE IF NOT EXISTS milestones (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        milestone_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        color TEXT,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Daily activity tracking
      CREATE TABLE IF NOT EXISTS daily_activity (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        activity_date DATE NOT NULL,
        chat_count INTEGER DEFAULT 0,
        journal_count INTEGER DEFAULT 0,
        UNIQUE(user_id, activity_date)
      );

      -- Achievements
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        achievement_key TEXT NOT NULL,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_key)
      );

      -- Parent prompts
      CREATE TABLE IF NOT EXISTS parent_prompts (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        prompt_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        emoji TEXT DEFAULT '💭',
        is_global INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );

      -- Prompt responses
      CREATE TABLE IF NOT EXISTS prompt_responses (
        id SERIAL PRIMARY KEY,
        prompt_id INTEGER NOT NULL REFERENCES parent_prompts(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        response_type TEXT,
        response_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Museum items
      CREATE TABLE IF NOT EXISTS museum_items (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        emoji TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        origin_story TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Museums
      CREATE TABLE IF NOT EXISTS museums (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
        share_slug TEXT UNIQUE,
        museum_name TEXT,
        tagline TEXT,
        is_public INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Chat messages
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        session_id INTEGER REFERENCES chat_sessions(id),
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add session_id to chat_messages if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'chat_messages' AND column_name = 'session_id') THEN
          ALTER TABLE chat_messages ADD COLUMN session_id INTEGER REFERENCES chat_sessions(id);
        END IF;
      END $$;

      -- Daily check-ins
      CREATE TABLE IF NOT EXISTS daily_checkins (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        checkin_date DATE NOT NULL,
        questions JSONB NOT NULL,
        responses JSONB NOT NULL,
        mood TEXT,
        ai_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, checkin_date)
      );

      -- User challenges (real-world challenges completed)
      CREATE TABLE IF NOT EXISTS user_challenges (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        challenge_id TEXT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        UNIQUE(user_id, challenge_id)
      );

      -- Parent connections (link teens to parent emails)
      CREATE TABLE IF NOT EXISTS parent_connections (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        parent_email TEXT NOT NULL,
        parent_name TEXT,
        connection_status TEXT DEFAULT 'pending',
        verification_code TEXT,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, parent_email)
      );

      -- Flagged messages (content safety alerts for admin)
      CREATE TABLE IF NOT EXISTS flagged_messages (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES chat_messages(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        flag_type TEXT NOT NULL,
        flag_reason TEXT NOT NULL,
        severity TEXT DEFAULT 'medium',
        reviewed INTEGER DEFAULT 0,
        reviewed_at TIMESTAMP,
        reviewed_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Parent reports (AI-generated reports for parents)
      CREATE TABLE IF NOT EXISTS parent_reports (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        parent_connection_id INTEGER REFERENCES parent_connections(id),
        report_type TEXT DEFAULT 'weekly',
        week_start DATE NOT NULL,
        week_end DATE NOT NULL,

        -- AI-generated content (teen can edit before approval)
        themes_discussed TEXT,
        mood_summary TEXT,
        growth_highlights TEXT,
        engagement_stats JSONB,
        teen_note TEXT,

        -- Approval workflow
        status TEXT DEFAULT 'draft',
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        teen_reviewed_at TIMESTAMP,
        approved_at TIMESTAMP,
        sent_at TIMESTAMP,

        -- What the teen modified
        teen_edits JSONB
      );

      -- Worlds table (for collaborative world building)
      CREATE TABLE IF NOT EXISTS worlds (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        world_name TEXT NOT NULL DEFAULT 'My World',
        world_emoji TEXT DEFAULT '🌍',
        world_vibe TEXT,
        world_description TEXT,
        color_theme TEXT DEFAULT '#FF69B4',
        share_slug TEXT UNIQUE,
        invite_code TEXT UNIQUE,
        is_public INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- World collaborators
      CREATE TABLE IF NOT EXISTS world_collaborators (
        id SERIAL PRIMARY KEY,
        world_id INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id),
        role TEXT DEFAULT 'collaborator',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(world_id, user_id)
      );

      -- World elements
      CREATE TABLE IF NOT EXISTS world_elements (
        id SERIAL PRIMARY KEY,
        world_id INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
        creator_id TEXT NOT NULL REFERENCES users(id),
        element_type TEXT NOT NULL,
        emoji TEXT,
        name TEXT NOT NULL,
        description TEXT,
        details JSONB,
        connections JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('Database tables initialized')
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    client.release()
  }
}

// Initialize on first import
let dbInitialized = false
async function ensureDbInitialized() {
  if (!dbInitialized && process.env.DATABASE_URL) {
    dbInitialized = true
    await initDb()
  }
}

// Wrapper that mimics better-sqlite3 API but uses PostgreSQL
const db = {
  prepare: (sql: string) => {
    // Convert SQLite syntax to PostgreSQL
    let pgSql = sql
      // Convert ? placeholders to $1, $2, etc.
      .replace(/\?/g, (() => {
        let i = 0
        return () => `$${++i}`
      })())
      // Convert DATETIME to TIMESTAMP
      .replace(/DATETIME/gi, 'TIMESTAMP')
      // Convert INTEGER PRIMARY KEY AUTOINCREMENT to SERIAL PRIMARY KEY
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
      // Convert date('now') to CURRENT_DATE
      .replace(/date\('now'\)/gi, 'CURRENT_DATE')
      // Convert date('now', '-X days') to CURRENT_DATE - INTERVAL 'X days'
      .replace(/date\('now',\s*'(-?\d+)\s*days?'\)/gi, "CURRENT_DATE + INTERVAL '$1 days'")
      // Convert INSERT OR IGNORE to INSERT ... ON CONFLICT DO NOTHING
      .replace(/INSERT OR IGNORE/gi, 'INSERT')

    return {
      run: async (...params: unknown[]) => {
        await ensureDbInitialized()
        try {
          // Handle INSERT OR IGNORE pattern
          let finalSql = pgSql
          if (sql.match(/INSERT OR IGNORE/i)) {
            // Add ON CONFLICT DO NOTHING for unique constraint violations
            if (finalSql.includes('achievements')) {
              finalSql = finalSql.replace(/VALUES\s*\([^)]+\)/i, '$& ON CONFLICT (user_id, achievement_key) DO NOTHING')
            } else {
              finalSql = finalSql + ' ON CONFLICT DO NOTHING'
            }
          }
          const result = await pool.query(finalSql, params)
          return { changes: result.rowCount, lastInsertRowid: 0 }
        } catch (error) {
          console.error('DB run error:', error, 'SQL:', pgSql)
          return { changes: 0, lastInsertRowid: 0 }
        }
      },
      get: async (...params: unknown[]) => {
        await ensureDbInitialized()
        try {
          const result: QueryResult = await pool.query(pgSql, params)
          return result.rows[0]
        } catch (error) {
          console.error('DB get error:', error, 'SQL:', pgSql)
          return undefined
        }
      },
      all: async (...params: unknown[]) => {
        await ensureDbInitialized()
        try {
          const result: QueryResult = await pool.query(pgSql, params)
          return result.rows
        } catch (error) {
          console.error('DB all error:', error, 'SQL:', pgSql)
          return []
        }
      }
    }
  },
  exec: async (sql: string) => {
    await ensureDbInitialized()
    try {
      await pool.query(sql)
    } catch (error) {
      console.error('DB exec error:', error)
    }
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
  first_checkin: { title: 'First Check-In', desc: 'Completed your first daily check-in', icon: '📝', color: '#98FB98' },
  checkin_streak_7: { title: 'Week of Reflection', desc: '7 day check-in streak', icon: '✨', color: '#FFB6C1' },
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
