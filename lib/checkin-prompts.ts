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

Generate exactly 1 thoughtful, personalized question for this teen's daily check-in.

Requirements:
- Be FUN! Make them actually want to answer
- Warm and playful, like a curious friend asking
- Can be a little silly or creative ("if today was a song, what would it be?")
- Reference their interests when relevant and natural
- Keep it answerable in 1-3 sentences
- Feel age-appropriate and relatable for a ${context.age} year old
- Don't be preachy or boring - bring the joy!
- Make it specific, interesting, and maybe make them smile

Format your response as a JSON array with one string, like:
["Your question here?"]

Only output the JSON array, nothing else.`
}

export function buildCheckinSummaryPrompt(
  name: string,
  questions: string[],
  responses: string[],
  mood: string | null
): string {
  const qaPairs = questions.map((q, i) => `Q: ${q}\nA: ${responses[i] || '(no response)'}`).join('\n\n')

  return `Summarize this teen's daily check-in in 1-2 sentences. Be warm, playful, and make them feel seen!

Name: ${name}
${mood ? `Mood: ${mood}` : ''}

Check-in responses:
${qaPairs}

Write a brief, joyful summary that celebrates them and captures their vibe today. Be like a supportive friend who genuinely gets it. Maybe throw in a little humor or warmth. Output only the summary, nothing else.`
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
