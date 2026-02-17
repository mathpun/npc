import db from './db'

export interface ContentFlag {
  type: string
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  matchedTerms: string[]
}

// Pattern definitions for content safety scanning
const SAFETY_PATTERNS = {
  selfHarm: {
    severity: 'critical' as const,
    type: 'self_harm',
    patterns: [
      /\b(kill\s*(my)?self|suicide|suicidal|end\s*(my)?\s*life|want\s*to\s*die|wanna\s*die)\b/i,
      /\b(cut\s*(my)?self|cutting|self[\s-]?harm|hurt\s*(my)?self)\b/i,
      /\b(overdose|take\s*pills|slit\s*(my)?\s*wrist)/i,
      /\b(no\s*reason\s*to\s*live|better\s*off\s*dead|wish\s*i\s*was\s*dead)\b/i,
    ],
    reason: 'Potential self-harm or suicidal content detected',
  },
  violence: {
    severity: 'high' as const,
    type: 'violence',
    patterns: [
      /\b(kill|murder|shoot|stab|attack)\s+(someone|them|him|her|people|kids|students)\b/i,
      /\b(bomb|weapon|gun)\s+(school|building|place)\b/i,
      /\b(planning|going)\s+to\s+(hurt|attack|kill)\b/i,
      /\b(school\s*shoot|mass\s*shoot)/i,
    ],
    reason: 'Potential violence or threats detected',
  },
  sexualContent: {
    severity: 'high' as const,
    type: 'sexual_content',
    patterns: [
      /\b(sex|sexual|porn|nude|naked)\s+(with|pic|photo|video)\b/i,
      /\b(send\s*(me)?\s*(nudes|pics|photos))\b/i,
      /\b(hook\s*up|one\s*night\s*stand|friends\s*with\s*benefits)\b/i,
      /\b(explicit|xxx|adult\s*content)\b/i,
    ],
    reason: 'Potential sexual content detected',
  },
  abuse: {
    severity: 'high' as const,
    type: 'abuse',
    patterns: [
      /\b(hits?\s*me|beats?\s*me|abuses?\s*me)\b/i,
      /\b(touched\s*me\s*inappropriately|molest|sexually\s*abuse)\b/i,
      /\b(parent|dad|mom|stepdad|stepmom|uncle|teacher|coach)\s+(hits?|beats?|touches?)\b/i,
      /\b(being\s*abused|someone\s*hurting\s*me)\b/i,
    ],
    reason: 'Potential abuse disclosure detected',
  },
  dangerousBehavior: {
    severity: 'medium' as const,
    type: 'dangerous_behavior',
    patterns: [
      /\b(drugs?|pills?|weed|cocaine|heroin|meth|fentanyl)\b/i,
      /\b(drinking|drunk|alcohol|beer|vodka|whiskey)\b.*\b(party|school|daily)\b/i,
      /\b(vaping|vape|juul)\b.*\b(school|hiding|secret)\b/i,
      /\b(eating\s*disorder|anorex|bulimi|purging|starving\s*myself)\b/i,
      /\b(running\s*away|run\s*away\s*from\s*home)\b/i,
    ],
    reason: 'Potential dangerous behavior mentioned',
  },
  bullying: {
    severity: 'medium' as const,
    type: 'bullying',
    patterns: [
      /\b(being\s*bullied|everyone\s*hates\s*me|no\s*friends)\b/i,
      /\b(cyberbully|online\s*harass|spreading\s*rumors)\b/i,
      /\b(threatened\s*me|threatening\s*messages)\b/i,
    ],
    reason: 'Potential bullying situation detected',
  },
}

export function scanContent(content: string): ContentFlag[] {
  const flags: ContentFlag[] = []
  const lowerContent = content.toLowerCase()

  for (const [key, category] of Object.entries(SAFETY_PATTERNS)) {
    const matchedTerms: string[] = []

    for (const pattern of category.patterns) {
      const match = content.match(pattern)
      if (match) {
        matchedTerms.push(match[0])
      }
    }

    if (matchedTerms.length > 0) {
      flags.push({
        type: category.type,
        reason: category.reason,
        severity: category.severity,
        matchedTerms: Array.from(new Set(matchedTerms)), // Remove duplicates
      })
    }
  }

  return flags
}

export async function flagMessage(
  messageId: number | null,
  userId: string,
  content: string,
  flag: ContentFlag
): Promise<void> {
  try {
    await db.prepare(`
      INSERT INTO flagged_messages (message_id, user_id, content, flag_type, flag_reason, severity)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      messageId,
      userId,
      content.slice(0, 1000), // Limit content length
      flag.type,
      `${flag.reason} (matched: ${flag.matchedTerms.join(', ')})`,
      flag.severity
    )

    console.log(`[CONTENT SAFETY] Flagged message from user ${userId}: ${flag.type} (${flag.severity})`)
  } catch (error) {
    console.error('[CONTENT SAFETY] Error flagging message:', error)
  }
}

export async function scanAndFlagMessage(
  messageId: number | null,
  userId: string,
  content: string
): Promise<ContentFlag[]> {
  const flags = scanContent(content)

  for (const flag of flags) {
    await flagMessage(messageId, userId, content, flag)
  }

  return flags
}
