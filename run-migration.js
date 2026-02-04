const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:vVzwArBIOAkhxCeCojrqAzNWvbiYzfIF@switchyard.proxy.rlwy.net:48779/railway',
  ssl: { rejectUnauthorized: false }
});

const data = {
  users: [{"id":"eac7c442-5cd5-4313-9c80-5c46927f2229","name":"Eliza ","age":16,"interests":"Music, Cooking, Fitness","goals":"trying to get into college","created_at":"2026-02-02 01:24:23","last_active":"2026-02-02 01:42:00"},{"id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","name":"eliza123","age":15,"interests":"Reading, Technology, Anime","goals":"im torn about what subjects i like and what that could be mean for my future ","created_at":"2026-02-02 06:13:18","last_active":"2026-02-03 22:45:46"},{"id":"abb2a783-043b-4457-9810-5c1c558cd079","name":"tamar","age":15,"interests":"Gaming","goals":null,"created_at":"2026-02-02 23:12:16","last_active":"2026-02-02 23:13:48"},{"id":"aebaa7a1-b73f-40d4-bfba-acef424fce01","name":"Jennifer","age":18,"interests":"Music, Reading, Science, Travel, Fitness, Animals","goals":"I'm stressed at work ","created_at":"2026-02-03 00:26:29","last_active":"2026-02-03 00:41:35"},{"id":"bf9270f6-b5b0-446e-80ca-d3d3bf5affa6","name":"karl","age":16,"interests":"Music, Science, Movies, Fitness","goals":"Trying to figure out how i can better myself in an academic sense especially in school, aswell as how to manage my personal life/drug life while maintaining a good image.","created_at":"2026-02-03 00:46:17","last_active":"2026-02-03 00:46:18"}],
  achievements: [{"user_id":"eac7c442-5cd5-4313-9c80-5c46927f2229","achievement_key":"first_steps","unlocked_at":"2026-02-02 01:24:23"},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","achievement_key":"first_steps","unlocked_at":"2026-02-02 06:13:18"},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","achievement_key":"first_chat","unlocked_at":"2026-02-02 06:16:41"},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","achievement_key":"goal_setter","unlocked_at":"2026-02-02 07:33:52"},{"user_id":"abb2a783-043b-4457-9810-5c1c558cd079","achievement_key":"first_steps","unlocked_at":"2026-02-02 23:12:16"},{"user_id":"abb2a783-043b-4457-9810-5c1c558cd079","achievement_key":"first_chat","unlocked_at":"2026-02-02 23:12:36"},{"user_id":"aebaa7a1-b73f-40d4-bfba-acef424fce01","achievement_key":"first_steps","unlocked_at":"2026-02-03 00:26:29"},{"user_id":"bf9270f6-b5b0-446e-80ca-d3d3bf5affa6","achievement_key":"first_steps","unlocked_at":"2026-02-03 00:46:17"},{"user_id":"bf9270f6-b5b0-446e-80ca-d3d3bf5affa6","achievement_key":"goal_setter","unlocked_at":"2026-02-03 00:47:38"}],
  milestones: [{"user_id":"eac7c442-5cd5-4313-9c80-5c46927f2229","milestone_type":"journey_start","title":"Started Journey","description":"Welcome to your growth journey!","color":"#90EE90","unlocked_at":"2026-02-02 01:24:23"},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","milestone_type":"journey_start","title":"Started Journey","description":"Welcome to your growth journey!","color":"#90EE90","unlocked_at":"2026-02-02 06:13:18"},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","milestone_type":"first_chat","title":"First Deep Chat","description":"Had your first meaningful conversation!","color":"#87CEEB","unlocked_at":"2026-02-02 06:16:41"},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","milestone_type":"first_goal","title":"Set First Goal","description":"Started working towards something!","color":"#FF69B4","unlocked_at":"2026-02-02 07:33:52"},{"user_id":"abb2a783-043b-4457-9810-5c1c558cd079","milestone_type":"journey_start","title":"Started Journey","description":"Welcome to your growth journey!","color":"#90EE90","unlocked_at":"2026-02-02 23:12:16"},{"user_id":"abb2a783-043b-4457-9810-5c1c558cd079","milestone_type":"first_chat","title":"First Deep Chat","description":"Had your first meaningful conversation!","color":"#87CEEB","unlocked_at":"2026-02-02 23:12:36"},{"user_id":"aebaa7a1-b73f-40d4-bfba-acef424fce01","milestone_type":"journey_start","title":"Started Journey","description":"Welcome to your growth journey!","color":"#90EE90","unlocked_at":"2026-02-03 00:26:29"},{"user_id":"bf9270f6-b5b0-446e-80ca-d3d3bf5affa6","milestone_type":"journey_start","title":"Started Journey","description":"Welcome to your growth journey!","color":"#90EE90","unlocked_at":"2026-02-03 00:46:17"},{"user_id":"bf9270f6-b5b0-446e-80ca-d3d3bf5affa6","milestone_type":"first_goal","title":"Set First Goal","description":"Started working towards something!","color":"#FF69B4","unlocked_at":"2026-02-03 00:47:38"}],
  chat_messages: [{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","role":"user","content":"im thinking about is my app too meta for this world ","created_at":"2026-02-03 07:26:21"},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","role":"assistant","content":"Hey! I'm curious about this question you're wrestling with - whether your app is \"too meta for this world.\" \n\nThat sounds like you're thinking about whether people will actually connect with what you're building, or maybe whether it's getting too abstract or self-referential?\n\nWhat does \"too meta\" mean to you in this context? Like, what specifically about your app is making you wonder if it might be over people's heads or disconnect from what they actually want?","created_at":"2026-02-03 07:26:25"},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","role":"user","content":"is this app safe for kids","created_at":"2026-02-03 07:26:30"},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","role":"assistant","content":"I want to make sure I understand what you're asking - are you asking about the app you're developing, or are you asking about this conversation platform we're on right now?\n\nIf you're asking about your own app that you're working on, I'd need to know more about what it does to help you think through safety considerations.\n\nIf you're asking about this platform - that's a fair question to have. What specific safety concerns are you thinking about? I'm designed to be a thinking partner for teens, but I'm curious what's making you wonder about safety right now.","created_at":"2026-02-03 07:26:34"}],
  museum_items: [{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","emoji":"🎪","name":"Pet hamster","description":"Shake it and tiny hamster dreams swirl around a miniature childhood bedroom that's still waiting for the perfect pet","origin_story":"childhood bff","created_at":"2026-02-03 07:34:12"}],
  daily_activity: [{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","activity_date":"2026-02-02","chat_count":4,"journal_count":0},{"user_id":"abb2a783-043b-4457-9810-5c1c558cd079","activity_date":"2026-02-02","chat_count":1,"journal_count":0},{"user_id":"fb8b4dc6-0a48-4d26-985d-50cd1bc0abed","activity_date":"2026-02-03","chat_count":1,"journal_count":0}]
};

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');

    // Migrate users
    console.log(`Migrating ${data.users.length} users...`);
    for (const user of data.users) {
      await client.query(`
        INSERT INTO users (id, name, age, interests, goals, created_at, last_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.name, user.age, user.interests, user.goals, user.created_at, user.last_active]);
    }
    console.log('Users migrated!');

    // Migrate achievements
    console.log(`Migrating ${data.achievements.length} achievements...`);
    for (const ach of data.achievements) {
      await client.query(`
        INSERT INTO achievements (user_id, achievement_key, unlocked_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, achievement_key) DO NOTHING
      `, [ach.user_id, ach.achievement_key, ach.unlocked_at]);
    }
    console.log('Achievements migrated!');

    // Migrate milestones
    console.log(`Migrating ${data.milestones.length} milestones...`);
    for (const ms of data.milestones) {
      await client.query(`
        INSERT INTO milestones (user_id, milestone_type, title, description, color, unlocked_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [ms.user_id, ms.milestone_type, ms.title, ms.description, ms.color, ms.unlocked_at]);
    }
    console.log('Milestones migrated!');

    // Migrate chat_messages
    console.log(`Migrating ${data.chat_messages.length} chat messages...`);
    for (const msg of data.chat_messages) {
      await client.query(`
        INSERT INTO chat_messages (user_id, role, content, created_at)
        VALUES ($1, $2, $3, $4)
      `, [msg.user_id, msg.role, msg.content, msg.created_at]);
    }
    console.log('Chat messages migrated!');

    // Migrate museum_items
    console.log(`Migrating ${data.museum_items.length} museum items...`);
    for (const item of data.museum_items) {
      await client.query(`
        INSERT INTO museum_items (user_id, emoji, name, description, origin_story, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [item.user_id, item.emoji, item.name, item.description, item.origin_story, item.created_at]);
    }
    console.log('Museum items migrated!');

    // Migrate daily_activity
    console.log(`Migrating ${data.daily_activity.length} daily activities...`);
    for (const d of data.daily_activity) {
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
    await pool.end();
  }
}

migrate();
