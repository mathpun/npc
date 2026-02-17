// Achievement definitions - safe to import in client components

export const ACHIEVEMENTS = [
  { id: 'first_steps', name: 'First Steps', description: 'Started your journey', emoji: '🌱', color: '#90EE90' },
  { id: 'first_chat', name: 'First Chat', description: 'Had your first conversation', emoji: '💬', color: '#87CEEB' },
  { id: 'deep_thinker', name: 'Deep Thinker', description: 'Completed 10 reflections', emoji: '🧠', color: '#DDA0DD' },
  { id: 'journal_keeper', name: 'Journal Keeper', description: 'Saved 5 journal entries', emoji: '📔', color: '#FFD700' },
  { id: 'goal_setter', name: 'Goal Setter', description: 'Set your first goal', emoji: '🎯', color: '#FF69B4' },
  { id: 'goal_getter', name: 'Goal Getter', description: 'Completed a goal', emoji: '🏆', color: '#FFA500' },
  { id: 'streak_3', name: 'On Fire', description: '3 day streak', emoji: '🔥', color: '#FF6B6B' },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', emoji: '⚡', color: '#FFD700' },
  { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', emoji: '👑', color: '#DDA0DD' },
  { id: 'world_explorer', name: 'World Explorer', description: 'Visited the Moltbook', emoji: '🌍', color: '#87CEEB' },
  { id: 'insight_hunter', name: 'Insight Hunter', description: 'Saved 10 insights', emoji: '💡', color: '#FFFACD' },
  { id: 'first_checkin', name: 'First Check-In', description: 'Completed your first daily check-in', emoji: '📝', color: '#98FB98' },
  { id: 'checkin_streak_7', name: 'Week of Reflection', description: '7 day check-in streak', emoji: '✨', color: '#FFB6C1' },
]

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
