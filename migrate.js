const { Pool } = require('pg');
const Database = require('better-sqlite3');

const pgPool = new Pool({
  connectionString: 'postgresql://postgres:vVzwArBIOAkhxCeCojrqAzNWvbiYzfIF@switchyard.proxy.rlwy.net:48779/railway',
  ssl: { rejectUnauthorized: false }
});

const sqlite = new Database('./npc.db');

async function migrate() {
  const client = await pgPool.connect();

  try {
    console.log('Starting migration...');

    // Migrate users
    const users = sqlite.prepare('SELECT * FROM users').all();
    console.log(`Migrating ${users.length} users...`);
    for (const user of users) {
      await client.query(`
        INSERT INTO users (id, name, age, interests, goals, created_at, last_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.name, user.age, user.interests, user.goals, user.created_at, user.last_active]);
    }
    console.log('Users migrated!');

    // Migrate activity_log
    const activities = sqlite.prepare('SELECT * FROM activity_log').all();
    console.log(`Migrating ${activities.length} activity logs...`);
    for (const act of activities) {
      await client.query(`
        INSERT INTO activity_log (user_id, activity_type, activity_data, created_at)
        VALUES ($1, $2, $3, $4)
      `, [act.user_id, act.activity_type, act.activity_data, act.created_at]);
    }
    console.log('Activity logs migrated!');

    // Migrate achievements
    const achievements = sqlite.prepare('SELECT * FROM achievements').all();
    console.log(`Migrating ${achievements.length} achievements...`);
    for (const ach of achievements) {
      await client.query(`
        INSERT INTO achievements (user_id, achievement_key, unlocked_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, achievement_key) DO NOTHING
      `, [ach.user_id, ach.achievement_key, ach.unlocked_at]);
    }
    console.log('Achievements migrated!');

    // Migrate milestones
    const milestones = sqlite.prepare('SELECT * FROM milestones').all();
    console.log(`Migrating ${milestones.length} milestones...`);
    for (const ms of milestones) {
      await client.query(`
        INSERT INTO milestones (user_id, milestone_type, title, description, color, unlocked_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [ms.user_id, ms.milestone_type, ms.title, ms.description, ms.color, ms.unlocked_at]);
    }
    console.log('Milestones migrated!');

    // Migrate chat_messages
    const messages = sqlite.prepare('SELECT * FROM chat_messages').all();
    console.log(`Migrating ${messages.length} chat messages...`);
    for (const msg of messages) {
      await client.query(`
        INSERT INTO chat_messages (user_id, role, content, created_at)
        VALUES ($1, $2, $3, $4)
      `, [msg.user_id, msg.role, msg.content, msg.created_at]);
    }
    console.log('Chat messages migrated!');

    // Migrate museum_items
    const items = sqlite.prepare('SELECT * FROM museum_items').all();
    console.log(`Migrating ${items.length} museum items...`);
    for (const item of items) {
      await client.query(`
        INSERT INTO museum_items (user_id, emoji, name, description, origin_story, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [item.user_id, item.emoji, item.name, item.description, item.origin_story, item.created_at]);
    }
    console.log('Museum items migrated!');

    // Migrate museums
    const museums = sqlite.prepare('SELECT * FROM museums').all();
    console.log(`Migrating ${museums.length} museums...`);
    for (const museum of museums) {
      await client.query(`
        INSERT INTO museums (user_id, share_slug, museum_name, tagline, is_public, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO NOTHING
      `, [museum.user_id, museum.share_slug, museum.museum_name, museum.tagline, museum.is_public, museum.created_at]);
    }
    console.log('Museums migrated!');

    // Migrate daily_activity
    const daily = sqlite.prepare('SELECT * FROM daily_activity').all();
    console.log(`Migrating ${daily.length} daily activities...`);
    for (const d of daily) {
      await client.query(`
        INSERT INTO daily_activity (user_id, activity_date, chat_count, journal_count)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, activity_date) DO NOTHING
      `, [d.user_id, d.activity_date, d.chat_count, d.journal_count]);
    }
    console.log('Daily activities migrated!');

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    client.release();
    await pgPool.end();
    sqlite.close();
  }
}

migrate();
