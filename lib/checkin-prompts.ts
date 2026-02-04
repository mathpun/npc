export interface CheckinContext {
  name: string
  age: number
  interests: string
  goals: string | null
  recentTopics: string[]
  dayOfWeek: string
  lastMood: string | null
}

export function buildCheckinPrompt(context: CheckinContext): string {
  const topicsSection = context.recentTopics.length > 0
    ? `Recent topics they've discussed: ${context.recentTopics.join(', ')}`
    : 'No recent chat history'

  const moodSection = context.lastMood
    ? `Last check-in mood: ${context.lastMood}`
    : 'This is their first check-in'

  return `You are helping create personalized daily check-in questions for a teen's journal app.

User: ${context.name}, ${context.age} years old
Interests: ${context.interests}
Current goals: ${context.goals || 'Not specified'}
${topicsSection}
Day of week: ${context.dayOfWeek}
${moodSection}

Generate exactly 2-3 thoughtful, personalized journal questions for this teen's daily check-in.

Requirements:
- Be warm and conversational (not clinical or formal)
- Reference their interests when relevant and natural
- Mix reflection questions (how was today) with forward-looking ones (what's ahead)
- Keep questions answerable in 1-3 sentences
- Feel age-appropriate and relatable for a ${context.age} year old
- Don't be preachy or lecturing
- Make at least one question specific to their interests or recent topics

Format your response as a JSON array of strings, like:
["Question 1?", "Question 2?", "Question 3?"]

Only output the JSON array, nothing else.`
}

export function buildCheckinSummaryPrompt(
  name: string,
  questions: string[],
  responses: string[],
  mood: string | null
): string {
  const qaPairs = questions.map((q, i) => `Q: ${q}\nA: ${responses[i] || '(no response)'}`).join('\n\n')

  return `Summarize this teen's daily check-in in 1-2 sentences. Be warm and highlight any notable reflections or moods.

Name: ${name}
${mood ? `Mood: ${mood}` : ''}

Check-in responses:
${qaPairs}

Write a brief, supportive summary that captures the essence of their day. Output only the summary, nothing else.`
}

export const MOOD_OPTIONS = [
  { emoji: '😫', label: 'rough', value: 'rough' },
  { emoji: '😕', label: 'meh', value: 'meh' },
  { emoji: '😐', label: 'okay', value: 'okay' },
  { emoji: '🙂', label: 'good', value: 'good' },
  { emoji: '😄', label: 'great', value: 'great' },
]

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]
